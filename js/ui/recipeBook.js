import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { combinationKey } from '../systems/combination.js';

// Memoised against the discoveredCombinations reference. setState replaces _state
// on every call, but the inner discoveredCombinations only changes when discoveries
// actually change (patches that don't touch it carry the previous reference through
// via spread). So this skips the full DOM rebuild on unrelated state changes (order
// ticks, coin gains, etc.) as well as on combines that didn't add a new combination.
// null sentinel means "never rendered yet" — distinct from the initial empty state
// object, which is a real reference.
let _lastRenderedCombinations = null;

export function renderRecipeBook(discoveredCombinations) {
  // Skip the whole render when nothing changed since last call. Saves rebuilding
  // ~36 (and growing) DOM nodes on every state change that doesn't affect
  // discoveries, which is the common case during play.
  if (discoveredCombinations === _lastRenderedCombinations) return;

  const grid = document.getElementById('recipe-grid');
  if (!grid) return;
  // Only update the sentinel once we know we're actually rendering — otherwise an
  // early bail-out below could leave us "claiming" we rendered when we didn't.
  _lastRenderedCombinations = discoveredCombinations;

  const countEl = document.getElementById('recipe-count');
  const totalEl = document.getElementById('recipe-total');

  grid.innerHTML = '';

  const isDiscovered = (recipe) =>
    (discoveredCombinations[recipe.result]?.length ?? 0) > 0;
  // true (1) − false (0) = 1 sorts b before a, so discovered recipes float to the top
  const sortedRecipes = [...RECIPES].sort((a, b) => isDiscovered(b) - isDiscovered(a));
  let discoveredCount = 0;

  for (const recipe of sortedRecipes) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    if (isDiscovered(recipe)) {
      discoveredCount++;
      const result = INGREDIENTS[recipe.result];
      const foundCombos = new Set(discoveredCombinations[recipe.result]);
      // Iterate recipe.combinations as the source-of-truth ingredient ordering
      // (data-file order, not the sorted combinationKey order) so each combo
      // renders the way the recipe author wrote it.
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
