import { INGREDIENTS } from '../data/ingredients.js';

let _resultClearTimer = null;

export function renderWorkspace(selectedIds) {
  const slotsEl = document.getElementById('workspace-slots');
  const combineBtn = document.getElementById('combine-btn');
  if (!slotsEl || !combineBtn) return;

  if (selectedIds.length === 0) {
    slotsEl.innerHTML = '<span class="workspace-hint">Click ingredients to add them here</span>';
  } else {
    slotsEl.innerHTML = '';
    for (const id of selectedIds) {
      const item = INGREDIENTS[id];
      if (!item) continue;

      const slot = document.createElement('div');
      slot.className = 'workspace-slot';
      slot.innerHTML = `
        <span class="slot-emoji"></span>
        <span class="slot-name"></span>
        <button class="workspace-slot-remove" title="Remove">×</button>
      `;
      // Set via textContent/dataset to prevent XSS if these values ever come from user input or external sources
      slot.querySelector('.slot-emoji').textContent = item.emoji;
      slot.querySelector('.slot-name').textContent = item.name;
      slot.querySelector('.workspace-slot-remove').dataset.removeId = id;
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
        <span class="result-card-emoji"></span>
        <span class="result-card-name"></span>
        <span class="result-card-tag ${tagClass}">${tag}</span>
      </div>
      <p class="result-card-desc"></p>
    </div>
  `;
  // Set via textContent to prevent XSS if these values ever come from user input or external sources
  area.querySelector('.result-card-emoji').textContent = resultItem.emoji;
  area.querySelector('.result-card-name').textContent = resultItem.name;
  area.querySelector('.result-card-desc').textContent = recipe.description;

  _resultClearTimer = setTimeout(() => { area.innerHTML = ''; }, 10000);
}

export function showFailure(message) {
  _clearResultTimer();
  const area = document.getElementById('result-area');
  if (!area) return;

  area.innerHTML = `
    <div class="result-card failure">
      <p class="result-card-desc"></p>
    </div>
  `;
  // Set via textContent to prevent XSS if these values ever come from user input or external sources
  area.querySelector('.result-card-desc').textContent = message;

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
