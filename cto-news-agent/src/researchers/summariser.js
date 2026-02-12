const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

let client = null;

function getClient() {
  if (!client && config.anthropicApiKey) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

/**
 * Summarise a single article into 2-3 executive sentences.
 */
async function summariseArticle(article) {
  const anthropic = getClient();
  if (!anthropic) {
    // Fallback: truncate description
    return article.description.slice(0, 200) + (article.description.length > 200 ? '...' : '');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are an executive briefing assistant for the CTO of a large social insurance organisation (GOSI, Saudi Arabia). Summarise this news article in exactly 2 sentences. Focus on what happened and why it matters to a CTO responsible for digital transformation in social insurance.

Title: ${article.title}
Source: ${article.source}
Content: ${article.description}

Reply with ONLY the 2-sentence summary, nothing else.`,
        },
      ],
    });

    return response.content[0]?.text || article.description.slice(0, 200);
  } catch (err) {
    console.error(`[summariser] Error summarising "${article.title}":`, err.message);
    return article.description.slice(0, 200) + '...';
  }
}

/**
 * Summarise the top N articles for each category.
 */
async function summariseAll(categorisedArticles) {
  const result = {};

  for (const [categoryId, articles] of Object.entries(categorisedArticles)) {
    const top = articles.slice(0, config.maxStoriesPerCategory);
    const summarised = [];

    for (const article of top) {
      const summary = await summariseArticle(article);
      summarised.push({ ...article, summary });
    }

    result[categoryId] = summarised;
    console.log(`[summariser] ${categoryId}: ${summarised.length} articles summarised`);
  }

  return result;
}

module.exports = { summariseArticle, summariseAll };
