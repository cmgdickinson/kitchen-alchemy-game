import { INGREDIENTS } from '../data/ingredients.js';

// ── UI rendering convention (applies to all files in js/ui/) ────────────────
// Dynamic values (ingredient names, recipe descriptions, customer names, etc.)
// are written via element.textContent or DOM methods like createElement, never
// by interpolating into innerHTML strings.
//
// Why: .textContent treats its input as plain text. innerHTML parses it as HTML,
// so any "<script>..." or '<img onerror="...">' hiding in a value would execute.
// Today every dynamic value comes from constant data files, so this is purely
// defensive — but it means the convention survives future changes like
// player-named save files, custom recipes, or imported recipe packs without
// each UI file needing a security review.
//
// Watch for this when reading the code: lines that build a small skeleton with
// innerHTML and then fill the empty <span>s via .textContent are doing this
// deliberately. A short "// textContent — prevents XSS" comment marks each spot.

// hintCounts: object of ingredientId → number of undiscovered recipes it appears in,
// or null when the hints feature is disabled.

const _cardCache = new Map(); // ingredientId → { card, newBadge, hintBadge }

export function renderPantry(unlockedItems, selectedIds = [], newItemIds = [], hintCounts = null) {
  const grid = document.getElementById('ingredient-grid');
  const countEl = document.getElementById('pantry-count');
  if (!grid) return;

  for (const id of unlockedItems) {
    const item = INGREDIENTS[id];
    if (!item) continue;

    const isSelected = selectedIds.includes(id);
    const isNew = newItemIds.includes(id);
    const hintCount = hintCounts?.[id] ?? 0;

    let entry = _cardCache.get(id);
    if (!entry) {
      const card = document.createElement('div');
      card.dataset.id = id;
      card.title = item.name;
      card.innerHTML = `
        <span class="ingredient-emoji"></span>
        <span class="ingredient-name"></span>
        <span class="new-badge hidden">New!</span>
        <span class="hint-badge hidden"></span>
      `;
      // textContent — prevents XSS (see convention note at top of file)
      card.querySelector('.ingredient-emoji').textContent = item.emoji;
      card.querySelector('.ingredient-name').textContent = item.name;
      entry = {
        card,
        newBadge: card.querySelector('.new-badge'),
        hintBadge: card.querySelector('.hint-badge'),
      };
      _cardCache.set(id, entry);
      grid.appendChild(card);
    }

    entry.card.className = 'ingredient-card' +
      (isSelected ? ' selected' : '') +
      (isNew      ? ' new-ingredient' : '');

    entry.newBadge.classList.toggle('hidden', !isNew);

    entry.hintBadge.classList.toggle('hidden', hintCount === 0);
    entry.hintBadge.textContent = hintCount > 0 ? hintCount : '';
  }

  // Remove cards for items no longer in unlockedItems (e.g. after a reset)
  if (_cardCache.size > unlockedItems.length) {
    const unlockedSet = new Set(unlockedItems); // O(1) lookup per card vs O(n) with array.includes
    for (const [id, { card }] of _cardCache) {
      if (!unlockedSet.has(id)) {
        card.remove();
        _cardCache.delete(id);
      }
    }
  }

  if (countEl) {
    countEl.textContent = `${unlockedItems.length} ingredients`;
  }
}
