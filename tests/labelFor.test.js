const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('labelFor function', async (t) => {
    // Read the index.html file
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Extract the labelFor function definition
    const match = html.match(/function labelFor\(p\) \{[\s\S]*?\n\}/);
    if (!match) {
        throw new Error("Could not find 'labelFor' function in index.html");
    }

    // Evaluate the function
    const labelForCode = match[0];
    const labelFor = new Function('return ' + labelForCode)();

    await t.test('returns name if present (no housenumber or street)', () => {
        assert.strictEqual(labelFor({ name: 'Central Park' }), 'Central Park');
    });

    await t.test('returns housenumber and street if name is missing', () => {
        assert.strictEqual(labelFor({ housenumber: '350', street: '5th Ave', city: 'New York' }), '350 5th Ave');
    });

    await t.test('returns only housenumber if street and name are missing', () => {
        assert.strictEqual(labelFor({ housenumber: '350', city: 'New York' }), '350');
    });

    await t.test('returns street if name is present and housenumber is missing', () => {
        // Because of the order p.street || p.name, if name is true it evaluates `${''} ${p.street}`
        assert.strictEqual(labelFor({ name: 'Central Park', street: '5th Ave', city: 'New York' }), '5th Ave');
    });

    await t.test('returns city if name and housenumber are missing', () => {
        assert.strictEqual(labelFor({ city: 'New York', street: '5th Ave' }), 'New York');
    });

    await t.test('returns town if city is missing', () => {
        assert.strictEqual(labelFor({ town: 'Springfield' }), 'Springfield');
    });

    await t.test('returns village if city and town are missing', () => {
        assert.strictEqual(labelFor({ village: 'Oak Park' }), 'Oak Park');
    });

    await t.test('returns state if city, town, and village are missing', () => {
        assert.strictEqual(labelFor({ state: 'California' }), 'California');
    });

    await t.test('returns "?" if all properties are missing', () => {
        assert.strictEqual(labelFor({}), '?');
    });

    await t.test('returns "?" if only unhandled properties are present', () => {
        assert.strictEqual(labelFor({ county: 'New York County' }), '?');
    });
});
