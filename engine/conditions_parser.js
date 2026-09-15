const OBLIGATION_TYPES = require('./obligation_types');

const JURISDICTION_RULES = {
  'CA': { maxTravelMiles: 50 },
  'TX': { maxTravelMiles: 100 }
};

async function parseConditions(text, jurisdiction = 'generic') {
  if (!text) return [];
  
  const lines = text.split(/[\n\.]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines.map(line => classifyObligation(line, jurisdiction)).filter(Boolean);
}

function classifyObligation(text, jurisdiction) {
  const lowerText = text.toLowerCase();
  const obligation = { originalText: text, jurisdiction };

  if (/shall report|must report|report to|check in/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.REPORTING;
    obligation.frequency = extractFrequency(text);
  } 
  else if (/not leave|travel restricted|confine/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.TRAVEL;
    obligation.limit = JURISDICTION_RULES[jurisdiction]?.maxTravelMiles || 'unspecified';
  }
  else if (/no (?:alcohol|drugs)|substance (?:test|screen)/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.SUBSTANCE_USE;
  }
  else if (/participate in|attend|program|class/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.PROGRAM;
  }
  else if (/no contact|not associate/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.CONTACT;
  }
  else if (/pay|fee|restitution|fine/.test(lowerText)) {
    obligation.type = OBLIGATION_TYPES.FINANCIAL;
  }

  return obligation.type ? obligation : null;
}

function extractFrequency(text) {
  if (/weekly|every week/.test(text)) return 'weekly';
  if (/monthly|once a month/.test(text)) return 'monthly';
  return 'as directed';
}

module.exports = { parseConditions };
