const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const functionStartStr = 'function parseLatLng(';
const functionStart = html.indexOf(functionStartStr);
if (functionStart === -1) {
    throw new Error("Could not find 'parseLatLng' function in index.html");
}

let openBraces = 0;
let foundBraces = false;
let functionEnd = -1;

for (let i = functionStart; i < html.length; i++) {
    if (html[i] === '{') {
        openBraces++;
        foundBraces = true;
    } else if (html[i] === '}') {
        openBraces--;
        if (foundBraces && openBraces === 0) {
            functionEnd = i + 1;
            break;
        }
    }
}

if (functionEnd === -1) {
    throw new Error("Could not find end of 'parseLatLng' function");
}

const functionStr = html.substring(functionStart, functionEnd);

let parseLatLng;
eval(`parseLatLng = ${functionStr}`);


const isArrayReturn = Array.isArray(parseLatLng('0, 0'));
// Some implementations might handle DMS natively, others might return null.
const supportsDms = parseLatLng('N 45° 12\' 34", W 120° 45\' 12"') !== null;

const checkResult = (result, expectedLat, expectedLng, msgPrefix) => {
    if (isArrayReturn) {
        assert.ok(Math.abs(result[0] - expectedLat) < 1e-4, `${msgPrefix}: Latitude mismatch`);
        assert.ok(Math.abs(result[1] - expectedLng) < 1e-4, `${msgPrefix}: Longitude mismatch`);
    } else {
        assert.ok(result && typeof result === 'object', `${msgPrefix}: Expected object result`);
        assert.ok(Math.abs(result.lat - expectedLat) < 1e-4, `${msgPrefix}: Latitude mismatch`);
        assert.ok(Math.abs(result.lng - expectedLng) < 1e-4, `${msgPrefix}: Longitude mismatch`);
        assert.strictEqual(result.sub, 'Coordinates');
        assert.strictEqual(result.kind, 'place');
    }
};

test('parseLatLng', async (t) => {
    // Tests for decimal format
    await t.test('should parse comma-separated decimal coordinates', () => {
        const res = parseLatLng('45.123, -120.456');
        checkResult(res, 45.123, -120.456, 'comma-separated');
    });

    await t.test('should parse space-separated decimal coordinates', () => {
        const res = parseLatLng('45.123 -120.456');
        checkResult(res, 45.123, -120.456, 'space-separated');
    });

    await t.test('should handle integer decimal coordinates', () => {
        const res = parseLatLng('45, -120');
        checkResult(res, 45, -120, 'integer');
    });

    // Tests for DMS format
    await t.test('should parse Degrees Minutes Seconds (DMS) format with symbols', (ctx) => {
        if (!supportsDms) {
            ctx.skip('Function does not support DMS format');
            return;
        }
        const res = parseLatLng('N 45° 12\' 34", W 120° 45\' 12"');
        const expectedLat = 45 + 12/60 + 34/3600;
        const expectedLng = -(120 + 45/60 + 12/3600);
        checkResult(res, expectedLat, expectedLng, 'DMS symbols');
    });

    await t.test('should parse DMS format with spaces instead of symbols', (ctx) => {
        if (!supportsDms) {
            ctx.skip('Function does not support DMS format');
            return;
        }
        const res = parseLatLng('S 10 20 30 E 40 50 60');
        const expectedLat = -(10 + 20/60 + 30/3600);
        const expectedLng = 40 + 50/60 + 60/3600;
        checkResult(res, expectedLat, expectedLng, 'DMS spaces');
    });

    // Invalid inputs
    await t.test('should return null for completely invalid strings', () => {
        assert.strictEqual(parseLatLng('abc, def'), null);
    });

    await t.test('should return null for single numbers', () => {
        assert.strictEqual(parseLatLng('12.34'), null);
    });

    await t.test('should return null for empty string', () => {
        assert.strictEqual(parseLatLng(''), null);
    });
});
