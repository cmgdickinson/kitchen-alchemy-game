const STORAGE_KEY = 'kitchen-alchemy-v1';

const localStorageMock = {
  _store: {},
  getItem(key) { return this._store[key] ?? null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
};

global.localStorage = localStorageMock;

describe('state system', () => {
  let loadState, getState, setState, resetState, getDiscoveredRecipes;

  beforeEach(() => {
    localStorageMock._store = {};
    jest.resetModules();
    ({ loadState, getState, setState, resetState, getDiscoveredRecipes } = require('../js/systems/state'));
  });

  // ── loadState ───────────────────────────────────────────────────────────────

  describe('loadState', () => {
    test('creates default state when localStorage is empty', () => {
      loadState();
      const state = getState();
      expect(state.coins).toBe(0);
      expect(state.completedOrders).toBe(0);
      expect(state.discoveredCombinations).toEqual({});
      expect(state.triggeredMilestones).toEqual([]);
      expect(state.unlockedItems).toEqual(
        ['water', 'egg', 'milk', 'flour', 'sugar', 'butter', 'salt']
      );
    });

    test('restores a previously saved state from localStorage', () => {
      const saved = {
        coins: 42,
        completedOrders: 5,
        discoveredCombinations: {
          scrambled_eggs: ['butter egg'],
          caramel: ['butter sugar'],
        },
        triggeredMilestones: ['unlock_yeast'],
        unlockedItems: ['water', 'egg', 'milk', 'flour', 'sugar', 'butter', 'salt', 'yeast'],
      };
      localStorageMock._store[STORAGE_KEY] = JSON.stringify(saved);

      loadState();
      const state = getState();
      expect(state.coins).toBe(42);
      expect(state.completedOrders).toBe(5);
      expect(state.discoveredCombinations).toEqual({
        scrambled_eggs: ['butter egg'],
        caramel: ['butter sugar'],
      });
      expect(state.triggeredMilestones).toEqual(['unlock_yeast']);
    });

    test('merges saved state with defaults so new fields get their default value', () => {
      // Simulate a save from an older version that only had coins
      localStorageMock._store[STORAGE_KEY] = JSON.stringify({ coins: 99 });

      loadState();
      const state = getState();
      expect(state.coins).toBe(99);
      expect(state.discoveredCombinations).toEqual({});
      expect(state.completedOrders).toBe(0);
    });

    test('falls back to defaults when localStorage contains invalid JSON', () => {
      localStorageMock._store[STORAGE_KEY] = '}{invalid json}{';
      loadState();
      expect(getState().coins).toBe(0);
    });

    test('can be called multiple times and always reflects localStorage at call time', () => {
      loadState();
      expect(getState().coins).toBe(0);

      localStorageMock._store[STORAGE_KEY] = JSON.stringify({ coins: 77, discoveredCombinations: {}, triggeredMilestones: [], completedOrders: 0, unlockedItems: [] });
      loadState();
      expect(getState().coins).toBe(77);
    });
  });

  // ── getState ────────────────────────────────────────────────────────────────

  describe('getState', () => {
    test('returns a default state object before loadState is called', () => {
      const state = getState();
      expect(state.coins).toBe(0);
      expect(state.discoveredCombinations).toEqual({});
      expect(typeof state).toBe('object');
    });

    test('returns a frozen reference — mutations throw and leave internal state intact', () => {
      loadState();
      const state = getState();
      // Asserting `toThrow()` without a class — under Babel/Jest, the TypeError
      // thrown inside transpiled module code isn't the same constructor
      // identity as this test file's TypeError, so toThrow(TypeError) fails an
      // `instanceof` check despite the names matching. The throw itself is the
      // contract we care about.
      expect(() => { state.discoveredCombinations.scrambled_eggs = ['butter egg']; }).toThrow();
      expect(() => { state.coins = 999; }).toThrow();
      expect(getState().discoveredCombinations).toEqual({});
      expect(getState().coins).toBe(0);
    });
  });

  // ── setState ────────────────────────────────────────────────────────────────

  describe('setState', () => {
    test('merges a patch into the current state', () => {
      loadState();
      setState({ coins: 100 });
      expect(getState().coins).toBe(100);
    });

    test('preserves fields not included in the patch', () => {
      loadState();
      setState({ coins: 50 });
      expect(getState().discoveredCombinations).toEqual({});
      expect(getState().completedOrders).toBe(0);
      expect(getState().unlockedItems).toHaveLength(7);
    });

    test('persists the updated state to localStorage', () => {
      loadState();
      setState({ coins: 123 });
      const stored = JSON.parse(localStorageMock._store[STORAGE_KEY]);
      expect(stored.coins).toBe(123);
    });

    test('persists object fields correctly', () => {
      loadState();
      setState({ discoveredCombinations: { scrambled_eggs: ['butter egg'], caramel: ['butter sugar'] } });
      const stored = JSON.parse(localStorageMock._store[STORAGE_KEY]);
      expect(stored.discoveredCombinations).toEqual({
        scrambled_eggs: ['butter egg'],
        caramel: ['butter sugar'],
      });
    });

    test('multiple patches accumulate correctly', () => {
      loadState();
      setState({ coins: 10 });
      setState({ completedOrders: 3 });
      setState({ coins: 25 });
      expect(getState().coins).toBe(25);
      expect(getState().completedOrders).toBe(3);
    });
  });

  // ── resetState ──────────────────────────────────────────────────────────────

  describe('resetState', () => {
    test('resets all state fields back to defaults', () => {
      loadState();
      setState({ coins: 999, completedOrders: 50, discoveredCombinations: { bread: ['flour salt water yeast'] } });
      resetState();
      const state = getState();
      expect(state.coins).toBe(0);
      expect(state.completedOrders).toBe(0);
      expect(state.discoveredCombinations).toEqual({});
      expect(state.triggeredMilestones).toEqual([]);
    });

    test('resets unlockedItems to the seven starting ingredients', () => {
      loadState();
      setState({ unlockedItems: ['water', 'yeast', 'vanilla'] });
      resetState();
      expect(getState().unlockedItems).toEqual(
        ['water', 'egg', 'milk', 'flour', 'sugar', 'butter', 'salt']
      );
    });

    test('removes the saved entry from localStorage', () => {
      loadState();
      setState({ coins: 999 });
      expect(localStorageMock._store[STORAGE_KEY]).toBeDefined();
      resetState();
      expect(localStorageMock._store[STORAGE_KEY]).toBeUndefined();
    });

    test('state returned after reset is independent of the previous state object', () => {
      loadState();
      setState({ discoveredCombinations: { caramel: ['butter sugar'], bread: ['flour salt water yeast'] } });
      const before = getState();
      resetState();
      const after = getState();
      // resetState replaces the internal state with a brand-new object, so the
      // pre-reset and post-reset references are distinct and have their own
      // independent values. The old `before` snapshot still reads as its
      // pre-reset content; `after` reads as the default state.
      expect(after).not.toBe(before);
      expect(before.discoveredCombinations).toEqual({
        caramel: ['butter sugar'],
        bread: ['flour salt water yeast'],
      });
      expect(after.discoveredCombinations).toEqual({});
    });
  });

  // ── getDiscoveredRecipes ────────────────────────────────────────────────────

  describe('getDiscoveredRecipes', () => {
    test('returns the empty list when no combinations have been discovered', () => {
      loadState();
      expect(getDiscoveredRecipes()).toEqual([]);
    });

    test('returns the result IDs that have at least one discovered combination', () => {
      loadState();
      setState({ discoveredCombinations: {
        scrambled_eggs: ['butter egg'],
        caramel: ['butter sugar'],
      }});
      expect(getDiscoveredRecipes()).toEqual(['scrambled_eggs', 'caramel']);
    });

    test('reflects updates after setState', () => {
      loadState();
      setState({ discoveredCombinations: { scrambled_eggs: ['butter egg'] } });
      expect(getDiscoveredRecipes()).toEqual(['scrambled_eggs']);
      setState({ discoveredCombinations: {
        scrambled_eggs: ['butter egg'],
        bread: ['flour salt water yeast'],
      }});
      expect(getDiscoveredRecipes()).toEqual(['scrambled_eggs', 'bread']);
    });

    test('returns the same array reference when discoveredCombinations has not changed', () => {
      loadState();
      setState({ discoveredCombinations: { scrambled_eggs: ['butter egg'] } });
      const first = getDiscoveredRecipes();
      setState({ coins: 50 });
      const second = getDiscoveredRecipes();
      expect(second).toBe(first);
    });

    test('returns a fresh array reference after resetState', () => {
      loadState();
      setState({ discoveredCombinations: { scrambled_eggs: ['butter egg'] } });
      const before = getDiscoveredRecipes();
      resetState();
      const after = getDiscoveredRecipes();
      expect(after).not.toBe(before);
      expect(after).toEqual([]);
    });
  });
});
