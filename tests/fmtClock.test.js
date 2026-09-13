const fs = require('fs');
const assert = require('assert');
const { test, describe, it } = require('node:test');

const html = fs.readFileSync('index.html', 'utf8');

// Match the fmtClock function exactly
// const fmtClock = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const match = html.match(/const\s+fmtClock\s*=\s*d\s*=>\s*d\.toLocaleTimeString\([^)]*\);/);

if (!match) {
    throw new Error("Could not find fmtClock function in index.html");
}

const fmtClockStr = match[0];
let fmtClock;
eval(`fmtClock = ${fmtClockStr.replace('const fmtClock = ', '').replace(/;$/, '')}`);

describe('fmtClock', () => {
    it('should format a date according to the locale', () => {
        const d1 = new Date(2020, 0, 1, 14, 30);
        assert.strictEqual(fmtClock(d1), d1.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    });

    it('should format midnight correctly', () => {
        const d2 = new Date(2020, 0, 1, 0, 5);
        assert.strictEqual(fmtClock(d2), d2.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    });

    it('should format noon correctly', () => {
        const d3 = new Date(2020, 0, 1, 12, 0);
        assert.strictEqual(fmtClock(d3), d3.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    });

    it('should handle single digit minutes correctly', () => {
        const d4 = new Date(2020, 0, 1, 9, 7);
        assert.strictEqual(fmtClock(d4), d4.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    });
});
