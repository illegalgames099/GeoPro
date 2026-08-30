const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('load function from index.html', () => {
  let localStorageMock;
  let loadFn;
  let storeConst;

  beforeAll(() => {
    // Extract the code directly from index.html for testing
    const indexPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    const storeMatch = html.match(/(const STORE = ['"][^'"]+['"];)/);
    const loadMatch = html.match(/(function load\([^)]*\)\s*\{[\s\S]*?\n\})/);

    if (!storeMatch || !loadMatch) {
      throw new Error("Could not find STORE or load function in index.html");
    }

    const scriptCode = `
      ${storeMatch[1]}
      ${loadMatch[1]}
      global.testContext = { load, STORE };
    `;

    // Create a context with mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };

    const context = vm.createContext({
      localStorage: localStorageMock,
      JSON: JSON,
      global: {}
    });

    vm.runInContext(scriptCode, context);
    loadFn = context.global.testContext.load;
    storeConst = context.global.testContext.STORE;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return parsed value if it exists in localStorage', () => {
    const key = 'settings';
    const val = { theme: 'dark' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(val));

    const result = loadFn(key, 'default_fallback');

    expect(localStorageMock.getItem).toHaveBeenCalledWith(storeConst + key);
    expect(result).toEqual(val);
  });

  test('should return fallback if item does not exist (null)', () => {
    const key = 'missing_key';
    localStorageMock.getItem.mockReturnValue(null);

    const result = loadFn(key, 'default_fallback');

    expect(localStorageMock.getItem).toHaveBeenCalledWith(storeConst + key);
    expect(result).toBe('default_fallback');
  });

  test('should return fallback if JSON.parse throws an error', () => {
    const key = 'invalid_key';
    localStorageMock.getItem.mockReturnValue('invalid json format');

    const result = loadFn(key, 'default_fallback');

    expect(localStorageMock.getItem).toHaveBeenCalledWith(storeConst + key);
    expect(result).toBe('default_fallback');
  });

  test('should return fallback if localStorage.getItem throws an error', () => {
    const key = 'error_key';
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage is disabled');
    });

    const result = loadFn(key, 'default_fallback');

    expect(localStorageMock.getItem).toHaveBeenCalledWith(storeConst + key);
    expect(result).toBe('default_fallback');
  });
});
