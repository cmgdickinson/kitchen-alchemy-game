const localStorageMock = {
  _store: {},
  getItem(key) { return this._store[key] ?? null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
};

global.localStorage = localStorageMock;

// Helper: discover recipes so orders can be generated.
// scrambled_eggs (egg+butter) and caramel (sugar+butter) are both orderable.
const ORDERABLE_RECIPES = ['scrambled_eggs', 'caramel', 'bechamel', 'toffee', 'bread'];

// Build a discoveredCombinations stub from a list of fake result IDs. orders.js
// only cares about which results are discovered; the combination keys themselves
// don't matter for these tests, so '_' is fine.
const fakeDiscoveries = (...ids) =>
  Object.fromEntries(ids.map(id => [id, ['_']]));

describe('order system', () => {
  let stateModule, ordersModule;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorageMock._store = {};
    jest.resetModules();
    stateModule = require('../js/systems/state');
    ordersModule = require('../js/systems/orders');
    stateModule.loadState();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ── getActiveOrders ───────────────────────────────────────────────────────

  describe('getActiveOrders', () => {
    test('returns an empty array on a fresh module', () => {
      expect(ordersModule.getActiveOrders()).toEqual([]);
    });
  });

  // ── tryFillOrders ─────────────────────────────────────────────────────────

  describe('tryFillOrders', () => {
    test('does nothing when no orderable recipes have been discovered', () => {
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()).toHaveLength(0);
    });

    test('generates at least one order when an orderable recipe is discovered', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders().length).toBeGreaterThan(0);
    });

    test('fills up to the maximum of 3 slots', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()).toHaveLength(3);
    });

    test('does not duplicate recipe IDs when enough distinct orderable recipes exist', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) }); // 5 orderable recipes, 3 slots
      ordersModule.tryFillOrders();
      const recipeIds = ordersModule.getActiveOrders().map(o => o.recipeId);
      expect(new Set(recipeIds).size).toBe(recipeIds.length);
    });

    test('does not exceed 3 slots even when called multiple times', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      ordersModule.tryFillOrders();
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()).toHaveLength(3);
    });

    test('calls the onChanged handler when orders are added', () => {
      const handler = jest.fn();
      ordersModule.setOrdersChangeHandler(handler);
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      expect(handler).toHaveBeenCalled();
    });

    test('does not call onChanged when no orders are added', () => {
      const handler = jest.fn();
      ordersModule.setOrdersChangeHandler(handler);
      ordersModule.tryFillOrders(); // no orderable recipes
      expect(handler).not.toHaveBeenCalled();
    });

    test('generated order has the expected shape', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      expect(order).toMatchObject({
        id:              expect.stringMatching(/^ord_\d+$/),
        customerName:    expect.any(String),
        recipeId:        expect.any(String),
        name:            expect.any(String),
        emoji:           expect.any(String),
        reward:          expect.any(Number),
        timeLimit:       expect.any(Number),
        timeRemaining:   expect.any(Number),
        expiredMessage:  expect.any(String),
      });
    });

    test('timeRemaining equals timeLimit when the order is first created', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      expect(order.timeRemaining).toBe(order.timeLimit);
    });

    test('reward is a positive number', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()[0].reward).toBeGreaterThan(0);
    });

    test('generated order references a recipe that was discovered', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      expect(order.recipeId).toBe('scrambled_eggs');
    });

    test('timeLimit is 90 when fewer than 6 recipes discovered', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()[0].timeLimit).toBe(90);
    });

    test('timeLimit is 70 when 6–13 recipes discovered', () => {
      const sixOrderable = ['scrambled_eggs','caramel','bechamel','toffee','bread','pancakes'];
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...sixOrderable) });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()[0].timeLimit).toBe(70);
    });

    test('timeLimit is 52 when 14 or more recipes discovered', () => {
      const fourteenOrderable = [
        'scrambled_eggs','caramel','bechamel','toffee','bread','pancakes',
        'vanilla_custard','butterscotch','chocolate_ganache','whipped_cream',
        'horchata','hot_chocolate','lemon_curd','fresh_pasta',
      ];
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...fourteenOrderable) });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()[0].timeLimit).toBe(52);
    });
  });

  // ── resetOrders ───────────────────────────────────────────────────────────

  describe('resetOrders', () => {
    test('clears all active orders', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders().length).toBeGreaterThan(0);
      ordersModule.resetOrders();
      expect(ordersModule.getActiveOrders()).toHaveLength(0);
    });

    test('resets the ID counter so new orders restart from ord_1', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      ordersModule.resetOrders();
      ordersModule.tryFillOrders();
      expect(ordersModule.getActiveOrders()[0].id).toBe('ord_1');
    });
  });

  // ── fulfillOrder ──────────────────────────────────────────────────────────

  describe('fulfillOrder', () => {
    test('returns null for an unknown order ID', () => {
      expect(ordersModule.fulfillOrder('nonexistent_id')).toBeNull();
    });

    test('returns the fulfilled order object', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      const result = ordersModule.fulfillOrder(order.id);
      expect(result).not.toBeNull();
      expect(result.id).toBe(order.id);
    });

    test('removes the order from the active list', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      ordersModule.fulfillOrder(order.id);
      expect(ordersModule.getActiveOrders().find(o => o.id === order.id)).toBeUndefined();
    });

    test('adds the order reward to the coins balance', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      const coinsBefore = stateModule.getState().coins;
      ordersModule.fulfillOrder(order.id);
      expect(stateModule.getState().coins).toBe(coinsBefore + order.reward);
    });

    test('increments completedOrders by 1', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      ordersModule.fulfillOrder(order.id);
      expect(stateModule.getState().completedOrders).toBe(1);
    });

    test('accumulates completedOrders across multiple fulfillments', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      const orders = [...ordersModule.getActiveOrders()];
      for (const order of orders) ordersModule.fulfillOrder(order.id);
      expect(stateModule.getState().completedOrders).toBe(orders.length);
    });

    test('schedules a slot refill via setTimeout', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      jest.clearAllTimers();
      ordersModule.fulfillOrder(order.id);
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });
  });

  // ── tickOrders ────────────────────────────────────────────────────────────

  describe('tickOrders', () => {
    test('returns an empty array when there are no active orders', () => {
      expect(ordersModule.tickOrders()).toEqual([]);
    });

    test('decrements timeRemaining by 1 on each active order', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      const before = ordersModule.getActiveOrders().map(o => o.timeRemaining);
      ordersModule.tickOrders();
      const after = ordersModule.getActiveOrders().map(o => o.timeRemaining);
      after.forEach((t, i) => expect(t).toBe(before[i] - 1));
    });

    test('returns an empty array when no orders expire', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const expired = ordersModule.tickOrders();
      expect(expired).toEqual([]);
    });

    test('removes an order whose timeRemaining reaches 0', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      order.timeRemaining = 1;
      ordersModule.tickOrders();
      expect(ordersModule.getActiveOrders().find(o => o.id === order.id)).toBeUndefined();
    });

    test('returns expired orders in the result array', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      order.timeRemaining = 1;
      const expired = ordersModule.tickOrders();
      expect(expired).toHaveLength(1);
      expect(expired[0].id).toBe(order.id);
    });

    test('can expire multiple orders in a single tick', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries(...ORDERABLE_RECIPES) });
      ordersModule.tryFillOrders();
      ordersModule.getActiveOrders().forEach(o => { o.timeRemaining = 1; });
      const expired = ordersModule.tickOrders();
      expect(expired).toHaveLength(3);
    });

    test('calls the onChanged handler when orders tick', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const handler = jest.fn();
      ordersModule.setOrdersChangeHandler(handler);
      ordersModule.tickOrders();
      expect(handler).toHaveBeenCalled();
    });

    test('does not call onChanged when there are no active orders', () => {
      const handler = jest.fn();
      ordersModule.setOrdersChangeHandler(handler);
      ordersModule.tickOrders();
      expect(handler).not.toHaveBeenCalled();
    });

    test('schedules a slot refill via setTimeout when an order expires', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      const [order] = ordersModule.getActiveOrders();
      order.timeRemaining = 1;
      jest.clearAllTimers();
      ordersModule.tickOrders();
      expect(jest.getTimerCount()).toBe(1);
    });

    test('does not schedule a refill when no orders expire', () => {
      stateModule.setState({ discoveredCombinations: fakeDiscoveries('scrambled_eggs') });
      ordersModule.tryFillOrders();
      jest.clearAllTimers();
      ordersModule.tickOrders(); // time > 1, nothing expires
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
