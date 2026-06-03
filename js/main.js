import { loadState, getState, setState, resetState } from './systems/state.js';
import { tryRecipe } from './systems/combination.js';
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
      for (const ing of recipe.ingredients) {
        counts[ing] = (counts[ing] ?? 0) + 1;
      }
    }
  }
  return counts;
}

// Memoization cache for computeHintCounts. The result depends only on
// discoveredRecipes, which is append-only between resets and goes back to 0
// on reset — so .length is a sufficient fingerprint. Same trick as the
// memoization in recipeBook.js. -1 is the "never cached yet" sentinel (0 is
// a legitimate length for a fresh game).
let _cachedHintCounts = null;
let _cachedHintCountsForLen = -1;

function currentHintCounts() {
  if (!_hintsEnabled) return null;
  const discovered = getState().discoveredRecipes;
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
  renderRecipeBook(state.discoveredRecipes);
  renderOrderBoard(getActiveOrders(), state.discoveredRecipes);
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

  const recipe = tryRecipe(_selected);

  if (!recipe) {
    showFailure(FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)]);
    return;
  }

  const state = getState();
  // .includes returns true/false for a single check — no Set needed for one lookup
  const isNew = !state.discoveredRecipes.includes(recipe.result);
  const resultItem = INGREDIENTS[recipe.result];

  if (isNew) {
    // Unlock the result item and record the discovery.
    // [...arr] uses the spread operator to make a shallow copy, so we don't mutate state directly.
    const newUnlocked = [...state.unlockedItems];
    // Guards against a recipe result that's already unlocked — currently impossible since each
    // recipe has a unique result, but will matter once a result can be reached by multiple combos.
    // In that future case, discovering a new combo path for an already-unlocked result will skip
    // the "New!" flash (no flash for an item the player can already see in the pantry) while still
    // recording the new combo path as discovered.
    if (!state.unlockedItems.includes(recipe.result)) {
      newUnlocked.push(recipe.result);
      _newItems = [recipe.result];
    }
    setState({
      discoveredRecipes: [...state.discoveredRecipes, recipe.result],
      unlockedItems: newUnlocked,
    });

    // Check milestones after the state update
    const triggered = checkMilestones();
    if (triggered.length > 0) {
      _milestoneQueue.push(...triggered);
      setTimeout(showNextMilestone, 800);
      _newItems.push(...triggered.map(m => m.reward));
    }
  }

  showSuccess(recipe, resultItem, isNew);
  _selected = [];

  // Renderer dispatch — call only the panels whose inputs actually changed.
  // We avoid fullRedraw here so a successful combine of an already-known recipe
  // doesn't pointlessly rebuild the recipe book and order board.
  if (isNew) {
    // setState() above (and checkMilestones, which may also setState) changed
    // discoveredRecipes / unlockedItems / triggeredMilestones, so re-read state.
    const updated = getState();
    renderPantry(updated.unlockedItems, _selected, _newItems, currentHintCounts());
    renderWorkspace(_selected);
    renderRecipeBook(updated.discoveredRecipes);
    renderOrderBoard(getActiveOrders(), updated.discoveredRecipes);
  } else {
    // Known recipe: no game state changed, only the workspace selection was cleared.
    // Pantry redraw is still needed to drop the "selected" highlight from the cards.
    renderPantry(state.unlockedItems, _selected, [], currentHintCounts());
    renderWorkspace(_selected);
  }
  _newItems = [];

  if (isNew && getActiveOrders().length === 0) tryFillOrders();
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
  renderOrderBoard(getActiveOrders(), state.discoveredRecipes);
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
  const btn    = document.getElementById('recipe-book-toggle');
  const arrow  = document.getElementById('toggle-arrow');
  const isOpen = book.classList.contains('open');
  book.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  arrow.textContent = isOpen ? '▲' : '▼';
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
    renderOrderBoard(getActiveOrders(), getState().discoveredRecipes);
  });

  startOrderTimer(handleOrderExpired);

  fullRedraw();

  // Try to fill order slots once on load (in case of existing save with recipes)
  setTimeout(tryFillOrders, 1000);
}

init();
