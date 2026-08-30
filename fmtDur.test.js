const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert');

// Read index.html
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract fmtDur function from index.html
const match = htmlContent.match(/function fmtDur\(s\) \{[\s\S]*?\n\}/);
if (!match) {
    throw new Error('Could not find fmtDur function in index.html');
}

// Evaluate the extracted function so we can use it
// Using Function constructor to create the function from string body
const fnBodyMatch = match[0].match(/function fmtDur\(s\) \{([\s\S]*?)\n\}/);
const fmtDur = new Function('s', fnBodyMatch[1]);

test('fmtDur formats duration correctly', (t) => {
    // Under a minute
    assert.strictEqual(fmtDur(0), 'under a minute');
    assert.strictEqual(fmtDur(29), 'under a minute');

    // Minutes
    assert.strictEqual(fmtDur(30), '1 min'); // Math.round(30/60) = 1
    assert.strictEqual(fmtDur(59), '1 min');
    assert.strictEqual(fmtDur(60), '1 min');
    assert.strictEqual(fmtDur(3569), '59 min');

    // Hours and minutes
    assert.strictEqual(fmtDur(3570), '1 hr 0 min'); // 3570/60 = 59.5 => 60 mins => 1 hr
    assert.strictEqual(fmtDur(3600), '1 hr 0 min');
    assert.strictEqual(fmtDur(5400), '1 hr 30 min');

    // Days and hours
    assert.strictEqual(fmtDur(86399), '1 d 0 hr'); // Math.round(86399/60) = 1440. 1440/60 = 24.
    assert.strictEqual(fmtDur(86400), '1 d 0 hr'); // 1440 mins => 24 hrs => 1 d 0 hr
    assert.strictEqual(fmtDur(90000), '1 d 1 hr'); // 1500 mins => 25 hrs => 1 d 1 hr
});
