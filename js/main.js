import { loadState, getState, setState, resetState, getDiscoveredRecipes } from './systems/state.js';
import { tryRecipe, combinationKey } from './systems/combination.js';
import { checkMilestones } from './systems/milestones.js';
import {
  setOrdersChangeHandler, getActiveOrders,
  tryFillOrders, fulfillOrder, startOrderTimer, resetOrders,
} from './systems/orders.js';
import { INGREDIENTS } from './data/ingredients.js';
import { RECIPES } from './data/recipes.js';
import { renderPantry } from './ui/pantry.js';
import { renderWorkspace, showSuccess, showFailure, clearResult } from './ui/workspace.js';
import { renderRecipeBook } from './ui/recipeBook.js';
import { renderOrderBoard, showExpiredMessage } from './ui/orderBoard.js';

// ── State ─────────────────────────────────────────────────────────────────────

let _selected = [];   // ingredient IDs currently in the workspace
let _newItems  = [];  // items to flash "new" badge (cleared on next pantry render)
let _milestoneQueue = [];
let _hintsEnabled = false;

const FAILURE_MESSAGES = [
  "The ingredients stared at each other awkwardly and nothing happened.",
  "Something went very wrong. You've chosen to pretend it didn't.",
  "A faint smell of disappointment fills the kitchen.",
  "The universe reviewed your combination and respectfully declined.",
  "Technically food. We won't be serving it.",
  "Your ancestors are watching. They are not impressed.",
  "This combination is why recipe testing exists.",
  "The laws of flavour have been consulted. They said no.",
  "Close, but also very far away.",
  "You've created something. It is best described as 'a mistake'.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function updateCoins() {
  const el = document.getElementById('coins');
  if (el) el.textContent = getState().coins;
}

function updateOrdersCompleted() {
  const el = document.getElementById('orders-completed');
  if (el) el.textContent = `${getState().completedOrders} completed`;
}

function computeHintCounts(discoveredRecipes) {
  const counts = {};
  const discoveredSet = new Set(discoveredRecipes); // O(1) lookup per recipe vs O(n) with array.includes
  for (const recipe of RECIPES) {
    if (!discoveredSet.has(recipe.result)) {
      // Dedup per recipe: hints count "recipes-I-still-need that use this ingredient",
      // not paths to them.
      const uniqueIngredients = new Set(recipe.combinations.flat());
      for (const ing of uniqueIngredients) {
        counts[ing] = (counts[ing] ?? 0) + 1;
      }
    }
  }
  return counts;
}

// Memoised on the derived list's length — sufficient because the list is append-only
// between resets. -1 sentinel for "never cached" (0 is a valid length).
let _cachedHintCounts = null;
let _cachedHintCountsForLen = -1;

function currentHintCounts() {
  if (!_hintsEnabled) return null;
  const discovered = getDiscoveredRecipes();
  if (discovered.length !== _cachedHintCountsForLen) {
    _cachedHintCounts = computeHintCounts(discovered);
    _cachedHintCountsForLen = discovered.length;
  }
  return _cachedHintCounts;
}

function fullRedraw() {
  const state = getState();
  // Pantry's third arg is the list of items to flash a "New!" badge on. Both
  // callers of fullRedraw (init, handleReset) are situations where no flashes
  // are wanted, so we hardcode an empty list here.
  renderPantry(state.unlockedItems, _selected, [], currentHintCounts());
  renderWorkspace(_selected);
  renderRecipeBook(state.discoveredCombinations);
  renderOrderBoard(getActiveOrders(), getDiscoveredRecipes());
  updateCoins();
  updateOrdersCompleted();
}

// ── Coin float animation ──────────────────────────────────────────────────────

function spawnCoinFloat(reward) {
  const coinsEl = document.getElementById('coins');
  if (!coinsEl) return;
  const rect = coinsEl.getBoundingClientRect();
  const floater = document.createElement('div');
  floater.className = 'coin-float';
  floater.textContent = `+${reward} 💰`;
  floater.style.left = `${rect.left}px`;
  floater.style.top  = `${rect.top}px`;
  document.body.appendChild(floater);
  floater.addEventListener('animationend', () => floater.remove());
}

