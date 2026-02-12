const { describe, it } = require('node:test');
const assert = require('node:assert');

const { similarity, deduplicateArticles } = require('../researchers/deduplicator');
const { scoreArticle } = require('../researchers/scorer');
const { splitMessage } = require('../whatsapp');
const { formatBriefing, formatArticle } = require('../formatter');

describe('Deduplicator', () => {
  it('should detect similar titles', () => {
    const score = similarity(
      'Saudi Arabia launches new digital transformation initiative',
      'Saudi Arabia announces digital transformation program'
    );
    assert.ok(score > 0.3, `Expected similarity > 0.3, got ${score}`);
  });

  it('should detect dissimilar titles', () => {
    const score = similarity(
      'Saudi Arabia launches new digital transformation initiative',
      'Apple releases new iPhone with better camera'
    );
    assert.ok(score < 0.3, `Expected similarity < 0.3, got ${score}`);
  });

  it('should remove duplicates from article list', () => {
    const articles = [
      { title: 'Saudi Arabia digital transformation program launch 2025', description: 'test', url: '1', source: 'A', publishedAt: new Date().toISOString() },
      { title: 'Saudi Arabia digital transformation program launched 2025', description: 'test', url: '2', source: 'B', publishedAt: new Date().toISOString() },
      { title: 'Apple releases new iPhone', description: 'test', url: '3', source: 'C', publishedAt: new Date().toISOString() },
    ];
    const result = deduplicateArticles(articles);
    assert.ok(result.length <= 2, `Expected <= 2 unique articles, got ${result.length}`);
  });
});

describe('Scorer', () => {
  it('should score a highly relevant article higher', () => {
    const relevant = scoreArticle({
      title: 'Saudi Arabia GOSI digital transformation with AI',
      description: 'Social insurance pension fund cloud migration',
      source: 'Gartner',
      publishedAt: new Date().toISOString(),
    });

    const irrelevant = scoreArticle({
      title: 'Best pizza restaurants in New York',
      description: 'A guide to the top pizza places',
      source: 'Food Blog',
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    });

    assert.ok(
      relevant.relevanceScore > irrelevant.relevanceScore,
      `Expected ${relevant.relevanceScore} > ${irrelevant.relevanceScore}`
    );
  });

  it('should give score between 0 and 100', () => {
    const result = scoreArticle({
      title: 'Test article',
      description: 'Some content',
      source: 'Test',
      publishedAt: new Date().toISOString(),
    });
    assert.ok(result.relevanceScore >= 0 && result.relevanceScore <= 100);
  });
});

describe('WhatsApp message splitting', () => {
  it('should not split short messages', () => {
    const chunks = splitMessage('Hello world', 4000);
    assert.strictEqual(chunks.length, 1);
  });

  it('should split long messages at section boundaries', () => {
    const longText = Array(10).fill('--- SECTION ---\n' + 'A'.repeat(500)).join('\n');
    const chunks = splitMessage(longText, 2000);
    assert.ok(chunks.length > 1, `Expected > 1 chunk, got ${chunks.length}`);
  });
});

describe('Formatter', () => {
  it('should format a briefing with all categories', () => {
    const mockData = {
      it_benchmarking: [
        { title: 'Test Article', summary: 'Test summary', url: 'http://test.com', source: 'Test' },
      ],
      social_insurance_tech: [],
      global_institutions: [],
      key_tech_news: [],
      gcc_saudi: [],
    };

    const result = formatBriefing(mockData);
    assert.ok(result.includes('GOSI CTO Intelligence Briefing'));
    assert.ok(result.includes('IT BENCHMARKING'));
    assert.ok(result.includes('Test Article'));
    assert.ok(result.includes('No significant news this week'));
  });

  it('should format a single article', () => {
    const article = {
      title: 'Big News',
      summary: 'This is important.',
      url: 'http://example.com',
      source: 'Reuters',
    };
    const result = formatArticle(article, 0);
    assert.ok(result.includes('Big News'));
    assert.ok(result.includes('Reuters'));
  });
});
