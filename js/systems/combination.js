import { RECIPES } from '../data/recipes.js';

// Canonical form for a combination — used both to build the recipe map and to record
// discoveries elsewhere, so callers must go through this helper rather than computing
// their own sorted-string key (drift would silently miss matches).
export function combinationKey(ingredientIds) {
  return ingredientIds.slice().sort().join(' ');
}

// Pre-build a map of combination-key → recipe for O(1) lookup. A recipe with N
// combinations contributes N entries.
const recipeMap = new Map();
for (const recipe of RECIPES) {
  for (const combination of recipe.combinations) {
    recipeMap.set(combinationKey(combination), recipe);
  }
}

export function tryRecipe(ingredientIds) {
  return recipeMap.get(combinationKey(ingredientIds)) ?? null;
}
