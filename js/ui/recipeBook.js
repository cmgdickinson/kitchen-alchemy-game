import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';

export function renderRecipeBook(discoveredRecipeIds) {
  const grid = document.getElementById('recipe-grid');
  const countEl = document.getElementById('recipe-count');
  const totalEl = document.getElementById('recipe-total');
  if (!grid) return;

  grid.innerHTML = '';

  for (const recipe of RECIPES) {
    const isDiscovered = discoveredRecipeIds.includes(recipe.id);
    const card = document.createElement('div');
    card.className = 'recipe-card';

    if (isDiscovered) {
      const result = INGREDIENTS[recipe.result];
      const ingredientNames = recipe.ingredients
        .map(id => INGREDIENTS[id]?.name ?? id)
        .join(' + ');

      card.innerHTML = `
        <div class="recipe-card-header">
          <span class="recipe-card-emoji">${result?.emoji ?? '❓'}</span>
          <span class="recipe-card-name">${result?.name ?? recipe.id}</span>
        </div>
        <div class="recipe-card-ingredients">${ingredientNames}</div>
        <div class="recipe-card-desc">${recipe.description}</div>
      `;
    } else {
      card.style.opacity = '0.45';
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

  if (countEl) countEl.textContent = discoveredRecipeIds.length;
  if (totalEl) totalEl.textContent = RECIPES.length;
}
