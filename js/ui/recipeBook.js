import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { combinationKey } from '../systems/combination.js';

// Memoised against the discoveredCombinations reference — same idiom as state.js.
// null sentinel for "never rendered" (distinct from the initial empty state object).
let _lastRenderedCombinations = null;

export function renderRecipeBook(discoveredCombinations) {
  if (discoveredCombinations === _lastRenderedCombinations) return;

  const grid = document.getElementById('recipe-grid');
  if (!grid) return;
  // Update the sentinel only after the grid lookup — otherwise an early bail-out
  // would mark us "rendered" when we weren't.
  _lastRenderedCombinations = discoveredCombinations;

  const countEl = document.getElementById('recipe-count');
  const totalEl = document.getElementById('recipe-total');

  grid.innerHTML = '';

  const isDiscovered = (recipe) =>
    (discoveredCombinations[recipe.result]?.length ?? 0) > 0;
  const sortedRecipes = [...RECIPES].sort((a, b) => isDiscovered(b) - isDiscovered(a));
  let discoveredCount = 0;

  for (const recipe of sortedRecipes) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    if (isDiscovered(recipe)) {
      discoveredCount++;
      const result = INGREDIENTS[recipe.result];
      const foundCombos = new Set(discoveredCombinations[recipe.result]);
      // Iterate recipe.combinations (data-file order) so each combo renders in
      // the author's intended ingredient order, not the sorted key order.
      const comboLines = recipe.combinations
        .filter(combo => foundCombos.has(combinationKey(combo)))
        .map(combo => combo.map(id => INGREDIENTS[id]?.name ?? id).join(' + '));

      card.innerHTML = `
        <div class="recipe-card-header">
          <span class="recipe-card-emoji"></span>
          <span class="recipe-card-name"></span>
        </div>
        <div class="recipe-card-progress"></div>
        <div class="recipe-card-combinations"></div>
        <div class="recipe-card-desc"></div>
      `;
      // textContent — prevents XSS (convention note in pantry.js)
      card.querySelector('.recipe-card-emoji').textContent = result?.emoji ?? '❓';
      card.querySelector('.recipe-card-name').textContent = result?.name ?? recipe.result;
      card.querySelector('.recipe-card-progress').textContent =
        `${foundCombos.size} of ${recipe.combinations.length} combinations known`;
      const combosEl = card.querySelector('.recipe-card-combinations');
      for (const line of comboLines) {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        combosEl.appendChild(lineEl);
      }
      card.querySelector('.recipe-card-desc').textContent = recipe.description;
    } else {
      card.classList.add('undiscovered');
      card.innerHTML = `
        <div class="recipe-card-header">
          <span class="recipe-card-emoji">❓</span>
          <span class="recipe-card-name">???</span>
        </div>
        <div class="recipe-card-combinations">${recipe.combinations.length} combinations to discover</div>
      `;
    }

    grid.appendChild(card);
  }

  if (countEl) countEl.textContent = discoveredCount;
  if (totalEl) totalEl.textContent = RECIPES.length;
}