// ── Milestone modal queue ─────────────────────────────────────────────────────

function showNextMilestone() {
  if (_milestoneQueue.length === 0) return;
  const milestone = _milestoneQueue.shift();

  document.getElementById('modal-emoji').textContent  = milestone.emoji;
  document.getElementById('modal-title').textContent  = milestone.title;
  document.getElementById('modal-message').textContent = milestone.message;
  document.getElementById('milestone-modal').removeAttribute('hidden');
}

function handleMilestoneClose() {
  document.getElementById('milestone-modal').setAttribute('hidden', '');
  // Small delay so the modal closes before the next one pops
  if (_milestoneQueue.length > 0) setTimeout(showNextMilestone, 300);
}

// ── Ingredient selection ──────────────────────────────────────────────────────

function handleIngredientToggle(id) {
  if (_selected.includes(id)) {
    _selected = _selected.filter(i => i !== id);
  } else if (_selected.length < 4) {
    _selected.push(id);
    clearResult();
  }
  renderPantry(getState().unlockedItems, _selected, [], currentHintCounts());
  renderWorkspace(_selected);
}

function handleWorkspaceRemove(id) {
  _selected = _selected.filter(i => i !== id);
  renderPantry(getState().unlockedItems, _selected, [], currentHintCounts());
  renderWorkspace(_selected);
}

// ── Combination ───────────────────────────────────────────────────────────────

function handleCombine() {
  if (_selected.length < 2) return;

  const recipes = tryRecipe(_selected);

  if (recipes.length === 0) {
    showFailure(FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)]);
    return;
  }

  const state = getState();
  const comboKey = combinationKey(_selected);

  const matches = recipes.map(recipe => {
    const existingCombos = state.discoveredCombinations[recipe.result] ?? [];
    return {
      recipe,
      resultItem: INGREDIENTS[recipe.result],
      existingCombos,
      isNewCombo: !existingCombos.includes(comboKey),
      isNewRecipe: existingCombos.length === 0,
    };
  });

  const anyNewCombo = matches.some(m => m.isNewCombo);
  const anyNewRecipe = matches.some(m => m.isNewRecipe);

  if (anyNewCombo) {
    const newDiscovered = { ...state.discoveredCombinations };
    const newUnlocked = [...state.unlockedItems];
    for (const m of matches) {
      if (!m.isNewCombo) continue;
      newDiscovered[m.recipe.result] = [...m.existingCombos, comboKey];
      // Guard against the result already being in the pantry (e.g. milestone reward).
      if (m.isNewRecipe && !newUnlocked.includes(m.recipe.result)) {
        newUnlocked.push(m.recipe.result);
        _newItems.push(m.recipe.result);
      }
    }

    const patch = { discoveredCombinations: newDiscovered };
    if (newUnlocked.length !== state.unlockedItems.length) patch.unlockedItems = newUnlocked;
    setState(patch);

    // Milestones depend on discovered-recipe count — only bumped on new-recipe discoveries.
    if (anyNewRecipe) {
      const triggered = checkMilestones();
      if (triggered.length > 0) {
        _milestoneQueue.push(...triggered);
        setTimeout(showNextMilestone, 800);
        _newItems.push(...triggered.map(m => m.reward));
      }
    }
  }

  showSuccess(matches);
  _selected = [];

  // Skip fullRedraw when no game state changed — saves rebuilding the recipe
  // book and order board on a combine of an already-known combination.
  if (anyNewCombo) {
    // setState above (plus checkMilestones, which may also setState) replaced _state.
    const updated = getState();
    renderPantry(updated.unlockedItems, _selected, _newItems, currentHintCounts());
    renderWorkspace(_selected);
    renderRecipeBook(updated.discoveredCombinations);
    renderOrderBoard(getActiveOrders(), getDiscoveredRecipes());
  } else {
    // Pantry redraw drops the selection highlight; nothing else needs updating.
    renderPantry(state.unlockedItems, _selected, [], currentHintCounts());
    renderWorkspace(_selected);
  }
  _newItems = [];

  if (anyNewRecipe && getActiveOrders().length === 0) tryFillOrders();
}

