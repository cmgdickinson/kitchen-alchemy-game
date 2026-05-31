const { tryRecipe } = require('../js/systems/combination');
const { RECIPES } = require('../js/data/recipes');

describe('tryRecipe', () => {
  test('returns null for an empty input', () => {
    expect(tryRecipe([])).toBeNull();
  });

  test('returns null for a single ingredient', () => {
    expect(tryRecipe(['flour'])).toBeNull();
  });

  test('returns null for an unknown two-ingredient combination', () => {
    expect(tryRecipe(['water', 'sugar'])).toBeNull();
  });

  test('returns null for a partial match (subset of a valid recipe)', () => {
    // flour + egg + milk = batter, but flour + egg alone is not a recipe
    expect(tryRecipe(['flour', 'egg'])).toBeNull();
  });

  test('returns null for a superset of a valid recipe', () => {
    // egg + butter = scrambled_eggs, but adding water makes it unknown
    expect(tryRecipe(['egg', 'butter', 'water'])).toBeNull();
  });

  test('finds a two-ingredient recipe', () => {
    const result = tryRecipe(['egg', 'butter']);
    expect(result).not.toBeNull();
    expect(result.result).toBe('scrambled_eggs');
  });

  test('matching is order-agnostic for two ingredients', () => {
    const ab = tryRecipe(['egg', 'butter']);
    const ba = tryRecipe(['butter', 'egg']);
    expect(ab).not.toBeNull();
    expect(ba).not.toBeNull();
    expect(ab.result).toBe(ba.result);
  });

  test('finds a three-ingredient recipe', () => {
    const result = tryRecipe(['flour', 'egg', 'milk']);
    expect(result).not.toBeNull();
    expect(result.result).toBe('batter');
  });

  test('matching is order-agnostic for three ingredients', () => {
    const combos = [
      ['flour', 'egg', 'milk'],
      ['egg', 'milk', 'flour'],
      ['milk', 'flour', 'egg'],
      ['flour', 'milk', 'egg'],
    ];
    const ids = combos.map(c => tryRecipe(c)?.result);
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe('batter');
  });

  test('finds a four-ingredient recipe', () => {
    const result = tryRecipe(['flour', 'water', 'salt', 'yeast']);
    expect(result).not.toBeNull();
    expect(result.result).toBe('bread');
  });

  test('matching is order-agnostic for four ingredients', () => {
    const r1 = tryRecipe(['flour', 'water', 'salt', 'yeast']);
    const r2 = tryRecipe(['yeast', 'salt', 'water', 'flour']);
    expect(r1.result).toBe(r2.result);
  });

  test('every recipe defined in RECIPES is discoverable', () => {
    for (const recipe of RECIPES) {
      const found = tryRecipe(recipe.ingredients);
      expect(found).not.toBeNull();
      expect(found.result).toBe(recipe.result);
    }
  });

  test('returns the full recipe object with description on a hit', () => {
    const result = tryRecipe(['sugar', 'butter']);
    expect(result).toMatchObject({
      result: 'caramel',
      description: expect.any(String),
      ingredients: expect.arrayContaining(['sugar', 'butter']),
    });
  });
});
