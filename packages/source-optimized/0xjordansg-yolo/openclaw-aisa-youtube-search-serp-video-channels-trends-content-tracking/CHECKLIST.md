# Publish Checklist

Guide: `docs/source-optimized-manual-acceptance.md`

## Static checks

- `SKILL.md` contains `Use when:` wording and runtime-only release notes.
- Runtime files retained: `scripts/youtube_client.py`, `SKILL.md`.
- Non-runtime files removed: `README.md`, `_meta.json`, `__pycache__/`.

## Functional checks

- `python3 scripts/youtube_client.py --help`
- `python3 -m py_compile scripts/youtube_client.py`

## Manual runtime checks

- `export AISA_API_KEY="..."`
- `python3 scripts/youtube_client.py search --query "AI agents tutorial" --country us --lang en`
- `python3 scripts/youtube_client.py top-videos --query "OpenAI" --count 3 --country us`
- `python3 scripts/youtube_client.py competitor --name "OpenAI" --topic "agents" --country us`
- Confirm the responses contain videos, top video entries, or channel research results.

## Publish

```bash
clawhub build
clawhub publish
clawhub status
```
