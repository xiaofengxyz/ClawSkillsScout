#!/usr/bin/env python3
"""
使用 HTML 中的原始长 slug + 用户名
"""

import csv

# 读取正确提取的数据（含有完整长 slug）
html_data = []  # [(author, skill_name, href, full_url, ai_type)]

with open('clawhub-hash-format-urls.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        author = row['Author']
        skill_name = row['SkillName']
        full_url = row['FullURL']
        ai_type = row.get('AIType', '')
        
        # 提取 slug (最后一部分)
        slug = full_url.split('/')[-1]
        
        html_data.append({
            'author': author,
            'skill_name': skill_name,
            'slug': slug,
            'full_url': full_url,
            'ai_type': ai_type
        })

print(f"加载了 {len(html_data)} 个技能数据")

# 创建查找表：(author, skill_name) -> (slug, ai_type)
skill_map = {}
for item in html_data:
    key = (item['author'], item['skill_name'].strip())
    skill_map[key] = {
        'slug': item['slug'],
        'ai_type': item['ai_type']
    }

# 读取原始 CSV
original_rows = []
try:
    with open('clawhub-projects.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        original_rows = list(reader)
except UnicodeDecodeError:
    # 如果UTF-8失败，尝试其他编码
    with open('clawhub-projects.csv', 'r', encoding='gbk') as f:
        reader = csv.DictReader(f)
        original_rows = list(reader)

print(f"加载了 {len(original_rows)} 条原始记录")

# 更新 URL：使用用户名 + HTML 中的长 slug
matched = 0
fallback = 0

for row in original_rows:
    author = row.get('Author', '')
    name = row.get('Name', '').strip()
    
    # 精确匹配
    if (author, name) in skill_map:
        slug = skill_map[(author, name)]['slug']
        ai_type = skill_map[(author, name)]['ai_type']
        new_url = f"https://clawhub.ai/{author}/{slug}"
        row['URL'] = new_url
        row['URLPath'] = f"{author}/{slug}"
        if 'AI Type' not in row:
            row['AI Type'] = ai_type
        matched += 1
    else:
        # 尝试部分匹配（名称可能有轻微差异）
        found = False
        for (h_author, h_name), skill_info in skill_map.items():
            if h_author == author and name.lower() in h_name.lower():
                h_slug = skill_info['slug']
                h_ai_type = skill_info['ai_type']
                new_url = f"https://clawhub.ai/{author}/{h_slug}"
                row['URL'] = new_url
                row['URLPath'] = f"{author}/{h_slug}"
                if 'AI Type' not in row:
                    row['AI Type'] = h_ai_type
                matched += 1
                found = True
                break
        
        if not found:
            # 保留旧 URL
            if 'AI Type' not in row:
                row['AI Type'] = ''
            fallback += 1

print(f"\n精确匹配: {matched}")
print(f"保留原 URL: {fallback}")

# 保存
output_file = "clawhub-projects-final-urls.csv"

try:
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        if original_rows:
            # 确保所有行都有 AI Type 字段
            for row in original_rows:
                if 'AI Type' not in row:
                    row['AI Type'] = ''
            
            # 获取所有字段名，包括新增的 AI Type
            fieldnames = list(original_rows[0].keys())
            if 'AI Type' not in fieldnames:
                fieldnames.append('AI Type')
            
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(original_rows)
    print(f"\n✅ 已保存到: {output_file}")
except PermissionError:
    # 文件被占用，保存到临时文件
    output_file = "clawhub-projects-final-urls-new.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        if original_rows:
            # 确保所有行都有 AI Type 字段
            for row in original_rows:
                if 'AI Type' not in row:
                    row['AI Type'] = ''
            
            # 获取所有字段名，包括新增的 AI Type
            fieldnames = list(original_rows[0].keys())
            if 'AI Type' not in fieldnames:
                fieldnames.append('AI Type')
            
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(original_rows)
    print(f"\n⚠️ 原文件被占用，已保存到: {output_file}")
            writer.writerows(original_rows)
    print(f"\n⚠️ 原文件被占用，已保存到: {output_file}")

# 显示几个例子，对比 HTML 中的数据
print("\n📋 示例对比（HTML 中的数据 vs CSV 中的链接）:")
print("=" * 90)

with open(output_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i < 5:
            author = row['Author']
            name = row['Name'][:40]
            url = row['URL']
            
            # 查找对应的 HTML 数据
            key = (author, row['Name'].strip())
            if key in skill_map:
                html_slug = skill_map[key]
                html_url = f"https://clawhub.ai/{author}/{html_slug}"
            else:
                html_url = "N/A"
            
            print(f"\n{i+1}. {author} - {name}")
            print(f"   CSV URL: {url}")
            print(f"   HTML原始: {html_url}")
            match = "✓" if url == html_url else "✗"
            print(f"   {match}")
        else:
            break
