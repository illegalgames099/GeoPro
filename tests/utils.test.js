const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('esc utility function', async (t) => {
    // Read the index.html file
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Extract the esc function definition
    const match = html.match(/const esc = s => [^\n]+;/);
    if (!match) {
        throw new Error("Could not find 'esc' function in index.html");
    }

    // Remove the 'const esc = ' part to evaluate it
    const escCode = match[0].replace('const esc = ', '');
    const esc = eval(escCode);

    // Test cases
    await t.test('should leave regular strings unchanged', () => {
        assert.strictEqual(esc('hello world'), 'hello world');
        assert.strictEqual(esc('12345'), '12345');
        assert.strictEqual(esc(''), '');
    });

    await t.test('should escape special characters', () => {
        assert.strictEqual(esc('Tom & Jerry'), 'Tom &amp; Jerry');
        assert.strictEqual(esc('<b>bold</b>'), '&lt;b&gt;bold&lt;/b&gt;');
        assert.strictEqual(esc('"quoted"'), '&quot;quoted&quot;');
        assert.strictEqual(esc('<<<>>>'), '&lt;&lt;&lt;&gt;&gt;&gt;');
        assert.strictEqual(esc('&&&'), '&amp;&amp;&amp;');
        assert.strictEqual(esc('<script>alert("XSS & 1")</script>'), '&lt;script&gt;alert(&quot;XSS &amp; 1&quot;)&lt;/script&gt;');
    });

    await t.test('should handle edge cases (non-strings)', () => {
        assert.strictEqual(esc(null), 'null');
        assert.strictEqual(esc(undefined), 'undefined');
        assert.strictEqual(esc(123), '123');
        assert.strictEqual(esc(false), 'false');
    });
});
