# Publish Checklist

Guide: `docs/source-optimized-manual-acceptance.md`

## Static checks

- `SKILL.md` contains `Use when:` wording and runtime-only release notes.
- Runtime files retained: `SKILL.md`, `LICENSE.txt`.
- Non-runtime files removed: `_meta.json`, `__pycache__/`.

## Functional checks

- Review curl examples against the documented endpoint.

## Manual runtime checks

- `export AISA_API_KEY="..."`
- `curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=machine+learning+tutorial" -H "Authorization: Bearer $AISA_API_KEY"`
- `curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+news&gl=us&hl=en" -H "Authorization: Bearer $AISA_API_KEY"`
- `curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=python+tutorial&sp=EgIQAQ%3D%3D" -H "Authorization: Bearer $AISA_API_KEY"`
- Confirm each response contains `videos`, `search_results`, or equivalent result entries.

## Publish

```bash
clawhub build
clawhub publish
clawhub status
```
