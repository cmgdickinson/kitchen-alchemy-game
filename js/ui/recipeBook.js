import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';

// Tracks how many recipes were discovered the last time we rendered, so we can
// skip rebuilding the grid when nothing has changed. -1 means "never rendered yet"
// (0 is a valid real value — a fresh game with no discoveries).
//
// Invariant this relies on: discoveredRecipes only grows between resets, and a
// reset takes it back to 0. So a change in length always means a change in
// contents. If that ever stops being true (e.g. players can un-favorite a
// recipe), this check needs to compare contents, not just length.
let _lastRenderedCount = -1;

export function renderRecipeBook(discoveredRecipeIds) {
  // Skip the whole render when nothing changed since last call. Saves rebuilding
  // ~36 (and growing) DOM nodes on every successful combine of an already-known
  // recipe, which is the common case during play.
  if (discoveredRecipeIds.length === _lastRenderedCount) return;

  const grid = document.getElementById('recipe-grid');
  if (!grid) return;
  // Only update the counter once we know we're actually rendering — otherwise an
  // early bail-out below could leave us "claiming" we rendered when we didn't.
  _lastRenderedCount = discoveredRecipeIds.length;

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
      // textContent — prevents XSS (convention note in pantry.js)
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
