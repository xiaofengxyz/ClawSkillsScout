#!/usr/bin/env python3
"""
使用 Playwright 正确加载页面并等待技能卡片加载完成
"""

import asyncio
from playwright.async_api import async_playwright
import csv
import json
from pathlib import Path
from bs4 import BeautifulSoup
import re
from contextlib import suppress

AUTHOR_PAGE_TIMEOUT_MS = 30000
SKILL_PAGE_TIMEOUT_MS = 20000
LIST_PAGE_EXTRA_WAIT_MS = 1500
SKILL_RENDER_MAX_WAIT_MS = 4000
HTML_STABLE_ROUNDS = 2
SKILL_CHECK_CONCURRENCY = 5
ACCOUNTS_PATH = Path("config/accounts.json")
OUTPUT_FILE = Path("clawhub-hash-format-urls.csv")


async def wait_for_dynamic_html(page, max_wait_ms=SKILL_RENDER_MAX_WAIT_MS, interval_ms=400):
    """
    等待动态页面渲染趋于稳定。

    逻辑：
    1. 优先等待 networkidle，但不强依赖它，避免长连接页面一直卡住。
    2. 轮询 page.content()，如果连续多次 HTML 长度不再变化，认为主要内容已渲染完。
    3. 如果提前出现 AISA_API_KEY，立即返回，避免无意义等待。
    """
    with suppress(Exception):
        await page.wait_for_load_state('networkidle', timeout=min(max_wait_ms, 2500))

    last_len = -1
    stable_rounds = 0
    elapsed = 0
    latest_html = ""

    while elapsed <= max_wait_ms:
        latest_html = await page.content()
        html_lower = latest_html.lower()
        if 'aisa_api_key' in html_lower:
            return latest_html

        current_len = len(latest_html)
        if current_len == last_len:
            stable_rounds += 1
            if stable_rounds >= HTML_STABLE_ROUNDS:
                return latest_html
        else:
            stable_rounds = 0
            last_len = current_len

        await page.wait_for_timeout(interval_ms)
        elapsed += interval_ms

    return latest_html

async def check_aisa_api_usage(browser, skill_url, semaphore):
    """
    检查skill页面是否使用了AISA API
    """
    async with semaphore:
        page = await browser.new_page()
        try:
            await page.goto(skill_url, wait_until='domcontentloaded', timeout=SKILL_PAGE_TIMEOUT_MS)
            html = await wait_for_dynamic_html(page)

            # 检查是否包含 AISA_API_KEY
            if 'aisa_api_key' in html.lower():
                return 'AISAAPI'
            return ''
        except Exception as e:
            print(f"    ⚠️ 检查API时出错: {skill_url} -> {e}")
            return ''
        finally:
            await page.close()


async def load_and_extract_skills(browser, author):
    """
    加载用户页面，等待技能卡片加载，然后提取链接
    """
    print(f"\n📄 正在处理: {author}")

    page = await browser.new_page()

    try:
        url = f"https://clawhub.ai/u/{author}"

        await page.goto(url, wait_until='domcontentloaded', timeout=AUTHOR_PAGE_TIMEOUT_MS)

        try:
            await page.wait_for_selector('a[href^="/"] h3', timeout=10000)
            print(f"  ✓ 检测到技能卡片")
        except Exception:
            print(f"  ⚠️ 未检测到技能卡片，继续尝试抓取已渲染内容...")

        await page.wait_for_timeout(LIST_PAGE_EXTRA_WAIT_MS)
        html = await wait_for_dynamic_html(page, max_wait_ms=2500, interval_ms=300)

        soup = BeautifulSoup(html, 'html.parser')
        skills = []

        for link in soup.find_all('a', href=True):
            href = link.get('href', '')

            # 匹配 /hash/slug 格式
            if re.match(r'^/[a-z0-9]{32,}/[a-z0-9\-]+', href):
                title = link.find('h3')
                if title:
                    skill_name = title.get_text(strip=True)
                    skills.append({
                        'href': href,
                        'name': skill_name
                    })

        seen = set()
        unique_skills = []
        for skill in skills:
            if skill['href'] not in seen:
                seen.add(skill['href'])
                unique_skills.append(skill)

        print(f"  ✓ 找到 {len(unique_skills)} 个技能")

        print(f"  🔍 并发检查 AISA API 使用情况...")
        semaphore = asyncio.Semaphore(SKILL_CHECK_CONCURRENCY)
        tasks = [
            check_aisa_api_usage(browser, f"https://clawhub.ai{skill['href']}", semaphore)
            for skill in unique_skills
        ]
        ai_types = await asyncio.gather(*tasks)

        for skill, ai_type in zip(unique_skills, ai_types):
            skill['ai_type'] = ai_type

        return unique_skills

    except Exception as e:
        print(f"  ❌ 错误: {e}")
        return []
    finally:
        await page.close()

async def main():
    authors = json.loads(ACCOUNTS_PATH.read_text(encoding='utf-8'))
    
    print("=" * 70)
    print("🔗 提取所有用户的技能链接 (改进版)")
    print("=" * 70)
    
    all_skills = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        try:
            for author in authors:
                skills = await load_and_extract_skills(browser, author)
                all_skills[author] = skills
        finally:
            await browser.close()
    
    # 保存到 CSV
    
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['Author', 'SkillName', 'FullURL', 'AIType'])
        writer.writeheader()
        
        total = 0
        for author in sorted(all_skills.keys()):
            skills = all_skills[author]
            for skill in skills:
                url = f"https://clawhub.ai{skill['href']}"
                writer.writerow({
                    'Author': author,
                    'SkillName': skill['name'],
                    'FullURL': url,
                    'AIType': skill.get('ai_type', '')
                })
                total += 1
    
    print(f"\n" + "=" * 70)
    print(f"✅ 已保存 {total} 个技能到: {OUTPUT_FILE}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
