# PRD: GOSI CTO Weekly Intelligence Briefing Agent

## 1. Overview

An automated research agent that curates, summarises, and delivers a weekly (or on-demand) intelligence briefing to the CTO of GOSI (General Organization for Social Insurance, Saudi Arabia). The briefing is formatted as a concise, executive-ready digest and automatically shared via WhatsApp.

---

## 2. Problem Statement

The CTO needs a single, curated view of what matters each week across five domains:

| # | Domain | Why it matters |
|---|--------|---------------|
| 1 | **IT Benchmarking** | What are peer IT organisations doing globally and in the GCC? New operating models, org structures, vendor deals, cloud migrations, AI/ML adoption benchmarks. |
| 2 | **Social Insurance Tech** | What are other social insurance / social security bodies shipping? Digital services, fraud detection, claims automation, pension platforms, citizen portals. |
| 3 | **Global Institutions** | Announcements, reports, and policy positions from ILO, IMF, World Bank, WEF, ISSA, OECD that affect social protection or digital government. |
| 4 | **Key Tech News** | Major releases, vulnerabilities, market shifts (cloud, cybersecurity, data platforms) relevant to a large enterprise CTO. |
| 5 | **AI & Generative AI** | Latest in foundation models (GPT, Claude, Gemini, DeepSeek), enterprise AI adoption, agentic AI, AI regulation and governance, breakthroughs. |
| 6 | **GCC / Saudi Specific** | Vision 2030 digital updates, MCIT / SDAIA announcements, NCA cybersecurity directives, regional fintech and govtech news. |

Today this requires manual scanning of dozens of sources. The agent automates 90% of this effort.

---

## 3. Target User

- **Primary**: CTO of GOSI
- **Secondary**: CTO direct reports, strategy & architecture team

---

## 4. Agent Capabilities

### 4.1 Research Pipeline

```
[Scheduled Trigger / Manual Trigger]
        |
        v
  +--------------+
  | News Fetcher |  -- queries multiple APIs & RSS feeds per category
  +--------------+
        |
        v
  +--------------+
  |  Deduplicator|  -- removes duplicate stories across sources
  +--------------+
        |
        v
  +----------------+
  | AI Summariser  |  -- generates 2-3 sentence executive summary per item
  +----------------+
        |
        v
  +----------------+
  | Relevance      |  -- scores & ranks items per category (0-100)
  | Scorer         |
  +----------------+
        |
        v
  +----------------+
  | Briefing       |  -- assembles final report in structured format
  | Formatter      |
  +----------------+
        |
        v
  +-------------------+
  | WhatsApp Delivery  |  -- sends via Twilio / Green API / WA Business
  +-------------------+
```

### 4.2 News Sources (per category)

| Category | Sources |
|----------|---------|
| IT Benchmarking | Gartner Newsroom, McKinsey Digital, Forrester Blog, CIO.com, HBR Tech, IDC RSS |
| Social Insurance Tech | ISSA News, SSA.gov, EU Social Security news, national fund press releases |
| Global Institutions | ILO Newsroom, IMF Blog, World Bank News, WEF Agenda, OECD Digital |
| Key Tech News | TechCrunch, The Verge, Ars Technica, Hacker News (top), MIT Tech Review |
| GCC / Saudi | Arab News Tech, Saudi Gazette, MCIT.gov.sa, SDAIA news, Zawya Tech |

### 4.3 Output Format

The briefing is delivered as a single WhatsApp message (with overflow link) structured as:

```
GOSI CTO Intelligence Briefing
Week of [DATE]

--- IT BENCHMARKING ---
 [Headline]
  [2-sentence summary]
  Source: [link]

 [Headline]
  [2-sentence summary]
  Source: [link]

--- SOCIAL INSURANCE TECH ---
 ...

--- GLOBAL INSTITUTIONS (ILO/IMF/WEF) ---
 ...

--- KEY TECH NEWS ---
 ...

--- GCC & SAUDI UPDATES ---
 ...

 Full report: [link to hosted HTML version]
```

