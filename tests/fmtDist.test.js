const fs = require('fs');
const assert = require('assert');
const { test, describe, it } = require('node:test');

const html = fs.readFileSync('index.html', 'utf8');

// Match the exact function from the HTML file using a more robust regex
// It looks for "function fmtDist(" up to the closing brace "}" that's on a new line or preceded by spaces
const match = html.match(/function fmtDist\([^)]*\)\s*\{[^]*?\n\}/);

if (!match) {
    throw new Error("Could not find fmtDist function in index.html");
}

const fmtDistStr = match[0].replace(/=\s*IMPERIAL/, '= false');

let fmtDist;
eval(`fmtDist = ${fmtDistStr}`);

describe('fmtDist', () => {
    describe('metric (imperial = false)', () => {
        it('should round distances under 10m to 10 m', () => {
            assert.strictEqual(fmtDist(2, false), '10 m');
            assert.strictEqual(fmtDist(9, false), '10 m');
        });

        it('should round distances under 1000m to nearest 10m', () => {
            assert.strictEqual(fmtDist(14, false), '10 m');
            assert.strictEqual(fmtDist(15, false), '20 m');
            assert.strictEqual(fmtDist(555, false), '560 m');
            assert.strictEqual(fmtDist(994, false), '990 m');
            assert.strictEqual(fmtDist(995, false), '1000 m');
        });

        it('should format distances between 1000m and 10000m to 1 decimal place km', () => {
            assert.strictEqual(fmtDist(1000, false), '1.0 km');
            assert.strictEqual(fmtDist(1490, false), '1.5 km');
            assert.strictEqual(fmtDist(9940, false), '9.9 km');
            assert.strictEqual(fmtDist(9990, false), '10.0 km');
        });

        it('should format distances 10000m and above to nearest integer km', () => {
            assert.strictEqual(fmtDist(10000, false), '10 km');
            assert.strictEqual(fmtDist(10499, false), '10 km');
            assert.strictEqual(fmtDist(10500, false), '11 km');
            assert.strictEqual(fmtDist(99500, false), '100 km');
        });
    });

    describe('imperial (imperial = true)', () => {
        it('should round small distances to minimum 10 ft', () => {
            // 1 meter = 3.28084 feet
            assert.strictEqual(fmtDist(1, true), '10 ft');
            assert.strictEqual(fmtDist(2, true), '10 ft'); // 6.56 ft
        });

        it('should round distances under 1000 ft to nearest 10 ft', () => {
            // 10 meters = 32.8084 feet -> 30 ft
            assert.strictEqual(fmtDist(10, true), '30 ft');
            // 100 meters = 328.084 feet -> 330 ft
            assert.strictEqual(fmtDist(100, true), '330 ft');
            // 300 meters = 984.252 feet -> 980 ft
            assert.strictEqual(fmtDist(300, true), '980 ft');
        });

        it('should format distances between 1000 ft and 10 miles to 1 decimal place mi', () => {
            // 304.8 meters = 1000 feet -> 0.2 mi
            assert.strictEqual(fmtDist(304.8, true), '0.2 mi');
            // 1609.34 meters = 1 mile -> 1.0 mi
            assert.strictEqual(fmtDist(1609.344, true), '1.0 mi');
            // 8046.72 meters = 5 miles -> 5.0 mi
            assert.strictEqual(fmtDist(8046.72, true), '5.0 mi');
        });

        it('should format distances 10 miles and above to nearest integer mi', () => {
            // 16093.4 meters = 10 miles -> 10 mi
            assert.strictEqual(fmtDist(16093.44, true), '10 mi');
            // 16898.1 meters = 10.5 miles -> 11 mi
            assert.strictEqual(fmtDist(16898.112, true), '11 mi');
            // 160934 meters = 100 miles -> 100 mi
            assert.strictEqual(fmtDist(160934.4, true), '100 mi');
        });
    });

    describe('edge cases', () => {
        it('should handle zero gracefully', () => {
            assert.strictEqual(fmtDist(0, false), '10 m');
            assert.strictEqual(fmtDist(0, true), '10 ft');
        });

        it('should handle negative distances (although conceptually invalid, returns min limit)', () => {
            assert.strictEqual(fmtDist(-50, false), '10 m');
            assert.strictEqual(fmtDist(-50, true), '10 ft');
        });
    });
});
