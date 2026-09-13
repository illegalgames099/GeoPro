import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const code = html.match(/const _storeCache = new Map\(\);\r?\nfunction load\(key, fallback\) \{[\s\S]*?catch \(e\) \{\}\r?\n\}/)[0];

const setup = () => {
    const store = new Map();
    global.localStorage = {
        getItem: (key) => store.get(key) || null,
        setItem: (key, val) => store.set(key, String(val)),
    };
    global.STORE = 'geopro.';

    // We can evaluate it and put the functions into a scope
    const sandbox = new Function('global', `
        const STORE = global.STORE;
        const localStorage = global.localStorage;
        ${code}
        return { load, save, _storeCache };
    `);

    const { load, save, _storeCache } = sandbox(global);
    return { load, save, store, _storeCache };
};

test('save and load basic functionality', () => {
    const { load, save, store } = setup();

    save('test', { foo: 'bar' });
    assert.deepStrictEqual(load('test', null), { foo: 'bar' });

    // Check inner structure
    assert.strictEqual(store.get('geopro.test'), '{"foo":"bar"}');
});

test('load fallback', () => {
    const { load } = setup();

    assert.strictEqual(load('nonexistent', 'fallback_value'), 'fallback_value');
});

test('load error handling (malformed json)', () => {
    const { load, store } = setup();

    store.set('geopro.bad', '{bad json');
    assert.strictEqual(load('bad', 'fallback_value'), 'fallback_value');
});

test('save error handling', () => {
    const { load, save } = setup();

    // Create an object with a circular reference which JSON.stringify can't handle
    const obj = {};
    obj.circular = obj;

    // This should not throw an error because it's caught
    save('circular', obj);

    // The previous value (none) or fallback should be returned
    assert.strictEqual(load('circular', 'fallback_value'), 'fallback_value');
});

test('caching behavior', () => {
    const { load, save, store, _storeCache } = setup();

    // Directly set something in localStorage that bypasses the cache
    store.set('geopro.direct', '{"from":"storage"}');

    // First load reads from storage and sets cache
    assert.deepStrictEqual(load('direct', null), { from: 'storage' });
    assert.strictEqual(_storeCache.get('direct'), '{"from":"storage"}');

    // Modify the storage directly to simulate another tab or external change
    store.set('geopro.direct', '{"from":"changed_storage"}');

    // Should return cached parsed version instead of reading storage again
    assert.deepStrictEqual(load('direct', null), { from: 'storage' });

    // Now verify caching for save
    save('direct', { from: 'cache' });
    assert.strictEqual(_storeCache.get('direct'), '{"from":"cache"}');
    assert.strictEqual(store.get('geopro.direct'), '{"from":"cache"}');

    // Clear storage but keep cache
    store.delete('geopro.direct');

    // Load should still work because it checks cache first
    assert.deepStrictEqual(load('direct', null), { from: 'cache' });
});
