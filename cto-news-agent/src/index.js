#!/usr/bin/env node

const cron = require('node-cron');
const config = require('./config');
const { runBriefingPipeline } = require('./agent');

const args = process.argv.slice(2);
const isImmediate = args.includes('--now');
const skipWhatsapp = args.includes('--skip-whatsapp');
const dryRun = args.includes('--dry-run');

async function main() {
  console.log('===========================================');
  console.log('  GOSI CTO News Research Agent v1.0');
  console.log('===========================================');
  console.log(`  Provider:  ${config.whatsappProvider}`);
  console.log(`  Schedule:  ${config.briefingSchedule}`);
  console.log(`  Timezone:  ${config.timezone}`);
  console.log(`  Recipient: ${config.ctoWhatsappNumber || '(not set)'}`);
  console.log('===========================================\n');

  // Immediate run mode (--now flag)
  if (isImmediate || dryRun) {
    console.log(dryRun ? '[mode] Dry run - no WhatsApp delivery' : '[mode] Immediate run');
    try {
      const result = await runBriefingPipeline({
        skipWhatsapp: skipWhatsapp || dryRun,
      });

      if (dryRun) {
        console.log('\n--- BRIEFING PREVIEW ---\n');
        console.log(result.briefingText);
        console.log('\n--- END PREVIEW ---\n');
      }
    } catch (err) {
      console.error('[fatal] Pipeline failed:', err);
      process.exit(1);
    }

    if (!args.includes('--stay')) {
      process.exit(0);
    }
  }

  // Scheduled mode
  const cronExpression = config.briefingSchedule;
  if (!cron.validate(cronExpression)) {
    console.error(`[fatal] Invalid cron expression: ${cronExpression}`);
    process.exit(1);
  }

  console.log(`[scheduler] Briefing scheduled: ${cronExpression} (${config.timezone})`);
  console.log('[scheduler] Waiting for next trigger...\n');

  cron.schedule(
    cronExpression,
    async () => {
      console.log(`[scheduler] Triggered at ${new Date().toISOString()}`);
      try {
        await runBriefingPipeline();
      } catch (err) {
        console.error('[scheduler] Pipeline error:', err);
      }
    },
    { timezone: config.timezone }
  );
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
