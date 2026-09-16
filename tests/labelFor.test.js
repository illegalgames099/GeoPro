const test = require('node:test');
const assert = require('node:assert');
const { labelFor } = require('../assets/utils');

test('labelFor function', async (t) => {
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

    await t.test('returns city if name, street, and housenumber are missing', () => {
        assert.strictEqual(labelFor({ city: 'New York', town: 'Springfield' }), 'New York');
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

    await t.test('handles null or undefined input', () => {
        assert.strictEqual(labelFor(null), '?');
        assert.strictEqual(labelFor(undefined), '?');
    });

    await t.test('trims whitespace when assembling string', () => {
        assert.strictEqual(labelFor({ housenumber: '', street: 'Main St' }), 'Main St');
    });
});
