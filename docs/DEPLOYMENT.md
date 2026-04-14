# Deployment Guide

## GitHub Pages

1. Push the repository to `https://github.com/xiaofengxyz/ClawSkillsScout`.
2. In GitHub repository settings:
   - open `Settings -> Pages`
   - set source to `GitHub Actions`
3. The workflow in `.github/workflows/deploy.yml` will:
   - scrape ClawHub
   - build the static site
   - publish the `dist/` artifact to GitHub Pages
4. Scheduled refresh runs daily at `02:17 UTC`, which is `10:17` Beijing time.

## Server Deployment

Assumed target path: `/opt/ClawSkillsScout`

```bash
git clone https://github.com/xiaofengxyz/ClawSkillsScout.git /opt/ClawSkillsScout
cd /opt/ClawSkillsScout
npm install
bash deploy/deploy-server.sh
```

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
- Put a reverse proxy such as Nginx in front of the built files if you want a separate server-hosted mirror.

## Known Limits

- ClawHub global skill discovery is less reliable than account-profile discovery.
- AISA detection is heuristic and based on rendered page data and README text.
- Some ClawHub pages may intermittently timeout; the scraper already retries, but logs should be monitored.
