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
    // Basic tags
    assert.strictEqual(stripTags('<b>hello</b>'), 'hello');
    assert.strictEqual(stripTags('hello'), 'hello');
    assert.strictEqual(stripTags('<h1>Title</h1>'), 'Title');

    // Nested tags
    assert.strictEqual(stripTags('<p>hello <span>world</span></p>'), 'hello world');
    assert.strictEqual(stripTags('<div><p>text</p></div>'), 'text');

    // Attributes
    assert.strictEqual(stripTags('<a href="https://example.com">link</a>'), 'link');
    assert.strictEqual(stripTags('<span class="bold color-red" data-id="123">text</span>'), 'text');
    assert.strictEqual(stripTags('<div onclick="alert(\'hello\')">click</div>'), 'click');

    // Self-closing tags
    assert.strictEqual(stripTags('line<br/>break'), 'linebreak');
    assert.strictEqual(stripTags('line<br />break'), 'linebreak');
    assert.strictEqual(stripTags('img<img src="test.jpg" />here'), 'imghere');
    assert.strictEqual(stripTags('<hr>'), '');

    // Malformed / weird tags
    assert.strictEqual(stripTags('<>'), '<>'); // Since <[^>]+> matches 1 or more not > characters, <> does not match
    assert.strictEqual(stripTags('a < b > c'), 'a  c'); // < b > is treated as a tag by the regex
    assert.strictEqual(stripTags('div>'), 'div>'); // Unmatched closing bracket
    assert.strictEqual(stripTags('<div'), '<div'); // Unmatched opening bracket

    // Edge cases and type coercion
    assert.strictEqual(stripTags(''), '');
    assert.strictEqual(stripTags(null), 'null');
    assert.strictEqual(stripTags(undefined), 'undefined');
    assert.strictEqual(stripTags(123), '123');
    assert.strictEqual(stripTags(true), 'true');
    assert.strictEqual(stripTags({}), '[object Object]');

    // Multi-line tags/strings
    assert.strictEqual(stripTags('<div>\nhello\n</div>'), '\nhello\n');
    assert.strictEqual(stripTags('<div\nclass="test"\n>multi-line tag</div>'), 'multi-line tag');
});
