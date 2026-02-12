const axios = require('axios');
const RSSParser = require('rss-parser');
const config = require('../config');

const rssParser = new RSSParser({ timeout: 10000 });

/**
 * Fetch articles from NewsAPI for a given query.
 * Returns normalised article objects.
 */
async function fetchFromNewsApi(query) {
  if (!config.newsApiKey) return [];

  try {
    const { data } = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 5,
        apiKey: config.newsApiKey,
      },
      timeout: 15000,
    });

    return (data.articles || []).map((a) => ({
      title: a.title,
      description: a.description || '',
      url: a.url,
      source: a.source?.name || 'Unknown',
      publishedAt: a.publishedAt,
      origin: 'newsapi',
    }));
  } catch (err) {
    console.error(`[news-fetcher] NewsAPI error for "${query}":`, err.message);
    return [];
  }
}

/**
 * Fetch articles from a single RSS feed URL.
 */
async function fetchFromRss(feedUrl) {
  try {
    const feed = await rssParser.parseURL(feedUrl);
    return (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || '',
      url: item.link || '',
      source: feed.title || feedUrl,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      origin: 'rss',
    }));
  } catch (err) {
    console.error(`[news-fetcher] RSS error for ${feedUrl}:`, err.message);
    return [];
  }
}

/**
 * Fetch all articles for a single research category.
 * Runs NewsAPI queries and RSS feeds in parallel.
 */
async function fetchForCategory(category) {
  const apiPromises = category.newsApiQueries.map(fetchFromNewsApi);
  const rssPromises = category.rssFeeds.map(fetchFromRss);

  const results = await Promise.allSettled([...apiPromises, ...rssPromises]);

  const articles = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  // Sort by date descending and keep only last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return articles
    .filter((a) => new Date(a.publishedAt) >= weekAgo)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

/**
 * Fetch news for ALL categories. Returns { categoryId: articles[] }.
 */
async function fetchAllCategories() {
  const result = {};

  const fetches = config.categories.map(async (cat) => {
    const articles = await fetchForCategory(cat);
    result[cat.id] = articles;
    console.log(`[news-fetcher] ${cat.id}: ${articles.length} articles`);
  });

  await Promise.allSettled(fetches);
  return result;
}

module.exports = { fetchFromNewsApi, fetchFromRss, fetchForCategory, fetchAllCategories };
