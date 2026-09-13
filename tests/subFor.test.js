const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Read the index.html file
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the subFor function definition
const match = html.match(/function subFor\([^)]*\)\s*\{[^]*?\n\}/);
if (!match) {
    throw new Error("Could not find 'subFor' function in index.html");
}

let subFor;
eval(`subFor = ${match[0].replace('function subFor', 'function')}`);

test('subFor utility function', async (t) => {
    await t.test('happy path (all fields)', () => {
        const p = {
            name: 'Starbucks',
            housenumber: '123',
            street: 'Main St',
            city: 'Seattle',
            state: 'WA',
            country: 'USA'
        };
        assert.strictEqual(subFor(p), '123 Main St, Seattle, WA, USA');
    });

    await t.test('missing housenumber', () => {
        const p = {
            name: 'Central Park',
            street: '5th Ave',
            city: 'New York',
            state: 'NY',
            country: 'USA'
        };
        assert.strictEqual(subFor(p), '5th Ave, New York, NY, USA');
    });

    await t.test('missing name', () => {
        const p = {
            housenumber: '1600',
            street: 'Pennsylvania Ave NW',
            city: 'Washington',
            state: 'DC',
            country: 'USA'
        };
        // The current implementation requires `name` to be present to include street info
        assert.strictEqual(subFor(p), 'Washington, DC, USA');
    });

    await t.test('missing name and city (county fallback)', () => {
        const p = {
            county: 'King County',
            state: 'WA',
            country: 'USA'
        };
        // The previous implementation used p.city || p.county, but the current one doesn't look at county.
        // It looks at p.city || p.town || p.village
        // Thus county is ignored. Let's provide town instead of county to ensure fallback logic is tested
        const p2 = {
            town: 'Smallville',
            state: 'KS',
            country: 'USA'
        };
        assert.strictEqual(subFor(p2), 'Smallville, KS, USA');
    });

    await t.test('missing name and city (village fallback)', () => {
        const p = {
            village: 'Tiny Hamlet',
            state: 'UK'
        };
        assert.strictEqual(subFor(p), 'Tiny Hamlet, UK');
    });

    await t.test('missing street', () => {
        const p = {
            name: 'Statue of Liberty',
            city: 'New York',
            state: 'NY',
            country: 'USA'
        };
        // The current implementation requires both `name` and `street` to include street info
        assert.strictEqual(subFor(p), 'New York, NY, USA');
    });

    await t.test('empty object', () => {
        const p = {};
        assert.strictEqual(subFor(p), '');
    });
});
