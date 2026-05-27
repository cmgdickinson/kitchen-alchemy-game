import { INGREDIENTS } from '../data/ingredients.js';

// hintCounts: Map/object of ingredientId → number of undiscovered recipes it appears in,
// or null when the hints feature is disabled.
export function renderPantry(unlockedItems, selectedIds = [], newItemIds = [], hintCounts = null) {
  const grid = document.getElementById('ingredient-grid');
  const countEl = document.getElementById('pantry-count');
  if (!grid) return;

  grid.innerHTML = '';

  for (const id of unlockedItems) {
    const item = INGREDIENTS[id];
    if (!item) continue;

    const isSelected = selectedIds.includes(id);
    const isNew = newItemIds.includes(id);
    const hintCount = hintCounts?.[id] ?? 0;

    const card = document.createElement('div');
    card.className = 'ingredient-card' +
      (isSelected ? ' selected' : '') +
      (isNew      ? ' new-ingredient' : '');
    card.dataset.id = id;
    card.title = item.name;

    card.innerHTML = `
      <span class="ingredient-emoji">${item.emoji}</span>
      <span class="ingredient-name">${item.name}</span>
      ${isNew ? '<span class="new-badge">New!</span>' : ''}
      ${hintCounts !== null && hintCount > 0 ? `<span class="hint-badge">${hintCount}</span>` : ''}
    `;

    grid.appendChild(card);
  }

  if (countEl) {
    countEl.textContent = `${unlockedItems.length} ingredients`;
  }
}