// ── Orders ────────────────────────────────────────────────────────────────────

function handleFulfill(orderId) {
  const order = fulfillOrder(orderId);
  if (!order) return;

  // Milestone check (completing an order can trigger milestones)
  const triggered = checkMilestones();
  if (triggered.length > 0) {
    _milestoneQueue.push(...triggered);
    setTimeout(showNextMilestone, 400);
  }

  spawnCoinFloat(order.reward);
  const state = getState();
  renderOrderBoard(getActiveOrders(), getDiscoveredRecipes());
  updateCoins();
  updateOrdersCompleted();
  if (triggered.length > 0) {
    renderPantry(state.unlockedItems, _selected, triggered.map(m => m.reward), currentHintCounts());
  }
}

function handleOrderExpired(expired) {
  for (const order of expired) showExpiredMessage(order);
}

// ── Recipe book toggle ────────────────────────────────────────────────────────

function toggleRecipeBook() {
  const book   = document.getElementById('recipe-book');
  const arrow  = document.getElementById('toggle-arrow');
  const isOpen = book.classList.toggle('open');
  arrow.textContent = isOpen ? '▼' : '▲';
}

// ── Reset ─────────────────────────────────────────────────────────────────────

function handleReset() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  resetState();
  resetOrders();
  document.querySelectorAll('#order-list [data-expired]').forEach(el => el.remove());
  _selected = [];
  _newItems  = [];
  _milestoneQueue = [];
  // Wipes the result-area card from before the reset, and clears its pending
  // 10s auto-clear timer so it can't fire and wipe a future result.
  clearResult();
  fullRedraw();
}

// ── Event wiring ──────────────────────────────────────────────────────────────

function wireEvents() {
  // Pantry click → ingredient toggle
  document.getElementById('ingredient-grid').addEventListener('click', e => {
    const card = e.target.closest('.ingredient-card');
    if (card) handleIngredientToggle(card.dataset.id);
  });

  // Workspace slot remove
  document.getElementById('workspace-slots').addEventListener('click', e => {
    const btn = e.target.closest('.workspace-slot-remove');
    if (btn) handleWorkspaceRemove(btn.dataset.removeId);
  });

  document.getElementById('combine-btn').addEventListener('click', handleCombine);
  document.getElementById('clear-btn').addEventListener('click', () => {
    _selected = [];
    clearResult();
    renderPantry(getState().unlockedItems, _selected, [], currentHintCounts());
    renderWorkspace(_selected);
  });

  document.getElementById('hints-toggle-btn').addEventListener('click', () => {
    _hintsEnabled = !_hintsEnabled;
    document.getElementById('hints-toggle-btn').classList.toggle('active', _hintsEnabled);
    renderPantry(getState().unlockedItems, _selected, [], currentHintCounts());
  });

  // Order fulfill
  document.getElementById('order-list').addEventListener('click', e => {
    const btn = e.target.closest('.order-fulfill-btn');
    if (btn) handleFulfill(btn.dataset.orderId);
  });

  document.getElementById('recipe-book-toggle').addEventListener('click', toggleRecipeBook);
  document.getElementById('modal-close').addEventListener('click', handleMilestoneClose);
  document.getElementById('reset-btn').addEventListener('click', handleReset);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  loadState();
  wireEvents();

  setOrdersChangeHandler(() => {
    renderOrderBoard(getActiveOrders(), getDiscoveredRecipes());
  });

  startOrderTimer(handleOrderExpired);

  fullRedraw();

  // Try to fill order slots once on load (in case of existing save with recipes)
  setTimeout(tryFillOrders, 1000);
}

init();
