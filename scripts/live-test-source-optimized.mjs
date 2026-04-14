import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const optimizedRoot = path.join(root, 'packages', 'source-optimized');
const reportPath = path.join(root, 'artifacts', 'live-test-source-optimized.json');

const apiKey = process.env.AISA_API_KEY;
if (!apiKey) {
  console.error('AISA_API_KEY is required.');
  process.exit(1);
}

const PACKAGE_CASES = [
  {
    package: '0xjordansg-yolo/openclaw-twitter',
    tests: [
      {
        name: 'twitter-read-smoke',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient

def ok(payload):
    if not isinstance(payload, dict):
        return False
    if payload.get("success") is True:
        return True
    if str(payload.get("status", "")).lower() == "success":
        return True
    return payload.get("code") in {0, 200}

summary = None
for _ in range(3):
    client = TwitterClient()
    user = client.user_info("openai")
    trends = client.trends(1)
    summary = {
        "user_info_ok": ok(user),
        "trends_ok": ok(trends),
        "user_data_keys": sorted(list((user.get("data") or {}).keys()))[:8] if isinstance(user.get("data"), dict) else [],
        "trends_top_level_keys": sorted(list(trends.keys()))[:8] if isinstance(trends, dict) else [],
    }
    if summary["user_info_ok"] and summary["trends_ok"]:
        break

print(json.dumps(summary, ensure_ascii=False))
if not all([summary["user_info_ok"], summary["trends_ok"]]):
    sys.exit(1)
`,
      },
    ],
    pendingManual: ['OAuth authorization link acceptance', 'Real post publish with an authorized Twitter account'],
  },
  {
    package: 'aisapay/aisa-twitter-api',
    tests: [
      {
        name: 'twitter-read-smoke',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient

def ok(payload):
    if not isinstance(payload, dict):
        return False
    if payload.get("success") is True:
        return True
    if str(payload.get("status", "")).lower() == "success":
        return True
    return payload.get("code") in {0, 200}

summary = None
for _ in range(3):
    client = TwitterClient()
    user = client.user_info("openai")
    trends = client.trends(1)
    summary = {
        "user_info_ok": ok(user),
        "trends_ok": ok(trends),
        "user_data_keys": sorted(list((user.get("data") or {}).keys()))[:8] if isinstance(user.get("data"), dict) else [],
        "trends_top_level_keys": sorted(list(trends.keys()))[:8] if isinstance(trends, dict) else [],
    }
    if summary["user_info_ok"] and summary["trends_ok"]:
        break

print(json.dumps(summary, ensure_ascii=False))
if not all([summary["user_info_ok"], summary["trends_ok"]]):
    sys.exit(1)
`,
      },
      {
        name: 'twitter-authorize-link',
        kind: 'python',
        script: `
import json
import os
import sys
sys.path.insert(0, "scripts")
import twitter_oauth_client as toc

key = os.environ["AISA_API_KEY"]
summary = None
for _ in range(3):
    result = toc.send_json_request(
        "https://api.aisa.one/apis/v1/twitter/auth_twitter",
        {"aisa_api_key": key},
        timeout=toc.DEFAULT_TIMEOUT,
        aisa_api_key=key,
    )
    auth_url = (result.get("data") or {}).get("auth_url") if isinstance(result, dict) else None
    summary = {
        "code": result.get("code"),
        "has_authorization_url": bool(auth_url),
        "authorization_url_prefix": auth_url[:64] if auth_url else None,
    }
    if summary["has_authorization_url"]:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["has_authorization_url"]:
    sys.exit(1)
`,
      },
    ],
    pendingManual: ['Complete browser OAuth approval', 'Real post publish with an authorized Twitter account'],
  },
  {
    package: 'aisadocs/openclaw-twitter-post-engage',
    tests: [
      {
        name: 'twitter-read-smoke',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient

def ok(payload):
    if not isinstance(payload, dict):
        return False
    if payload.get("success") is True:
        return True
    if str(payload.get("status", "")).lower() == "success":
        return True
    return payload.get("code") in {0, 200}

summary = None
for _ in range(3):
    client = TwitterClient()
    user = client.user_info("openai")
    trends = client.trends(1)
    summary = {
        "user_info_ok": ok(user),
        "trends_ok": ok(trends),
    }
    if all(summary.values()):
        break
print(json.dumps(summary, ensure_ascii=False))
if not all(summary.values()):
    sys.exit(1)
`,
      },
      {
        name: 'twitter-authorize-link',
        kind: 'python',
        script: `
import json
import os
import sys
sys.path.insert(0, "scripts")
import twitter_oauth_client as toc

key = os.environ["AISA_API_KEY"]
summary = None
for _ in range(3):
    result = toc.send_json_request(
        "https://api.aisa.one/apis/v1/twitter/auth_twitter",
        {"aisa_api_key": key},
        timeout=toc.DEFAULT_TIMEOUT,
        aisa_api_key=key,
    )
    auth_url = (result.get("data") or {}).get("auth_url") if isinstance(result, dict) else None
    summary = {
        "code": result.get("code"),
        "has_authorization_url": bool(auth_url),
        "authorization_url_prefix": auth_url[:64] if auth_url else None,
    }
    if summary["has_authorization_url"]:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["has_authorization_url"]:
    sys.exit(1)
`,
      },
      {
        name: 'engagement-read-path',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient
from twitter_engagement_client import resolve_user, fetch_latest_tweets

summary = None
for _ in range(2):
    client = TwitterClient()
    resolved = resolve_user(client, "openai")
    if not resolved.get("ok"):
        summary = {
            "resolve_ok": False,
            "tweets_ok": False,
            "tweet_count": 0,
            "resolved_user": resolved.get("resolved_user", {}),
        }
        continue
    tweets = fetch_latest_tweets(client, resolved["resolved_user"]["username"], 2)
    summary = {
        "resolve_ok": resolved.get("ok", False),
        "tweets_ok": tweets.get("ok", False),
        "tweet_count": len(tweets.get("tweets", [])),
        "resolved_user": resolved.get("resolved_user", {}),
    }
    if summary["resolve_ok"] and summary["tweets_ok"] and summary["tweet_count"] >= 1:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["resolve_ok"] or not summary["tweets_ok"] or summary["tweet_count"] < 1:
    sys.exit(1)
`,
      },
    ],
    pendingManual: ['Complete browser OAuth approval', 'Real post publish with an authorized Twitter account', 'Real like/follow write actions on a controlled test account'],
  },
  {
    package: 'karensheng/x-intelligence-automation',
    tests: [
      {
        name: 'twitter-read-smoke',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient

def ok(payload):
    if not isinstance(payload, dict):
        return False
    if payload.get("success") is True:
        return True
    if str(payload.get("status", "")).lower() == "success":
        return True
    return payload.get("code") in {0, 200}

summary = None
for _ in range(3):
    client = TwitterClient()
    user = client.user_info("openai")
    trends = client.trends(1)
    summary = {
        "user_info_ok": ok(user),
        "trends_ok": ok(trends),
    }
    if all(summary.values()):
        break
print(json.dumps(summary, ensure_ascii=False))
if not all(summary.values()):
    sys.exit(1)
`,
      },
      {
        name: 'twitter-authorize-link',
        kind: 'python',
        script: `
import json
import os
import sys
sys.path.insert(0, "scripts")
import twitter_oauth_client as toc

key = os.environ["AISA_API_KEY"]
summary = None
for _ in range(3):
    result = toc.send_json_request(
        "https://api.aisa.one/apis/v1/twitter/auth_twitter",
        {"aisa_api_key": key},
        timeout=toc.DEFAULT_TIMEOUT,
        aisa_api_key=key,
    )
    auth_url = (result.get("data") or {}).get("auth_url") if isinstance(result, dict) else None
    summary = {
        "code": result.get("code"),
        "has_authorization_url": bool(auth_url),
        "authorization_url_prefix": auth_url[:64] if auth_url else None,
    }
    if summary["has_authorization_url"]:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["has_authorization_url"]:
    sys.exit(1)
`,
      },
      {
        name: 'engagement-read-path',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient
from twitter_engagement_client import resolve_user, fetch_latest_tweets

summary = None
for _ in range(2):
    client = TwitterClient()
    resolved = resolve_user(client, "openai")
    if not resolved.get("ok"):
        summary = {
            "resolve_ok": False,
            "tweets_ok": False,
            "tweet_count": 0,
            "resolved_user": resolved.get("resolved_user", {}),
        }
        continue
    tweets = fetch_latest_tweets(client, resolved["resolved_user"]["username"], 2)
    summary = {
        "resolve_ok": resolved.get("ok", False),
        "tweets_ok": tweets.get("ok", False),
        "tweet_count": len(tweets.get("tweets", [])),
        "resolved_user": resolved.get("resolved_user", {}),
    }
    if summary["resolve_ok"] and summary["tweets_ok"] and summary["tweet_count"] >= 1:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["resolve_ok"] or not summary["tweets_ok"] or summary["tweet_count"] < 1:
    sys.exit(1)
`,
      },
    ],
    pendingManual: ['Complete browser OAuth approval', 'Real post publish with an authorized Twitter account', 'Real like/follow write actions on a controlled test account'],
  },
  {
    package: 'chaimengphp/openclaw-aisa-twitter',
    tests: [
      {
        name: 'twitter-read-smoke',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient

def ok(payload):
    if not isinstance(payload, dict):
        return False
    if payload.get("success") is True:
        return True
    if str(payload.get("status", "")).lower() == "success":
        return True
    return payload.get("code") in {0, 200}

summary = None
for _ in range(3):
    client = TwitterClient()
    user = client.user_info("openai")
    trends = client.trends(1)
    summary = {
        "user_info_ok": ok(user),
        "trends_ok": ok(trends),
    }
    if all(summary.values()):
        break
print(json.dumps(summary, ensure_ascii=False))
if not all(summary.values()):
    sys.exit(1)
`,
      },
      {
        name: 'twitter-authorize-link',
        kind: 'python',
        script: `
import json
import os
import sys
sys.path.insert(0, "scripts")
import twitter_oauth_client as toc

key = os.environ["AISA_API_KEY"]
summary = None
for _ in range(3):
    result = toc.send_json_request(
        "https://api.aisa.one/apis/v1/twitter/auth_twitter",
        {"aisa_api_key": key},
        timeout=toc.DEFAULT_TIMEOUT,
        aisa_api_key=key,
    )
    auth_url = (result.get("data") or {}).get("auth_url") if isinstance(result, dict) else None
    summary = {
        "code": result.get("code"),
        "has_authorization_url": bool(auth_url),
        "authorization_url_prefix": auth_url[:64] if auth_url else None,
    }
    if summary["has_authorization_url"]:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["has_authorization_url"]:
    sys.exit(1)
`,
      },
      {
        name: 'engagement-read-path',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from twitter_client import TwitterClient
from twitter_engagement_client import resolve_user, fetch_latest_tweets

summary = None
for _ in range(2):
    client = TwitterClient()
    resolved = resolve_user(client, "openai")
    if not resolved.get("ok"):
        summary = {
            "resolve_ok": False,
            "tweets_ok": False,
            "tweet_count": 0,
            "resolved_user": resolved.get("resolved_user", {}),
        }
        continue
    tweets = fetch_latest_tweets(client, resolved["resolved_user"]["username"], 2)
    summary = {
        "resolve_ok": resolved.get("ok", False),
        "tweets_ok": tweets.get("ok", False),
        "tweet_count": len(tweets.get("tweets", [])),
        "resolved_user": resolved.get("resolved_user", {}),
    }
    if summary["resolve_ok"] and summary["tweets_ok"] and summary["tweet_count"] >= 1:
        break
print(json.dumps(summary, ensure_ascii=False))
if not summary["resolve_ok"] or not summary["tweets_ok"] or summary["tweet_count"] < 1:
    sys.exit(1)
`,
      },
    ],
    pendingManual: ['Complete browser OAuth approval', 'Real post publish with an authorized Twitter account', 'Real like/follow write actions on a controlled test account'],
  },
  {
    package: '0xjordansg-yolo/openclaw-aisa-youtube',
    tests: [
      {
        name: 'youtube-curl-search',
        kind: 'shell',
        command:
          'curl -fsS "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=machine+learning+tutorial&gl=us&hl=en" -H "Authorization: Bearer $AISA_API_KEY" | python3 -c \'import json,sys; data=json.load(sys.stdin); videos=data.get("videos", data.get("search_results", data.get("video_results", []))); print(json.dumps({"has_results": len(videos) > 0, "result_count": len(videos), "top_level_keys": sorted(list(data.keys()))[:8]})); raise SystemExit(0 if len(videos) > 0 else 1)\'',
      },
    ],
    pendingManual: [],
  },
  {
    package: '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking',
    tests: [
      {
        name: 'youtube-python-search',
        kind: 'python',
        script: `
import json
import sys
sys.path.insert(0, "scripts")
from youtube_client import YouTubeClient

client = YouTubeClient()
search = client.search("AI agents tutorial", country="us", language="en")
top = client.find_top_videos("OpenAI", count=3, country="us")
competitor = client.competitor_research("OpenAI", topic="agents", country="us")

videos = search.get("videos", search.get("search_results", search.get("video_results", [])))
summary = {
    "search_results": len(videos),
    "top_videos": len(top.get("top_videos", [])),
    "competitor_channels": len(competitor.get("channels_found", [])),
}
print(json.dumps(summary, ensure_ascii=False))
if summary["search_results"] < 1 or summary["top_videos"] < 1:
    sys.exit(1)
`,
      },
    ],
    pendingManual: [],
  },
];

