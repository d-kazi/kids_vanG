/**
 * Score articles by relevance to the GOSI CTO context.
 * Higher score = more relevant.
 */

const HIGH_VALUE_TERMS = [
  // Social insurance
  'social insurance', 'social security', 'pension', 'gosi', 'retirement',
  'claims', 'benefits', 'contributors', 'annuity',
  // GCC / Saudi
  'saudi', 'gcc', 'vision 2030', 'riyadh', 'mcit', 'sdaia', 'nca',
  'bahrain', 'uae', 'qatar', 'oman', 'kuwait',
  // Digital transformation
  'digital transformation', 'cloud migration', 'ai', 'artificial intelligence',
  'machine learning', 'automation', 'rpa', 'citizen services', 'portal',
  // Institutions
  'ilo', 'imf', 'world bank', 'wef', 'issa', 'oecd',
  // Enterprise tech
  'cybersecurity', 'data platform', 'api', 'microservices', 'devops',
  'zero trust', 'sap', 'oracle', 'salesforce', 'servicenow',
];

const RECENCY_WEIGHT = 0.3;
const KEYWORD_WEIGHT = 0.5;
const SOURCE_WEIGHT = 0.2;

const TRUSTED_SOURCES = [
  'gartner', 'mckinsey', 'forrester', 'ilo', 'imf', 'wef',
  'issa', 'oecd', 'world bank', 'reuters', 'bloomberg',
  'techcrunch', 'mit technology review', 'arab news',
];

/**
 * Score a single article (0-100).
 */
function scoreArticle(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();

  // Keyword score (0-100)
  const matchedTerms = HIGH_VALUE_TERMS.filter((term) => text.includes(term));
  const keywordScore = Math.min(100, (matchedTerms.length / 5) * 100);

  // Recency score (0-100) — articles from today=100, 7 days ago=0
  const ageMs = Date.now() - new Date(article.publishedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 100 - (ageDays / 7) * 100);

  // Source trustworthiness (0-100)
  const sourceLower = (article.source || '').toLowerCase();
  const sourceScore = TRUSTED_SOURCES.some((s) => sourceLower.includes(s)) ? 100 : 40;

  const finalScore = Math.round(
    keywordScore * KEYWORD_WEIGHT +
    recencyScore * RECENCY_WEIGHT +
    sourceScore * SOURCE_WEIGHT
  );

  return { ...article, relevanceScore: finalScore, matchedTerms };
}

/**
 * Score and rank articles in each category. Returns top N per category.
 */
function scoreAndRank(categorisedArticles, topN) {
  const result = {};

  for (const [categoryId, articles] of Object.entries(categorisedArticles)) {
    const scored = articles.map(scoreArticle);
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    result[categoryId] = scored.slice(0, topN);
  }

  return result;
}

module.exports = { scoreArticle, scoreAndRank, HIGH_VALUE_TERMS };
