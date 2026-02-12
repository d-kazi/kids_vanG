const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Compute cosine similarity between two strings using TF-IDF.
 */
function similarity(textA, textB) {
  const tfidf = new TfIdf();
  tfidf.addDocument(tokenizer.tokenize(textA.toLowerCase()).join(' '));
  tfidf.addDocument(tokenizer.tokenize(textB.toLowerCase()).join(' '));

  // Build term vectors
  const terms = new Set();
  tfidf.listTerms(0).forEach((t) => terms.add(t.term));
  tfidf.listTerms(1).forEach((t) => terms.add(t.term));

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const term of terms) {
    const a = tfidf.tfidf(term, 0);
    const b = tfidf.tfidf(term, 1);
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Remove near-duplicate articles within a list.
 * Two articles are considered duplicates if their title similarity > threshold.
 */
function deduplicateArticles(articles, threshold = 0.6) {
  const unique = [];

  for (const article of articles) {
    const isDupe = unique.some(
      (existing) => similarity(existing.title, article.title) > threshold
    );
    if (!isDupe) {
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Deduplicate across all categories.
 * @param {Object} categorisedArticles - { categoryId: articles[] }
 * @returns {Object} deduplicated version
 */
function deduplicateAll(categorisedArticles) {
  const result = {};
  // Also track globally to avoid cross-category dupes
  const globalSeen = [];

  for (const [categoryId, articles] of Object.entries(categorisedArticles)) {
    const categoryUnique = [];

    for (const article of articles) {
      const isDupeGlobal = globalSeen.some(
        (existing) => similarity(existing.title, article.title) > 0.6
      );
      if (!isDupeGlobal) {
        categoryUnique.push(article);
        globalSeen.push(article);
      }
    }

    result[categoryId] = categoryUnique;
  }

  return result;
}

module.exports = { similarity, deduplicateArticles, deduplicateAll };
