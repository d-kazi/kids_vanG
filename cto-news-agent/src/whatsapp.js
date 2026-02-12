const config = require('./config');

/**
 * Send a WhatsApp message using the configured provider.
 * Supports: Twilio, Green API, WA Cloud API.
 * Automatically splits messages that exceed WhatsApp's practical limit.
 */

// ── Twilio Provider ──

async function sendViaTwilio(to, body) {
  const twilio = require('twilio');
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);

  const message = await client.messages.create({
    from: config.twilio.from,
    to,
    body,
  });

  console.log(`[whatsapp/twilio] Message sent: ${message.sid}`);
  return { success: true, sid: message.sid, provider: 'twilio' };
}

// ── Green API Provider ──

async function sendViaGreenApi(to, body) {
  const axios = require('axios');

  // Green API expects phone number without 'whatsapp:' prefix
  const phone = to.replace('whatsapp:', '').replace('+', '');

  const url = `https://api.green-api.com/waInstance${config.greenApi.instanceId}/sendMessage/${config.greenApi.apiToken}`;

  const { data } = await axios.post(url, {
    chatId: `${phone}@c.us`,
    message: body,
  });

  console.log(`[whatsapp/greenapi] Message sent: ${data.idMessage}`);
  return { success: true, id: data.idMessage, provider: 'greenapi' };
}

// ── Message Splitting ──

/**
 * Split a message into chunks that fit WhatsApp's practical limit.
 * Splits at section boundaries (---) when possible.
 */
function splitMessage(text, maxChars = 4000) {
  if (text.length <= maxChars) return [text];

  const chunks = [];
  const sections = text.split(/\n---\s/);
  let current = '';

  for (const section of sections) {
    const candidate = current ? `${current}\n--- ${section}` : section;

    if (candidate.length > maxChars && current) {
      chunks.push(current.trim());
      current = `--- ${section}`;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

// ── Main Send Function ──

/**
 * Send the briefing to the CTO's WhatsApp.
 * Handles message splitting and provider routing.
 *
 * @param {string} briefingText - The formatted briefing text
 * @param {string} [recipientOverride] - Override the default CTO number
 * @returns {Object} delivery result
 */
async function sendBriefing(briefingText, recipientOverride) {
  const to = recipientOverride || config.ctoWhatsappNumber;

  if (!to) {
    throw new Error('[whatsapp] No recipient number configured. Set CTO_WHATSAPP_NUMBER in .env');
  }

  const chunks = splitMessage(briefingText, config.maxWhatsappChars);
  const results = [];

  console.log(`[whatsapp] Sending ${chunks.length} message(s) to ${to} via ${config.whatsappProvider}`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks.length > 1
      ? `(${i + 1}/${chunks.length})\n\n${chunks[i]}`
      : chunks[i];

    let result;
    try {
      switch (config.whatsappProvider) {
        case 'greenapi':
          result = await sendViaGreenApi(to, chunk);
          break;
        case 'twilio':
        default:
          result = await sendViaTwilio(to, chunk);
          break;
      }
      results.push(result);
    } catch (err) {
      console.error(`[whatsapp] Failed to send chunk ${i + 1}:`, err.message);
      results.push({ success: false, error: err.message, chunk: i + 1 });
    }

    // Small delay between chunks to preserve ordering
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  const allSuccess = results.every((r) => r.success);
  return {
    success: allSuccess,
    totalChunks: chunks.length,
    results,
  };
}

module.exports = { sendBriefing, splitMessage, sendViaTwilio, sendViaGreenApi };
