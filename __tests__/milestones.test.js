const localStorageMock = {
  _store: {},
  getItem(key) { return this._store[key] ?? null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
};

global.localStorage = localStorageMock;

describe('milestone system', () => {
  let stateModule, checkMilestones;

  beforeEach(() => {
    localStorageMock._store = {};
    jest.resetModules();
    stateModule = require('../js/systems/state');
    ({ checkMilestones } = require('../js/systems/milestones'));
    stateModule.loadState();
  });

  test('returns an empty array when no conditions are met', () => {
    const result = checkMilestones();
    expect(result).toEqual([]);
  });

  // ── Discovery-based milestones ────────────────────────────────────────────

  test('triggers the first discovery milestone (unlock_yeast) when 3 recipes are discovered', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b', 'c'] });
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).toContain('unlock_yeast');
  });

  test('does not trigger a discovery milestone when count is one short', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b'] }); // need 3 for yeast
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).not.toContain('unlock_yeast');
  });

  test('triggers exactly on the boundary count', () => {
    // unlock_vanilla requires exactly 7 discoveries
    stateModule.setState({ discoveredRecipes: ['a','b','c','d','e','f','g'] });
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).toContain('unlock_vanilla');
  });

  // ── Order-based milestones ────────────────────────────────────────────────

  test('triggers an order-based milestone when completedOrders meets the threshold', () => {
    // unlock_baking_powder requires 3 completed orders
    stateModule.setState({ completedOrders: 3 });
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).toContain('unlock_baking_powder');
  });

  test('does not trigger an order milestone when count is one short', () => {
    stateModule.setState({ completedOrders: 2 }); // need 3 for baking_powder
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).not.toContain('unlock_baking_powder');
  });

  // ── State mutations ───────────────────────────────────────────────────────

  test('adds the reward ingredient to unlockedItems', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b', 'c'] });
    checkMilestones();
    expect(stateModule.getState().unlockedItems).toContain('yeast');
  });

  test('adds the milestone id to triggeredMilestones', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b', 'c'] });
    checkMilestones();
    expect(stateModule.getState().triggeredMilestones).toContain('unlock_yeast');
  });

  test('does not add a duplicate ingredient if it is already in unlockedItems', () => {
    const startingWithYeast = ['water','egg','milk','flour','sugar','butter','salt','yeast'];
    stateModule.setState({
      discoveredRecipes: ['a', 'b', 'c'],
      unlockedItems: startingWithYeast,
    });
    checkMilestones();
    const count = stateModule.getState().unlockedItems.filter(i => i === 'yeast').length;
    expect(count).toBe(1);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  test('does not re-trigger an already triggered milestone', () => {
    stateModule.setState({
      discoveredRecipes: ['a', 'b', 'c'],
      triggeredMilestones: ['unlock_yeast'],
    });
    const triggered = checkMilestones();
    expect(triggered.map(m => m.id)).not.toContain('unlock_yeast');
  });

  test('is idempotent — calling it twice returns nothing on the second call', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b', 'c'] });
    checkMilestones();
    const second = checkMilestones();
    expect(second).toEqual([]);
  });

  // ── Multiple milestones ───────────────────────────────────────────────────

  test('can trigger multiple milestones in a single call', () => {
    // 7 discoveries hits both unlock_yeast (3) and unlock_vanilla (7)
    stateModule.setState({ discoveredRecipes: ['a','b','c','d','e','f','g'] });
    const triggered = checkMilestones();
    const ids = triggered.map(m => m.id);
    expect(ids).toContain('unlock_yeast');
    expect(ids).toContain('unlock_vanilla');
  });

  test('triggering multiple milestones unlocks all reward ingredients', () => {
    stateModule.setState({ discoveredRecipes: ['a','b','c','d','e','f','g'] });
    checkMilestones();
    const { unlockedItems } = stateModule.getState();
    expect(unlockedItems).toContain('yeast');
    expect(unlockedItems).toContain('vanilla');
  });

  test('triggering multiple milestones records all of their ids', () => {
    stateModule.setState({ discoveredRecipes: ['a','b','c','d','e','f','g'] });
    checkMilestones();
    const { triggeredMilestones } = stateModule.getState();
    expect(triggeredMilestones).toContain('unlock_yeast');
    expect(triggeredMilestones).toContain('unlock_vanilla');
  });

  // ── Return value ──────────────────────────────────────────────────────────

  test('returns the full milestone objects, not just IDs', () => {
    stateModule.setState({ discoveredRecipes: ['a', 'b', 'c'] });
    const [milestone] = checkMilestones();
    expect(milestone).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      emoji: expect.any(String),
      message: expect.any(String),
      reward: expect.any(String),
    });
  });
});
