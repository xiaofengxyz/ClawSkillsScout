export const SOURCE_OPTIMIZED_PACKAGE_MANIFEST = {
  '0xjordansg-yolo/openclaw-twitter': {
    retained: [
      'SKILL.md',
      'scripts/twitter_client.py',
      'scripts/twitter_oauth_client.py',
      'references/post_twitter.md',
    ],
    removed: ['README.md', '_meta.json'],
    commands: [
      ['python3', 'scripts/twitter_client.py', '--help'],
      ['python3', 'scripts/twitter_oauth_client.py', '--help'],
    ],
    templateSkill: '0xjordansg-yolo/openclaw-twitter/SKILL.md',
    zhTemplateSkill: '0xjordansg-yolo/openclaw-twitter-zh/SKILL.md',
  },
  'aisapay/aisa-twitter-api': {
    retained: [
      'SKILL.md',
      'scripts/twitter_client.py',
      'scripts/twitter_oauth_client.py',
      'references/post_twitter.md',
    ],
    removed: ['README.md', '_meta.json'],
    commands: [
      ['python3', 'scripts/twitter_client.py', '--help'],
      ['python3', 'scripts/twitter_oauth_client.py', '--help'],
    ],
    templateSkill: 'aisapay/aisa-twitter-api/SKILL.md',
    zhTemplateSkill: 'aisapay/aisa-twitter-api-zh/SKILL.md',
  },
  'aisadocs/openclaw-twitter-post-engage': {
    retained: [
      'SKILL.md',
      'scripts/twitter_client.py',
      'scripts/twitter_oauth_client.py',
      'scripts/twitter_engagement_client.py',
      'references/post_twitter.md',
      'references/engage_twitter.md',
    ],
    removed: ['README.md', '_meta.json'],
    commands: [
      ['python3', 'scripts/twitter_client.py', '--help'],
      ['python3', 'scripts/twitter_oauth_client.py', '--help'],
      ['python3', 'scripts/twitter_engagement_client.py', '--help'],
    ],
    templateSkill: 'aisadocs/openclaw-twitter-post-engage/SKILL.md',
    zhTemplateSkill: 'aisadocs/openclaw-twitter-post-engage-zh/SKILL.md',
  },
  'karensheng/x-intelligence-automation': {
    retained: [
      'SKILL.md',
      'scripts/twitter_client.py',
      'scripts/twitter_oauth_client.py',
      'scripts/twitter_engagement_client.py',
      'references/post_twitter.md',
      'references/engage_twitter.md',
    ],
    removed: ['README.md', '_meta.json'],
    commands: [
      ['python3', 'scripts/twitter_client.py', '--help'],
      ['python3', 'scripts/twitter_oauth_client.py', '--help'],
      ['python3', 'scripts/twitter_engagement_client.py', '--help'],
    ],
    templateSkill: 'karensheng/x-intelligence-automation/SKILL.md',
    zhTemplateSkill: 'karensheng/x-intelligence-automation-zh/SKILL.md',
  },
  'chaimengphp/openclaw-aisa-twitter': {
    retained: [
      'SKILL.md',
      'scripts/twitter_client.py',
      'scripts/twitter_oauth_client.py',
      'scripts/twitter_engagement_client.py',
      'references/post_twitter.md',
      'references/engage_twitter.md',
    ],
    removed: ['README.md', '_meta.json'],
    commands: [
      ['python3', 'scripts/twitter_client.py', '--help'],
      ['python3', 'scripts/twitter_oauth_client.py', '--help'],
      ['python3', 'scripts/twitter_engagement_client.py', '--help'],
    ],
    templateSkill: 'chaimengphp/openclaw-aisa-twitter/SKILL.md',
    zhTemplateSkill: 'chaimengphp/openclaw-aisa-twitter-zh/SKILL.md',
  },
  '0xjordansg-yolo/openclaw-aisa-youtube': {
    retained: ['SKILL.md', 'LICENSE.txt'],
    removed: ['_meta.json'],
    commands: [],
    templateSkill: '0xjordansg-yolo/openclaw-aisa-youtube/SKILL.md',
    zhTemplateSkill: '0xjordansg-yolo/openclaw-aisa-youtube-zh/SKILL.md',
  },
  '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking': {
    retained: ['SKILL.md', 'scripts/youtube_client.py'],
    removed: ['README.md', '_meta.json'],
    commands: [['python3', 'scripts/youtube_client.py', '--help']],
    templateSkill: '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking/SKILL.md',
    zhTemplateSkill:
      '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking-zh/SKILL.md',
  },
};

export function listSourceOptimizedPackages() {
  return Object.keys(SOURCE_OPTIMIZED_PACKAGE_MANIFEST);
}
