const assert = require('assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const match = html.match(/const stripTags = (.*?);/);
if (!match) throw new Error("Could not find stripTags function in index.html");
const stripTags = eval(match[1]);

test('stripTags utility', () => {
    assert.strictEqual(stripTags('<b>hello</b>'), 'hello');
    assert.strictEqual(stripTags('hello'), 'hello');
    assert.strictEqual(stripTags('<p>hello <span>world</span></p>'), 'hello world');
    assert.strictEqual(stripTags(''), '');
    assert.strictEqual(stripTags(null), 'null');
    assert.strictEqual(stripTags(undefined), 'undefined');
    assert.strictEqual(stripTags('<>'), '<>'); // Since <[^>]+> matches 1 or more not > characters, <> does not match. So it returns '<>'.
});
