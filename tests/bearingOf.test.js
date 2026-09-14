const fs = require('fs');
const assert = require('assert');
const { test, describe, it } = require('node:test');

const html = fs.readFileSync('index.html', 'utf8');

// Extract the RAD constant
const radMatch = html.match(/const RAD = [^;]+;/);
if (!radMatch) throw new Error("Could not find RAD constant");
eval(radMatch[0].replace('const RAD', 'var RAD'));

// Extract the bearingOf function
const match = html.match(/function bearingOf\([^)]*\)\s*\{[^]*?\n\}/);
if (!match) {
    throw new Error("Could not find bearingOf function in index.html");
}

let bearingOf;
eval(`bearingOf = ${match[0]}`);

describe('bearingOf', () => {
    // Due to floating point math, we should check approximate equality
    function assertApprox(actual, expected, tolerance = 1e-6) {
        if (Math.abs(actual - expected) > tolerance) {
            assert.fail(`Expected ${actual} to be close to ${expected}`);
        }
    }

    describe('cardinal directions', () => {
        it('should calculate North correctly', () => {
            // lng, lat
            assertApprox(bearingOf([0, 0], [0, 10]), 0);
        });

        it('should calculate East correctly', () => {
            assertApprox(bearingOf([0, 0], [10, 0]), 90);
        });

        it('should calculate South correctly', () => {
            assertApprox(bearingOf([0, 0], [0, -10]), 180);
        });

        it('should calculate West correctly', () => {
            assertApprox(bearingOf([0, 0], [-10, 0]), 270);
        });
    });

    describe('intermediate directions', () => {
        it('should calculate North-East correctly', () => {
            // Note: bearing changes along the great circle, but from origin (0,0) to a symmetric point, we can check.
            const result = bearingOf([0, 0], [10, 10]);
            // It's not exactly 45 degrees due to spherical geometry, but close.
            // Let's test a very small distance to approximate flat plane.
            assertApprox(bearingOf([0, 0], [0.0001, 0.0001]), 45, 0.01);
        });

        it('should calculate South-West correctly', () => {
            assertApprox(bearingOf([0, 0], [-0.0001, -0.0001]), 225, 0.01);
        });
    });

    describe('edge cases', () => {
        it('should return 0 when comparing the same point', () => {
            assertApprox(bearingOf([10, 10], [10, 10]), 0);
        });

        it('should handle crossing the anti-meridian', () => {
            // e.g., from 179 to -179 is heading East.
            // Wait, from 179 to -179:
            // a = [179, 0], b = [-179, 0]
            // bearing should be 90 (East) or very close to it.
            assertApprox(bearingOf([179, 0], [-179, 0]), 90);
        });

        it('should handle crossing the anti-meridian westward', () => {
            assertApprox(bearingOf([-179, 0], [179, 0]), 270);
        });
    });
});
