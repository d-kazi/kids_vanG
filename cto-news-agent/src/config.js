require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const config = {
  // ── News API ──
  newsApiKey: process.env.NEWSAPI_KEY || '',

  // ── AI ──
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // ── WhatsApp ──
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'twilio',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  },
  greenApi: {
    instanceId: process.env.GREENAPI_INSTANCE_ID || '',
    apiToken: process.env.GREENAPI_API_TOKEN || '',
  },
  ctoWhatsappNumber: process.env.CTO_WHATSAPP_NUMBER || '',

  // ── Schedule ──
  briefingSchedule: process.env.BRIEFING_SCHEDULE || '0 8 * * 0',
  timezone: process.env.TIMEZONE || 'Asia/Riyadh',

  // ── Report ──
  reportBaseUrl: process.env.REPORT_BASE_URL || 'http://localhost:3001/briefings',

  // ── Research Categories ──
  categories: [
    {
      id: 'it_benchmarking',
      label: 'IT BENCHMARKING',
      emoji: '1.',
      description: 'What peer IT organisations are doing globally and in GCC',
      newsApiQueries: [
        'CIO digital transformation strategy',
        'IT benchmarking enterprise cloud migration',
        'GCC digital government technology',
      ],
      rssFeeds: [
        'https://www.cio.com/feed/',
        'https://www.mckinsey.com/business-functions/mckinsey-digital/rss',
        'https://feeds.feedburner.com/GartnerForItLeaders',
      ],
    },
    {
      id: 'social_insurance_tech',
      label: 'SOCIAL INSURANCE TECH',
      emoji: '2.',
      description: 'Technology rollouts by social insurance and social security organisations',
      newsApiQueries: [
        'social insurance digital transformation',
        'social security technology automation',
        'pension fund technology platform',
      ],
      rssFeeds: [
        'https://www.issa.int/news/rss',
        'https://www.ssa.gov/news/rss/press-rss.xml',
      ],
    },
    {
      id: 'global_institutions',
      label: 'GLOBAL INSTITUTIONS (ILO / IMF / WEF)',
      emoji: '3.',
      description: 'Reports and announcements from ILO, IMF, World Bank, WEF, OECD',
      newsApiQueries: [
        'ILO social protection digital',
        'IMF digital transformation policy',
        'World Economic Forum technology governance',
      ],
      rssFeeds: [
        'https://www.ilo.org/rss/index.htm',
        'https://blogs.imf.org/feed/',
        'https://www.weforum.org/feed/agenda.xml',
      ],
    },
    {
      id: 'key_tech_news',
      label: 'KEY TECH NEWS',
      emoji: '4.',
      description: 'Major tech releases, AI, cloud, cybersecurity, and data platforms',
      newsApiQueries: [
        'artificial intelligence enterprise',
        'cybersecurity breach vulnerability',
        'cloud computing major announcement',
      ],
      rssFeeds: [
        'https://techcrunch.com/feed/',
        'https://feeds.arstechnica.com/arstechnica/technology-lab',
        'https://hnrss.org/best',
      ],
    },
    {
      id: 'ai_latest',
      label: 'AI & GENERATIVE AI',
      emoji: '5.',
      description: 'Latest in AI — foundation models, enterprise AI adoption, regulation, agentic AI, and breakthroughs',
      newsApiQueries: [
        'generative AI enterprise adoption',
        'large language model GPT Claude Gemini',
        'AI regulation governance policy',
        'agentic AI autonomous agents',
      ],
      rssFeeds: [
        'https://blog.google/technology/ai/rss/',
        'https://openai.com/blog/rss/',
        'https://techcrunch.com/category/artificial-intelligence/feed/',
        'https://feeds.feedburner.com/nvabordblog',
      ],
    },
    {
      id: 'gcc_saudi',
      label: 'GCC & SAUDI UPDATES',
      emoji: '6.',
      description: 'Vision 2030 digital, MCIT, SDAIA, NCA, regional govtech and fintech',
      newsApiQueries: [
        'Saudi Arabia Vision 2030 digital technology',
        'GCC fintech govtech',
        'Saudi MCIT SDAIA cybersecurity',
      ],
      rssFeeds: [
        'https://www.arabnews.com/cat/technology/rss.xml',
      ],
    },
  ],

  // ── Limits ──
  maxStoriesPerCategory: 3,
  maxWhatsappChars: 4000,
};

module.exports = config;
