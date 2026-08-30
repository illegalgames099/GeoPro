const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert');

const html = fs.readFileSync('index.html', 'utf8');

const radMatch = html.match(/const RAD = [^;]+;/)[0];
const mpdMatch = html.match(/function mpd\([^)]+\) \{[\s\S]*?\n\}/)[0];
const dist2Match = html.match(/function dist2\([^)]+\) \{[\s\S]*?\n\}/)[0];

const code = `${radMatch}\n${mpdMatch}\n${dist2Match}\nmodule.exports = { dist2 };`;
const moduleCode = new Function('module', code);
const fakeModule = { exports: {} };
moduleCode(fakeModule);
const { dist2 } = fakeModule.exports;

test('dist2 distance calculations', async (t) => {
  await t.test('same point should be 0', () => {
    assert.strictEqual(dist2([0, 0], [0, 0]), 0);
    assert.strictEqual(dist2([-122.4194, 37.7749], [-122.4194, 37.7749]), 0);
  });

  await t.test('1 degree of latitude at equator', () => {
    // 1 degree of latitude is roughly 111,132 meters anywhere, but slightly varies by latitude.
    // The mpd function returns `lat: 111132.92 - 559.82 * Math.cos(2 * lat * RAD) + 1.175 * Math.cos(4 * lat * RAD)`
    // At lat=0 (equator), cos(0)=1. 111132.92 - 559.82 + 1.175 = 110574.275
    // The average latitude is 0.5.
    const dist = dist2([0, 0], [0, 1]);
    assert.ok(Math.abs(dist - 110574.36) < 1, `Expected ~110574.36, got ${dist}`);
  });

  await t.test('1 degree of longitude at equator', () => {
    // The mpd function returns `lng: 111412.84 * c - 93.5 * Math.cos(3 * lat * RAD)`
    // Average lat = 0.
    const dist = dist2([0, 0], [1, 0]);
    assert.ok(Math.abs(dist - 111319.34) < 1, `Expected ~111319.34, got ${dist}`);
  });

  await t.test('distance over a small scale (street scale) is accurate', () => {
    // 10 meters roughly in degrees
    const latOffset = 10 / 111132.92;
    const dist = dist2([0, 0], [0, latOffset]);
    assert.ok(Math.abs(dist - 10) < 0.1, `Expected ~10m, got ${dist}`);
  });

  await t.test('works with negative coordinates and arbitrary distances', () => {
    // E.g., moving slightly in San Francisco
    const a = [-122.4194, 37.7749];
    const b = [-122.4190, 37.7750]; // ~40-50 meters
    const dist = dist2(a, b);
    assert.ok(dist > 0 && dist < 100, `Expected distance between 0 and 100m, got ${dist}`);
  });
});
