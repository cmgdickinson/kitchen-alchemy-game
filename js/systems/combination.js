import { RECIPES } from '../data/recipes.js';

// Canonical combination key — callers must use this helper rather than rolling their own
// sort-and-join. Drift would silently miss matches.
export function combinationKey(ingredientIds) {
  return ingredientIds.slice().sort().join(' ');
}

// combinationKey → recipes producible by that combination. A combination may map to
// more than one recipe; recipes with N combinations each contribute N entries.
const recipeMap = new Map();
for (const recipe of RECIPES) {
  for (const combination of recipe.combinations) {
    const key = combinationKey(combination);
    if (!recipeMap.has(key)) recipeMap.set(key, []);
    recipeMap.get(key).push(recipe);
  }
}

export function tryRecipe(ingredientIds) {
  return recipeMap.get(combinationKey(ingredientIds)) ?? [];
}
