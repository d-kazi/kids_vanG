const { fetchAllCategories } = require('./researchers/news-fetcher');
const { deduplicateAll } = require('./researchers/deduplicator');
const { scoreAndRank } = require('./researchers/scorer');
const { summariseAll } = require('./researchers/summariser');
const { formatBriefing, formatHtmlReport } = require('./formatter');
const { sendBriefing } = require('./whatsapp');
const config = require('./config');
const fs = require('fs');
const path = require('path');

/**
 * Run the full research → summarise → format → deliver pipeline.
 *
 * @param {Object} options
 * @param {boolean} options.skipWhatsapp - If true, skip WhatsApp delivery (useful for testing)
 * @param {string}  options.recipientOverride - Override default CTO number
 * @returns {Object} { briefingText, htmlReport, deliveryResult }
 */
async function runBriefingPipeline(options = {}) {
  const startTime = Date.now();
  console.log('\n====================================');
  console.log('  GOSI CTO News Agent - Starting');
  console.log('====================================\n');

  // Step 1: Fetch news from all sources
  console.log('[1/5] Fetching news from all sources...');
  const rawArticles = await fetchAllCategories();

  // Step 2: Deduplicate
  console.log('[2/5] Deduplicating articles...');
  const deduplicated = deduplicateAll(rawArticles);

  // Step 3: Score and rank
  console.log('[3/5] Scoring and ranking articles...');
  const ranked = scoreAndRank(deduplicated, config.maxStoriesPerCategory);

  // Step 4: AI Summarise top articles
  console.log('[4/5] Generating AI summaries...');
  const summarised = await summariseAll(ranked);

  // Step 5: Format
  console.log('[5/5] Formatting briefing...');
  const briefingText = formatBriefing(summarised);
  const htmlReport = formatHtmlReport(summarised);

  // Save reports locally
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0];
  const textPath = path.join(reportsDir, `briefing-${timestamp}.txt`);
  const htmlPath = path.join(reportsDir, `briefing-${timestamp}.html`);

  fs.writeFileSync(textPath, briefingText);
  fs.writeFileSync(htmlPath, htmlReport);
  console.log(`[agent] Reports saved: ${textPath}`);

  // Deliver via WhatsApp
  let deliveryResult = null;
  if (!options.skipWhatsapp) {
    try {
      console.log('[agent] Sending via WhatsApp...');
      deliveryResult = await sendBriefing(briefingText, options.recipientOverride);
      console.log(`[agent] WhatsApp delivery: ${deliveryResult.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (err) {
      console.error('[agent] WhatsApp delivery error:', err.message);
      deliveryResult = { success: false, error: err.message };
    }
  } else {
    console.log('[agent] WhatsApp delivery skipped (--skip-whatsapp or skipWhatsapp option)');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[agent] Pipeline complete in ${elapsed}s`);

  // Print stats
  let totalArticles = 0;
  for (const articles of Object.values(summarised)) {
    totalArticles += articles.length;
  }
  console.log(`[agent] Total stories in briefing: ${totalArticles}`);
  console.log(`[agent] Briefing length: ${briefingText.length} chars`);

  return { briefingText, htmlReport, deliveryResult, totalArticles, elapsed };
}

module.exports = { runBriefingPipeline };
