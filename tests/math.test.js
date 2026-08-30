const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');

// We need to mock some globals and external dependencies for JSDOM
// To avoid messy uncaught exceptions in JSDOM we provide stub objects for what it expects.
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  beforeParse(window) {
    window.matchMedia = window.matchMedia || function() {
      return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
      };
    };
    window.pmtiles = { Protocol: class Protocol {} };
    window.maplibregl = {
      addProtocol: function() {},
      Map: class Map {
        constructor() {
          this.on = function() {};
          this.once = function() {};
        }
      },
      NavigationControl: class NavigationControl {},
      GeolocateControl: class GeolocateControl {},
      ScaleControl: class ScaleControl {},
      Marker: class Marker {
        setLngLat() { return this; }
        addTo() { return this; }
        remove() { return this; }
      }
    };
  },
  virtualConsole: new (require("jsdom")).VirtualConsole()
});
const window = dom.window;

const bearingOf = window.bearingOf;

describe('bearingOf', () => {
  describe('Cardinal Directions', () => {
    it('should correctly calculate bearing due North', () => {
      expect(bearingOf([0, 0], [0, 1])).toBeCloseTo(0);
    });

    it('should correctly calculate bearing due East', () => {
      expect(bearingOf([0, 0], [1, 0])).toBeCloseTo(90);
    });

    it('should correctly calculate bearing due South', () => {
      expect(bearingOf([0, 0], [0, -1])).toBeCloseTo(180);
    });

    it('should correctly calculate bearing due West', () => {
      expect(bearingOf([0, 0], [-1, 0])).toBeCloseTo(270);
    });
  });

  describe('Ordinal Directions', () => {
    it('should calculate North-East bearing', () => {
      const b = bearingOf([0, 0], [1, 1]);
      expect(b).toBeGreaterThan(44.9);
      expect(b).toBeLessThan(45.1);
    });

    it('should calculate South-East bearing', () => {
      const b = bearingOf([0, 0], [1, -1]);
      expect(b).toBeGreaterThan(134.9);
      expect(b).toBeLessThan(135.1);
    });

    it('should calculate South-West bearing', () => {
      const b = bearingOf([0, 0], [-1, -1]);
      expect(b).toBeGreaterThan(224.9);
      expect(b).toBeLessThan(225.1);
    });

    it('should calculate North-West bearing', () => {
      const b = bearingOf([0, 0], [-1, 1]);
      expect(b).toBeGreaterThan(314.9);
      expect(b).toBeLessThan(315.1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle identical coordinates (returns 0)', () => {
      expect(bearingOf([10, 10], [10, 10])).toBe(0);
    });

    it('should calculate bearing across the anti-meridian (eastward)', () => {
      expect(bearingOf([179, 0], [-179, 0])).toBeCloseTo(90);
    });

    it('should calculate bearing across the anti-meridian (westward)', () => {
      expect(bearingOf([-179, 0], [179, 0])).toBeCloseTo(270);
    });

    it('should correctly handle calculations near poles', () => {
      const b = bearingOf([0, 89], [90, 89]);
      expect(b).toBeGreaterThan(0);
      expect(b).toBeLessThan(180);
    });
  });
});
