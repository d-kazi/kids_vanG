const config = require('./config');

/**
 * Format the current date range for the briefing header.
 */
function getDateRange() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const fmt = (d) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${fmt(weekAgo)} - ${fmt(now)}`;
}

/**
 * Format a single article entry for the WhatsApp message.
 */
function formatArticle(article, index) {
  const bullet = `${String.fromCharCode(9679)}`; // bullet character
  const lines = [
    `${bullet} *${article.title}*`,
    `  ${article.summary || article.description.slice(0, 180)}`,
    `  _Source: ${article.source}_ | ${article.url}`,
  ];
  return lines.join('\n');
}

/**
 * Build the full WhatsApp briefing text from summarised & scored articles.
 *
 * @param {Object} categorisedArticles - { categoryId: [{ title, summary, url, source }] }
 * @returns {string} formatted briefing
 */
function formatBriefing(categorisedArticles) {
  const lines = [];

  lines.push(`*GOSI CTO Intelligence Briefing*`);
  lines.push(`_${getDateRange()}_`);
  lines.push('');

  for (const category of config.categories) {
    const articles = categorisedArticles[category.id] || [];

    lines.push(`--- ${category.label} ---`);

    if (articles.length === 0) {
      lines.push('  No significant news this week.');
    } else {
      for (let i = 0; i < articles.length; i++) {
        lines.push(formatArticle(articles[i], i));
        if (i < articles.length - 1) lines.push('');
      }
    }

    lines.push('');
  }

  lines.push('---');
  lines.push(`_Generated automatically by GOSI CTO News Agent_`);

  return lines.join('\n');
}

/**
 * Build a full HTML report (for the "full report" link).
 */
function formatHtmlReport(categorisedArticles) {
  const dateRange = getDateRange();

  const categoryHtml = config.categories.map((category) => {
    const articles = categorisedArticles[category.id] || [];
    const articleRows = articles.length === 0
      ? '<p style="color:#888;">No significant news this week.</p>'
      : articles.map((a) => `
        <div style="margin-bottom:16px;padding:12px;background:#f8f9fa;border-radius:8px;border-left:4px solid #0066cc;">
          <h3 style="margin:0 0 6px 0;font-size:15px;">
            <a href="${a.url}" target="_blank" style="color:#0066cc;text-decoration:none;">${a.title}</a>
          </h3>
          <p style="margin:0 0 6px 0;font-size:14px;color:#333;">${a.summary || a.description.slice(0, 250)}</p>
          <p style="margin:0;font-size:12px;color:#888;">
            ${a.source} | Score: ${a.relevanceScore || 'N/A'} | ${new Date(a.publishedAt).toLocaleDateString('en-GB')}
          </p>
        </div>
      `).join('');

    return `
      <div style="margin-bottom:28px;">
        <h2 style="color:#0066cc;border-bottom:2px solid #0066cc;padding-bottom:6px;font-size:18px;">
          ${category.emoji} ${category.label}
        </h2>
        ${articleRows}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GOSI CTO Intelligence Briefing - ${dateRange}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 20px; color: #222; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:30px;">
    <h1 style="font-size:22px;margin-bottom:4px;">GOSI CTO Intelligence Briefing</h1>
    <p style="color:#666;font-size:14px;">${dateRange}</p>
  </div>
  ${categoryHtml}
  <hr style="margin-top:30px;">
  <p style="text-align:center;font-size:12px;color:#999;">
    Generated automatically by GOSI CTO News Agent
  </p>
</body>
</html>`;
}

module.exports = { formatBriefing, formatHtmlReport, getDateRange, formatArticle };
