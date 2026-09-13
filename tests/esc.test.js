const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const match = html.match(/const esc = s => [^\n]+;/);
if (!match) throw new Error("Could not find esc function in index.html");
const escCode = match[0].replace('const esc = ', '');
const esc = eval(escCode);

test('esc utility', () => {
    // Basic functionality
    assert.strictEqual(esc('hello'), 'hello');

    // Single special characters
    assert.strictEqual(esc('&'), '&amp;');
    assert.strictEqual(esc('<'), '&lt;');
    assert.strictEqual(esc('>'), '&gt;');
    assert.strictEqual(esc('"'), '&quot;');

    // Multiple special characters
    assert.strictEqual(esc('a & b < c > d "e"'), 'a &amp; b &lt; c &gt; d &quot;e&quot;');
    assert.strictEqual(esc('<<<<'), '&lt;&lt;&lt;&lt;');
    assert.strictEqual(esc('&&&&'), '&amp;&amp;&amp;&amp;');

    // Edge cases for different types
    assert.strictEqual(esc(''), '');
    assert.strictEqual(esc(null), 'null');
    assert.strictEqual(esc(undefined), 'undefined');
    assert.strictEqual(esc(12345), '12345');
    assert.strictEqual(esc(true), 'true');
    assert.strictEqual(esc(false), 'false');

    // Complex HTML-like strings
    assert.strictEqual(esc('<div class="test">&</div>'), '&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;');
});
