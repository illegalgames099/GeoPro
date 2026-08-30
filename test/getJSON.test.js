const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const getJSONMatch = html.match(/async function getJSON[\s\S]*?finally {\s*clearTimeout\(t\);\s*}\s*}/);
if (!getJSONMatch) {
  throw new Error("Could not find getJSON function in index.html");
}
const getJSONStr = getJSONMatch[0];

test('getJSON', async (t) => {
  await t.test('returns JSON on successful response', async () => {
    const context = {
      setTimeout, clearTimeout, AbortController,
      fetch: async (url, options) => {
        return {
          ok: true,
          json: async () => ({ success: true, url })
        };
      }
    };
    vm.createContext(context);
    vm.runInContext(getJSONStr, context);

    const result = await context.getJSON('https://example.com/api');
    assert.deepStrictEqual(result, { success: true, url: 'https://example.com/api' });
  });

  await t.test('throws error on non-OK response', async () => {
    const context = {
      setTimeout, clearTimeout, AbortController,
      fetch: async (url, options) => {
        return {
          ok: false,
          status: 404
        };
      }
    };
    vm.createContext(context);
    vm.runInContext(getJSONStr, context);

    await assert.rejects(
      async () => {
        await context.getJSON('https://example.com/api');
      },
      {
        name: 'Error',
        message: 'HTTP 404'
      }
    );
  });

  await t.test('aborts on timeout', async () => {
    const context = {
      setTimeout, clearTimeout, AbortController,
      fetch: async (url, options) => {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            reject(new Error('AbortError'));
          });
        });
      }
    };
    vm.createContext(context);
    vm.runInContext(getJSONStr, context);

    await assert.rejects(
      async () => {
        await context.getJSON('https://example.com/api', { timeout: 10 });
      },
      {
        message: 'AbortError'
      }
    );
  });

  await t.test('passes headers to fetch', async () => {
    let capturedHeaders = null;
    const context = {
      setTimeout, clearTimeout, AbortController,
      fetch: async (url, options) => {
        capturedHeaders = options.headers;
        return {
          ok: true,
          json: async () => ({})
        };
      }
    };
    vm.createContext(context);
    vm.runInContext(getJSONStr, context);

    await context.getJSON('https://example.com/api', { headers: { 'X-Test': 'true' } });
    assert.deepStrictEqual(capturedHeaders, { 'X-Test': 'true' });
  });
});
