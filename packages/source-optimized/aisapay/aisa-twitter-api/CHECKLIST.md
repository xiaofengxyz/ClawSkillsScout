# Publish Checklist

Guide: `docs/source-optimized-manual-acceptance.md`

## Static checks

- `SKILL.md` contains `Use when:` wording and runtime-only release notes.
- Runtime files retained: `scripts/twitter_client.py`, `scripts/twitter_oauth_client.py`, `references/post_twitter.md`.
- Non-runtime files removed: `README.md`, `_meta.json`, `__pycache__/`.

## Functional checks

- `python3 scripts/twitter_client.py --help`
- `python3 scripts/twitter_oauth_client.py --help`
- `python3 -m py_compile scripts/twitter_client.py scripts/twitter_oauth_client.py`

## Manual runtime checks

- `export AISA_API_KEY="..."`
- `python3 scripts/twitter_client.py user-info --username openai`
- `python3 scripts/twitter_client.py trends`
- `python3 scripts/twitter_oauth_client.py authorize`
- Open the returned `authorization_url` in a browser and complete consent with the test account.
- `python3 scripts/twitter_oauth_client.py post --text "skillGet manual acceptance text post"`
- `python3 scripts/twitter_oauth_client.py post --text "skillGet manual acceptance media post" --media-file ./test-image.png`
- Confirm both posts appear on the authorized account timeline.
- Delete the test posts after validation if needed.

## Publish

```bash
clawhub build
clawhub publish
clawhub status
```
