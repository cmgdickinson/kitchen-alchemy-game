const { INGREDIENTS } = require('../js/data/ingredients');
const { RECIPES } = require('../js/data/recipes');
const { MILESTONES } = require('../js/data/milestones');

describe('INGREDIENTS', () => {
  test('every entry has a name, emoji, valid unlockType, and boolean orderable', () => {
    for (const [id, item] of Object.entries(INGREDIENTS)) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.emoji).toBe('string');
      expect(['start', 'milestone', 'recipe']).toContain(item.unlockType);
      expect(typeof item.orderable).toBe('boolean');
    }
  });

  test('the seven starting ingredients are all present and marked as start', () => {
    const starting = ['water', 'egg', 'milk', 'flour', 'sugar', 'butter', 'salt'];
    for (const id of starting) {
      expect(INGREDIENTS[id]).toBeDefined();
      expect(INGREDIENTS[id].unlockType).toBe('start');
    }
  });

  test('milestone-type ingredients are not orderable', () => {
    for (const [id, item] of Object.entries(INGREDIENTS)) {
      if (item.unlockType === 'milestone') {
        expect(item.orderable).toBe(false);
      }
    }
  });
});

describe('RECIPES', () => {
  test('every recipe result ID exists in INGREDIENTS', () => {
    for (const recipe of RECIPES) {
      expect(INGREDIENTS[recipe.result]).toBeDefined();
    }
  });

  test('every recipe has at least one combination', () => {
    for (const recipe of RECIPES) {
      expect(Array.isArray(recipe.combinations)).toBe(true);
      expect(recipe.combinations.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('every ingredient ID across all combinations exists in INGREDIENTS', () => {
    for (const recipe of RECIPES) {
      for (const ing of recipe.combinations.flat()) {
        expect(INGREDIENTS[ing]).toBeDefined();
      }
    }
  });

  test('every recipe has a non-trivial description', () => {
    for (const recipe of RECIPES) {
      expect(typeof recipe.description).toBe('string');
      expect(recipe.description.length).toBeGreaterThan(20);
    }
  });

  test('every recipe result ID is unique — no two recipes produce the same ingredient', () => {
    const results = RECIPES.map(r => r.result);
    expect(new Set(results).size).toBe(results.length);
  });

  test('every (combination, result) pair is unique', () => {
    const seen = new Set();
    for (const recipe of RECIPES) {
      for (const combination of recipe.combinations) {
        const pair = `${combination.slice().sort().join('|')} → ${recipe.result}`;
        expect(seen.has(pair)).toBe(false);
        seen.add(pair);
      }
    }
  });

  test('every combination has at least 2 ingredients', () => {
    for (const recipe of RECIPES) {
      for (const combination of recipe.combinations) {
        expect(combination.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('every combination has at most 4 ingredients', () => {
    for (const recipe of RECIPES) {
      for (const combination of recipe.combinations) {
        expect(combination.length).toBeLessThanOrEqual(4);
      }
    }
  });

  test('recipe result items are marked as unlockType recipe in INGREDIENTS', () => {
    for (const recipe of RECIPES) {
      expect(INGREDIENTS[recipe.result].unlockType).toBe('recipe');
    }
  });
});

describe('MILESTONES', () => {
  test('milestone IDs are unique', () => {
    const ids = MILESTONES.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every milestone reward ID exists in INGREDIENTS', () => {
    for (const milestone of MILESTONES) {
      expect(INGREDIENTS[milestone.reward]).toBeDefined();
    }
  });

  test('every milestone reward ingredient is of unlockType milestone', () => {
    for (const milestone of MILESTONES) {
      expect(INGREDIENTS[milestone.reward].unlockType).toBe('milestone');
    }
  });

  test('milestone condition types are discoveries or orders', () => {
    for (const milestone of MILESTONES) {
      expect(['discoveries', 'orders']).toContain(milestone.condition.type);
    }
  });

  test('milestone condition counts are positive integers', () => {
    for (const milestone of MILESTONES) {
      expect(Number.isInteger(milestone.condition.count)).toBe(true);
      expect(milestone.condition.count).toBeGreaterThan(0);
    }
  });

  test('every milestone has a title, emoji, and message', () => {
    for (const milestone of MILESTONES) {
      expect(typeof milestone.title).toBe('string');
      expect(milestone.title.length).toBeGreaterThan(0);
      expect(typeof milestone.emoji).toBe('string');
      expect(typeof milestone.message).toBe('string');
      expect(milestone.message.length).toBeGreaterThan(0);
    }
  });

  test('each milestone unlocks a different ingredient', () => {
    const rewardIds = MILESTONES.map(m => m.reward);
    expect(new Set(rewardIds).size).toBe(rewardIds.length);
  });
});
