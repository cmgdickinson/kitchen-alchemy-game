import { RECIPES } from '../data/recipes.js';

// Pre-build a map of sorted-ingredient-key → recipe for O(1) lookup
const recipeMap = new Map();
for (const recipe of RECIPES) {
  const key = recipe.ingredients.slice().sort().join(' ');
  recipeMap.set(key, recipe);
}

export function tryRecipe(ingredientIds) {
  const key = ingredientIds.slice().sort().join(' ');
  return recipeMap.get(key) ?? null;
}