function runShell(command, cwd) {
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, AISA_API_KEY: apiKey },
  });
  return {
    exitCode: result.status ?? (result.signal ? 124 : 1),
    passed: result.status === 0,
    stdout: (result.stdout || '').slice(0, 4000),
    stderr: `${result.error?.message ?? ''}\n${(result.stderr || '').slice(0, 4000)}`.trim(),
  };
}

function runPython(script, cwd) {
  const result = spawnSync('python3', ['-c', script], {
    cwd,
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, AISA_API_KEY: apiKey },
  });
  return {
    exitCode: result.status ?? (result.signal ? 124 : 1),
    passed: result.status === 0,
    stdout: (result.stdout || '').slice(0, 4000),
    stderr: `${result.error?.message ?? ''}\n${(result.stderr || '').slice(0, 4000)}`.trim(),
  };
}

function sanitize(text) {
  return text.replaceAll(apiKey, '***REDACTED_AISA_API_KEY***');
}

async function main() {
  const reports = [];

  for (const packageCase of PACKAGE_CASES) {
    const cwd = path.join(optimizedRoot, packageCase.package);
    const testReports = [];
    for (const test of packageCase.tests) {
      const result = test.kind === 'python' ? runPython(test.script, cwd) : runShell(test.command, cwd);
      testReports.push({
        name: test.name,
        passed: result.passed,
        exitCode: result.exitCode,
        stdout: sanitize(result.stdout.trim()),
        stderr: sanitize(result.stderr.trim()),
      });
    }

    reports.push({
      package: packageCase.package,
      liveReadChecksPassed: testReports.every((test) => test.passed),
      tests: testReports,
      pendingManual: packageCase.pendingManual,
    });
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), packages: reports }, null, 2)}\n`,
  );

  const failedPackages = reports.filter((item) => !item.liveReadChecksPassed);
  console.log(`Live-tested ${reports.length} optimized packages.`);
  if (failedPackages.length > 0) {
    console.error(`Failures: ${failedPackages.map((item) => item.package).join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
