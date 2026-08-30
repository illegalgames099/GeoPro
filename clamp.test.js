const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const clampCode = html.match(/(const clamp = [^\n]+)/)[1];
eval(clampCode + "; global.clamp = clamp;");

test('clamp utility', (t) => {
  assert.strictEqual(clamp(5, 0, 10), 5, 'value within range should return the value');
  assert.strictEqual(clamp(-5, 0, 10), 0, 'value below min should return the min');
  assert.strictEqual(clamp(15, 0, 10), 10, 'value above max should return the max');
  assert.strictEqual(clamp(0, 0, 10), 0, 'value exactly at min should return the min');
  assert.strictEqual(clamp(10, 0, 10), 10, 'value exactly at max should return the max');
});
