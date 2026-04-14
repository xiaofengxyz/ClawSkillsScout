# Publish Checklist

Guide: `docs/source-optimized-manual-acceptance.md`

## Static checks

- `SKILL.md` contains `Use when:` wording and runtime-only release notes.
- Runtime files retained: `scripts/twitter_client.py`, `scripts/twitter_oauth_client.py`, `scripts/twitter_engagement_client.py`, `references/post_twitter.md`, `references/engage_twitter.md`.
- Non-runtime files removed: `README.md`, `_meta.json`, `__pycache__/`.

## Functional checks

- `python3 scripts/twitter_client.py --help`
- `python3 scripts/twitter_oauth_client.py --help`
- `python3 scripts/twitter_engagement_client.py --help`
- `python3 -m py_compile scripts/twitter_client.py scripts/twitter_oauth_client.py scripts/twitter_engagement_client.py`

## Manual runtime checks

- `export AISA_API_KEY="..."`
- `python3 scripts/twitter_client.py user-info --username openai`
- `python3 scripts/twitter_oauth_client.py authorize`
- Open the returned `authorization_url` in a browser and complete consent with the test account.
- `python3 scripts/twitter_oauth_client.py post --text "skillGet manual acceptance text post"`
- `python3 scripts/twitter_oauth_client.py post --text "skillGet manual acceptance media post" --media-file ./test-image.png`
- `python3 scripts/twitter_engagement_client.py list-tweets --user @OpenAI --limit 2`
- `python3 scripts/twitter_engagement_client.py like-tweet --tweet-id <TEST_TWEET_ID> --username OpenAI --label "manual acceptance"`
- `python3 scripts/twitter_engagement_client.py unlike-tweet --tweet-id <TEST_TWEET_ID> --username OpenAI --label "manual acceptance"`
- `python3 scripts/twitter_engagement_client.py follow-user-id --target-user-id <TEST_USER_ID> --username <TEST_USERNAME>`
- `python3 scripts/twitter_engagement_client.py unfollow-user-id --target-user-id <TEST_USER_ID> --username <TEST_USERNAME>`
- Confirm the post, like/unlike, and follow/unfollow side effects on X, then clean up if needed.

## Publish

```bash
clawhub build
clawhub publish
clawhub status
```
