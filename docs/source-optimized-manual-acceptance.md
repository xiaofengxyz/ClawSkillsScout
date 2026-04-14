# Source-Optimized Manual Acceptance

This guide is the final manual validation layer for the optimized Suspicious packages in `packages/source-optimized/`.

Run it after:

- `npm run verify:source-optimized`
- `AISA_API_KEY=... npm run live-test:source-optimized`

## Shared setup

```bash
export AISA_API_KEY="YOUR_AISA_API_KEY"
```

For Twitter write-path validation, use a dedicated test X/Twitter account instead of a production account.

## Acceptance rules

- Read-only commands are used to confirm the optimized package preserved its original functionality.
- OAuth, post, like, and follow commands create real side effects.
- Delete or undo test tweets, likes, and follows after validation.
- Record the final result in the package-local `CHECKLIST.md`.

## Package groups

### Twitter read only

Packages:

- `0xjordansg-yolo/openclaw-twitter`

Manual acceptance:

1. Generate an OAuth authorization URL.
2. Open the URL in a browser and confirm the X login/consent screen loads.
3. Publish a short text post from the authorized test account.
4. Publish a text + media post with a local test image.
5. Confirm the posts appear, then delete them if needed.

### Twitter read + post

Packages:

- `aisapay/aisa-twitter-api`

Manual acceptance:

1. Generate an OAuth authorization URL.
2. Open the URL in a browser and complete consent with the test account.
3. Publish a short text post.
4. Publish a text + media post.
5. Confirm the posts appear, then delete them if needed.

### Twitter read + post + engage

Packages:

- `aisadocs/openclaw-twitter-post-engage`
- `karensheng/x-intelligence-automation`
- `chaimengphp/openclaw-aisa-twitter`

Manual acceptance:

1. Generate an OAuth authorization URL.
2. Open the URL in a browser and complete consent with the test account.
3. Publish a short text post.
4. Publish a text + media post.
5. Run a read-only engagement listing command.
6. Like a known test tweet.
7. Unlike the same tweet.
8. Follow a controlled test account.
9. Unfollow the same account.
10. Confirm all side effects on X, then clean up if needed.

### YouTube search only

Packages:

- `0xjordansg-yolo/openclaw-aisa-youtube`
- `0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking`

Manual acceptance:

1. Run a normal search query.
2. Run a locale-filtered query with `gl` and `hl`.
3. Run a second query with a different topic to confirm stable response shape.
4. Confirm results contain video or search result entries.

## Publish gate

A package is ready for manual `clawhub publish` when:

- static verification passed
- live read-path verification passed
- the package-local checklist has all manual runtime items checked off
- the final directory still contains only runtime files plus `CHECKLIST.md`