---

## 5. WhatsApp Delivery

### 5.1 Integration Options (ranked)

| Option | Pros | Cons |
|--------|------|------|
| **Twilio WhatsApp API** (recommended) | Reliable, well-documented, sandbox for dev | Per-message cost (~$0.005/msg) |
| **Green API** | Easy setup, no Meta approval needed | Third-party dependency |
| **WhatsApp Business Cloud API** | Official, free tier (1000 msgs/mo) | Requires Meta business verification |

### 5.2 Delivery Rules

- **Schedule**: Every Sunday at 08:00 AST (Arabia Standard Time)
- **On-demand**: CTO can trigger via WhatsApp command "briefing now"
- **Fallback**: If WhatsApp fails, send via email
- **Message size**: WhatsApp caps at ~65K chars; if briefing exceeds 4000 chars, send summary + link to full report

---

## 6. Configuration

```
NEWSAPI_KEY=           # NewsAPI.org API key
OPENAI_API_KEY=        # For AI summarisation (or Anthropic key)
ANTHROPIC_API_KEY=     # Claude API for summarisation (preferred)

# WhatsApp delivery
WHATSAPP_PROVIDER=twilio          # twilio | greenapi | wa_cloud
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CTO_WHATSAPP_NUMBER=whatsapp:+966XXXXXXXXX

# Optional: Green API
GREENAPI_INSTANCE_ID=
GREENAPI_API_TOKEN=

# Schedule
BRIEFING_SCHEDULE=0 8 * * 0      # cron: Sunday 8AM
TIMEZONE=Asia/Riyadh

# Report hosting
REPORT_BASE_URL=https://your-domain.com/briefings
```

---

## 7. Technical Architecture

```
cto-news-agent/
  package.json
  .env.example
  src/
    index.js              # Entry point, scheduler
    config.js             # Environment & defaults
    agent.js              # Main orchestrator
    researchers/
      news-fetcher.js     # Multi-source news fetching
      deduplicator.js     # Cross-source deduplication
      summariser.js       # AI-powered summarisation
      scorer.js           # Relevance scoring
    formatter.js          # Briefing assembly & formatting
    whatsapp.js           # WhatsApp delivery (multi-provider)
    report-server.js      # Optional: host full HTML reports
```

### 7.1 Tech Stack

- **Runtime**: Node.js 18+
- **News APIs**: NewsAPI.org, RSS feeds via `rss-parser`
- **AI Summarisation**: Anthropic Claude API (primary), OpenAI (fallback)
- **Scheduling**: `node-cron`
- **WhatsApp**: `twilio` SDK / `axios` for Green API
- **Deduplication**: TF-IDF similarity via `natural`

---

## 8. MVP Scope

### In Scope (Phase 1)
- News fetching from NewsAPI + 5 RSS feeds per category
- AI summarisation (Claude)
- WhatsApp delivery via Twilio
- Weekly scheduled + manual trigger
- Top 3 stories per category (15 total)

### Phase 2
- Full RSS feed coverage (25+ sources)
- Interactive WhatsApp commands ("more on topic X", "briefing now")
- Trend detection across weeks
- PDF report generation
- Email fallback delivery

### Out of Scope
- Real-time alerting
- Sentiment analysis
- Translation (Arabic briefing)
- Mobile app

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Briefing delivered on time | 99% weekly |
| Stories per category | >= 3 |
| CTO opens/reads briefing | 80%+ weeks |
| Manual trigger response time | < 60 seconds |
| False positive rate (irrelevant stories) | < 15% |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NewsAPI rate limits | Missing stories | Cache aggressively, use RSS as fallback |
| WhatsApp message too long | Truncated briefing | Auto-split + link to full report |
| AI hallucination in summaries | Misleading info | Always include source link, use extractive not abstractive |
| API costs | Budget overrun | Cap at 100 API calls/week, use free tiers first |
