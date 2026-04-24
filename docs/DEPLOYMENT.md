# Deployment Guide

## GitHub Pages

1. Push the repository to `https://github.com/xiaofengxyz/ClawSkillsScout`.
2. In GitHub repository settings:
   - open `Settings -> Pages`
   - set source to `GitHub Actions`
3. The workflow in `.github/workflows/deploy.yml` will:
   - run `npm run pipeline:aisa-analysis` on `push` to `master` for the main dashboard refresh
   - run `npm run pipeline:scheduled-analysis` on `schedule` and `workflow_dispatch` for the full report-refresh chain
   - build the static site
   - publish the `dist/` artifact to GitHub Pages
4. Scheduled refresh runs daily at `02:17 UTC`, which is `10:17` Beijing time.

## Server Deployment

Assumed target path: `/opt/ClawSkillsScout`

```bash
git clone https://github.com/xiaofengxyz/ClawSkillsScout.git /opt/ClawSkillsScout
cd /opt/ClawSkillsScout
npm install
DEPLOY_WEB_ROOT=/var/www/flyingeye.cn/ClawSkillsScout bash deploy/deploy-server.sh
```

说明：

- `deploy/deploy-server.sh` 现在不仅会构建站点，也会把 `dist/` 同步到真正对外服务的站点目录。
- 如果不传 `DEPLOY_WEB_ROOT`，脚本会尝试自动识别常见的 Nginx 静态目录；识别不到时会直接失败，避免“构建成功但线上仍旧是旧文件”的假成功。
- 如需改成全量报告刷新，可传 `BUILD_COMMAND="npm run pipeline:scheduled-analysis"`。

## Daily Refresh On Server

Install the provided cron entry:

```bash
crontab deploy/clawskillsscout.cron
```

Or append its content manually:

```bash
crontab -l
cat deploy/clawskillsscout.cron
```

## Recommended Production Flow

- Use the server task to rebuild and log scrape history locally.
- Push successful updates to GitHub so Pages stays in sync.
- Point Nginx or another static-file server at the directory passed through `DEPLOY_WEB_ROOT`, so the public mirror serves the built `dist/` contents instead of the repo root.

## Known Limits

- ClawHub global skill discovery is less reliable than account-profile discovery.
- AISA detection is heuristic and based on rendered page data and README text.
- Some ClawHub pages may intermittently timeout; the scraper already retries, but logs should be monitored.
