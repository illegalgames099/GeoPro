// service-worker.test.js
describe('Service Worker', () => {
  let listeners = {};

  beforeEach(() => {
    // Reset listeners
    listeners = {};

    // Mock global scope for service worker
    global.self = {
      addEventListener: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
      location: {
        origin: 'http://localhost:3000',
      },
      skipWaiting: jest.fn(),
      clients: {
        claim: jest.fn(),
      },
    };

    // Mock caches
    global.caches = {
      open: jest.fn(),
      match: jest.fn(),
      keys: jest.fn(),
      delete: jest.fn(),
    };

    // Mock fetch
    global.fetch = jest.fn();

    // Reset module registry to reload service-worker.js for each test
    jest.resetModules();

    // Load the service worker
    require('./service-worker.js');
  });

  afterEach(() => {
    delete global.self;
    delete global.caches;
    delete global.fetch;
  });

  it('should register install, activate, and fetch listeners', () => {
    expect(listeners.install).toBeDefined();
    expect(listeners.activate).toBeDefined();
    expect(listeners.fetch).toBeDefined();
  });

  describe('fetch event fallback', () => {
    it('falls back to cache when fetch fails', async () => {
      // Setup fetch to fail
      global.fetch.mockRejectedValue(new Error('Network failure'));

      // Setup cache match to return a response
      const mockCachedResponse = { status: 200, body: 'cached data' };
      global.caches.match.mockImplementation(async (req) => {
        if (req === fetchEvent.request) {
          return mockCachedResponse;
        }
        return undefined;
      });

      // Create a mock fetch event
      let respondWithPromise;
      const fetchEvent = {
        request: {
          method: 'GET',
          url: 'http://localhost:3000/some/path',
        },
        respondWith: jest.fn((promise) => {
          respondWithPromise = promise;
        }),
      };

      // Trigger fetch event
      listeners.fetch(fetchEvent);

      // Wait for respondWith to resolve
      const response = await respondWithPromise;

      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(global.caches.match).toHaveBeenCalledWith(fetchEvent.request);
      expect(response).toBe(mockCachedResponse);
    });

    it('falls back to index.html when fetch fails and request is not in cache', async () => {
      // Setup fetch to fail
      global.fetch.mockRejectedValue(new Error('Network failure'));

      // Setup cache match to return undefined for the request, but return index.html
      const mockIndexHtmlResponse = { status: 200, body: 'index html' };
      global.caches.match.mockImplementation(async (req) => {
        if (req === './index.html') {
          return mockIndexHtmlResponse;
        }
        return undefined;
      });

      // Create a mock fetch event
      let respondWithPromise;
      const fetchEvent = {
        request: {
          method: 'GET',
          url: 'http://localhost:3000/some/path',
        },
        respondWith: jest.fn((promise) => {
          respondWithPromise = promise;
        }),
      };

      // Trigger fetch event
      listeners.fetch(fetchEvent);

      // Wait for respondWith to resolve
      const response = await respondWithPromise;

      expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      expect(global.caches.match).toHaveBeenCalledWith(fetchEvent.request);
      expect(global.caches.match).toHaveBeenCalledWith('./index.html');
      expect(response).toBe(mockIndexHtmlResponse);
    });
  });
});
