import { RECIPES } from '../data/recipes.js';

// Canonical combination key — callers must use this helper rather than rolling their own
// sort-and-join. Drift would silently miss matches.
export function combinationKey(ingredientIds) {
  return ingredientIds.slice().sort().join(' ');
}

// One entry per combination — a recipe with N combinations contributes N entries.
const recipeMap = new Map();
for (const recipe of RECIPES) {
  for (const combination of recipe.combinations) {
    recipeMap.set(combinationKey(combination), recipe);
  }
}

export function tryRecipe(ingredientIds) {
  return recipeMap.get(combinationKey(ingredientIds)) ?? null;
}
