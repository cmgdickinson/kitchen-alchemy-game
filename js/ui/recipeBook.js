import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';

export function renderRecipeBook(discoveredRecipeIds) {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  const countEl = document.getElementById('recipe-count');
  const totalEl = document.getElementById('recipe-total');

  grid.innerHTML = '';

  const discoveredSet = new Set(discoveredRecipeIds); // O(1) lookup per recipe vs O(n) with array.includes
  // true (1) − false (0) = 1 sorts b before a, so discovered recipes float to the top
  const sortedRecipes = [...RECIPES].sort((a, b) => discoveredSet.has(b.result) - discoveredSet.has(a.result));
  for (const recipe of sortedRecipes) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    if (discoveredSet.has(recipe.result)) {
      const result = INGREDIENTS[recipe.result];
      const ingredientNames = recipe.ingredients
        .map(id => INGREDIENTS[id]?.name ?? id)
        .join(' + ');

      card.innerHTML = `
        <div class="recipe-card-header">
          <span class="recipe-card-emoji"></span>
          <span class="recipe-card-name"></span>
        </div>
        <div class="recipe-card-ingredients"></div>
        <div class="recipe-card-desc"></div>
      `;
      // Set via textContent to prevent XSS if these values ever come from user input or external sources
      card.querySelector('.recipe-card-emoji').textContent = result?.emoji ?? '❓';
      card.querySelector('.recipe-card-name').textContent = result?.name ?? recipe.result;
      card.querySelector('.recipe-card-ingredients').textContent = ingredientNames;
      card.querySelector('.recipe-card-desc').textContent = recipe.description;
    } else {
      card.classList.add('undiscovered');
      card.innerHTML = `
        <div class="recipe-card-header">
          <span class="recipe-card-emoji">❓</span>
          <span class="recipe-card-name">???</span>
        </div>
        <div class="recipe-card-ingredients">${recipe.ingredients.length} ingredients</div>
      `;
    }

    grid.appendChild(card);
  }

  if (countEl) countEl.textContent = discoveredSet.size;
  if (totalEl) totalEl.textContent = RECIPES.length;
}
