const { tryRecipe, combinationKey } = require('../js/systems/combination');
const { RECIPES } = require('../js/data/recipes');

describe('tryRecipe', () => {
  test('returns an empty array for an empty input', () => {
    expect(tryRecipe([])).toEqual([]);
  });

  test('returns an empty array for a single ingredient', () => {
    expect(tryRecipe(['flour'])).toEqual([]);
  });

  test('returns an empty array for an unknown two-ingredient combination', () => {
    expect(tryRecipe(['water', 'sugar'])).toEqual([]);
  });

  test('returns an empty array for a partial match (subset of a valid recipe)', () => {
    // flour + egg + milk = batter, but flour + egg alone is not a recipe
    expect(tryRecipe(['flour', 'egg'])).toEqual([]);
  });

  test('returns an empty array for a superset of a valid recipe', () => {
    // egg + butter = scrambled_eggs, but adding water makes it unknown
    expect(tryRecipe(['egg', 'butter', 'water'])).toEqual([]);
  });

  test('finds a two-ingredient recipe', () => {
    const matches = tryRecipe(['egg', 'butter']);
    expect(matches.map(r => r.result)).toContain('scrambled_eggs');
  });

  test('matching is order-agnostic for two ingredients', () => {
    const ab = tryRecipe(['egg', 'butter']);
    const ba = tryRecipe(['butter', 'egg']);
    expect(ab).toEqual(ba);
  });

  test('finds a three-ingredient recipe', () => {
    const matches = tryRecipe(['flour', 'egg', 'milk']);
    expect(matches.map(r => r.result)).toContain('batter');
  });

  test('matching is order-agnostic for three ingredients', () => {
    const combos = [
      ['flour', 'egg', 'milk'],
      ['egg', 'milk', 'flour'],
      ['milk', 'flour', 'egg'],
      ['flour', 'milk', 'egg'],
    ];
    const results = combos.map(c => tryRecipe(c).map(r => r.result));
    for (const r of results) expect(r).toEqual(results[0]);
    expect(results[0]).toContain('batter');
  });

  test('finds a four-ingredient recipe', () => {
    const matches = tryRecipe(['flour', 'water', 'salt', 'yeast']);
    expect(matches.map(r => r.result)).toContain('bread');
  });

  test('matching is order-agnostic for four ingredients', () => {
    const r1 = tryRecipe(['flour', 'water', 'salt', 'yeast']);
    const r2 = tryRecipe(['yeast', 'salt', 'water', 'flour']);
    expect(r1).toEqual(r2);
  });

  test('every combination defined in RECIPES is discoverable', () => {
    for (const recipe of RECIPES) {
      for (const combination of recipe.combinations) {
        const found = tryRecipe(combination);
        expect(found.some(r => r.result === recipe.result)).toBe(true);
      }
    }
  });

  test('returns the full recipe object with description on a hit', () => {
    const [match] = tryRecipe(['sugar', 'butter']);
    expect(match).toMatchObject({
      result: 'caramel',
      description: expect.any(String),
      combinations: expect.arrayContaining([expect.arrayContaining(['sugar', 'butter'])]),
    });
  });
});

describe('combinationKey', () => {
  test('produces the same key regardless of input order', () => {
    expect(combinationKey(['egg', 'butter'])).toBe(combinationKey(['butter', 'egg']));
  });

  test('does not mutate the input array', () => {
    const input = ['sugar', 'butter', 'flour'];
    const copy = [...input];
    combinationKey(input);
    expect(input).toEqual(copy);
  });

  test('matches the key tryRecipe uses internally', () => {
    const key = combinationKey(['butter', 'egg']);
    const sorted = key.split(' ');
    expect(tryRecipe(sorted).map(r => r.result)).toContain('scrambled_eggs');
  });
});
