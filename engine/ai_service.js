const { parseConditions } = require('./conditions_parser');
let Groq;
try {
  // Optional import; app still works if groq-sdk is not installed
  // eslint-disable-next-line global-require
  Groq = require('groq-sdk');
} catch (e) {
  Groq = null;
}

const groqClient =
  Groq && process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

async function interpretConditions(text, jurisdiction = 'generic') {
  const obligations = await parseConditions(text, jurisdiction);

  // Baseline local explanation so the app works without any external AI
  const baseline = obligations.map((ob) => ({
    ...ob,
    explanation: buildLocalExplanation(ob),
  }));

  if (!groqClient) {
    return baseline;
  }

  try {
    const enhanced = await enhanceWithGroq(baseline, jurisdiction);
    return enhanced;
  } catch (e) {
    // If Groq fails for any reason, fall back to local explanations
    // without breaking the app.
    // eslint-disable-next-line no-console
    console.error('Groq enhancement failed:', e.message || e);
    return baseline;
  }
}

function buildLocalExplanation(ob) {
  const base = `This condition means: ${ob.originalText}`;
  const warning = getRiskWarning(ob.type);
  return `${base}. ${warning}`;
}

function getRiskWarning(type) {
  const warnings = {
    reporting: 'Missing or being late to check-ins can cause a violation.',
    travel: 'Leaving the allowed area without permission may violate supervision.',
    substance_use: 'Positive tests or refusing tests can have immediate consequences.',
    program: 'Skipping or dropping out of required programs can count as non-compliance.',
    contact: 'Contact with restricted people or places is taken seriously by the court.',
    financial: 'Not making required payments can extend supervision or add penalties.',
  };
  return warnings[type] || 'Follow this condition carefully and ask your officer or lawyer if you are unsure.';
}

async function enhanceWithGroq(obligations, jurisdiction) {
  if (!groqClient || obligations.length === 0) return obligations;

  const promptLines = obligations
    .map((ob, idx) => `${idx + 1}. ${ob.originalText}`)
    .join('\n');

  const prompt = `You are helping someone on probation, parole, or supervised release understand their conditions.
Explain each condition in clear, calm, plain English (no legal jargon) and give one short compliance tip.
Jurisdiction: ${jurisdiction} (you do not need to be exact to local law, just stay general and safe).

Conditions:\n${promptLines}\n\nFor each item, respond in order as Markdown bullet points. For example:\n- 1: explanation and tip\n- 2: explanation and tip`;

  const completion = await groqClient.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'You explain supervision conditions in simple, non-legal language.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 800,
  });

  const content = completion.choices?.[0]?.message?.content || '';

  // Simple mapping: attach the whole Groq explanation to each item as an extra note.
  // This avoids brittle parsing while still surfacing the richer guidance.
  return obligations.map((ob) => ({
    ...ob,
    explanation: `${ob.explanation}\n\nAdditional guidance:\n${content}`,
  }));
}

module.exports = { interpretConditions };
