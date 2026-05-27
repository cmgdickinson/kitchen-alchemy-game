import { INGREDIENTS } from '../data/ingredients.js';

let _resultClearTimer = null;

export function renderWorkspace(selectedIds) {
  const slotsEl = document.getElementById('workspace-slots');
  const combineBtn = document.getElementById('combine-btn');
  if (!slotsEl || !combineBtn) return;

  slotsEl.innerHTML = '';

  if (selectedIds.length === 0) {
    slotsEl.innerHTML = '<span class="workspace-hint">Click ingredients to add them here</span>';
  } else {
    for (const id of selectedIds) {
      const item = INGREDIENTS[id];
      if (!item) continue;

      const slot = document.createElement('div');
      slot.className = 'workspace-slot';
      slot.innerHTML = `
        <span class="slot-emoji">${item.emoji}</span>
        <span>${item.name}</span>
        <button class="workspace-slot-remove" data-remove-id="${id}" title="Remove">×</button>
      `;
      slotsEl.appendChild(slot);
    }
  }

  combineBtn.disabled = selectedIds.length < 2;
}

export function showSuccess(recipe, resultItem, isNew) {
  _clearResultTimer();
  const area = document.getElementById('result-area');
  if (!area) return;

  const tag = isNew ? 'New Discovery!' : 'Already Known';
  const tagClass = isNew ? '' : 'known';

  area.innerHTML = `
    <div class="result-card ${isNew ? '' : 'already-known'}">
      <div class="result-card-top">
        <span class="result-card-emoji">${resultItem.emoji}</span>
        <span class="result-card-name">${resultItem.name}</span>
        <span class="result-card-tag ${tagClass}">${tag}</span>
      </div>
      <p class="result-card-desc">${recipe.description}</p>
    </div>
  `;

  _resultClearTimer = setTimeout(() => { area.innerHTML = ''; }, 5000);
}

export function showFailure(message) {
  _clearResultTimer();
  const area = document.getElementById('result-area');
  if (!area) return;

  area.innerHTML = `
    <div class="result-card failure">
      <p class="result-card-desc">${message}</p>
    </div>
  `;

  _resultClearTimer = setTimeout(() => { area.innerHTML = ''; }, 4000);
}

export function clearResult() {
  _clearResultTimer();
  const area = document.getElementById('result-area');
  if (area) area.innerHTML = '';
}

function _clearResultTimer() {
  if (_resultClearTimer) {
    clearTimeout(_resultClearTimer);
    _resultClearTimer = null;
  }
}
