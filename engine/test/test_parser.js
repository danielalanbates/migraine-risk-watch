const { parseConditions } = require('../conditions_parser');
const assert = require('assert');

(async () => {
  console.log('Running parser tests...');
  
  const testText = `You shall report to your officer weekly.
  You must not leave the county without permission.
  Participate in substance abuse treatment.`;
  
  const results = await parseConditions(testText, 'CA');
  
  try {
    assert.equal(results.length, 3);
    assert.equal(results[0].type, 'reporting');
    assert.equal(results[0].frequency, 'weekly');
    assert.equal(results[1].type, 'travel');
    assert.equal(results[2].type, 'program');
    console.log('✓ All tests passed');
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
})();
