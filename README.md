# Claw Skills Scout

Claw Skills Scout pulls ClawHub skills and plugins, detects probable AISA API usage, flags suspicious packages, and publishes a searchable dashboard to GitHub Pages.

## Scope

- Track known ClawHub accounts from `config/accounts.json`
- Discover extra items from the public `skills` and `plugins` catalogs
- Extract:
  - name
  - description
  - version
  - ClawHub link
  - download count
  - suspicious status
  - probable AISA API usage
- Generate a static dashboard in `dist/`
- Deploy daily through GitHub Actions

## Local usage

```bash
npm install
npm run scrape
npm run dev
```

Production build:

```bash
npm run build
```

## Deployment

- GitHub Pages is configured by `.github/workflows/deploy.yml`
- Server-side rebuild helper lives in `deploy/deploy-server.sh`
- Daily refresh is triggered by the scheduled GitHub Action

## Notes

- AISA detection is heuristic and currently checks rendered page content and extracted README text.
- Global traversal currently scans the first few public catalog pages. This can be extended after we verify pagination behavior and possible hidden APIs.
