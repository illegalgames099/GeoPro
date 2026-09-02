import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const code = html.match(/function load\(key, fallback\) \{[\s\S]*?catch \(e\) \{\}\r?\n\}/)[0];

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
        return { load, save };
    `);

    const { load, save } = sandbox(global);
    return { load, save, store };
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
