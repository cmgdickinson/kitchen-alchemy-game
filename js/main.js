import { loadState, getState, setState, resetState } from './systems/state.js';
import { tryRecipe, TOTAL_RECIPES } from './systems/combination.js';
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
  for (const recipe of RECIPES) {
    if (!discoveredRecipes.includes(recipe.id)) {
      for (const ing of recipe.ingredients) {
        counts[ing] = (counts[ing] ?? 0) + 1;
      }
    }
  }
  return counts;
}

function currentHintCounts() {
  return _hintsEnabled ? computeHintCounts(getState().discoveredRecipes) : null;
}

function fullRedraw(newItemIds = []) {
  const state = getState();
  renderPantry(state.unlockedItems, _selected, newItemIds, currentHintCounts());
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
  const isNew = !state.discoveredRecipes.includes(recipe.id);
  const resultItem = INGREDIENTS[recipe.result];

  if (isNew) {
    // Unlock the result item and record the discovery
    const newUnlocked = [...state.unlockedItems];
    if (!newUnlocked.includes(recipe.result)) {
      newUnlocked.push(recipe.result);
      _newItems = [recipe.result];
    }
    setState({
      discoveredRecipes: [...state.discoveredRecipes, recipe.id],
      unlockedItems: newUnlocked,
    });

    // Check milestones after the state update
    const triggered = checkMilestones();
    if (triggered.length > 0) {
      _milestoneQueue.push(...triggered);
      setTimeout(showNextMilestone, 800);
    }
  }

  showSuccess(recipe, resultItem, isNew);
  _selected = [];

  fullRedraw(_newItems);
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
