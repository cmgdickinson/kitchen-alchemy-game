import { RECIPES } from '../data/recipes.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { getState, setState } from './state.js';

const MAX_ORDERS = 3;

const CUSTOMER_NAMES = [
  'Hungry Harold', 'Ravenous Rachel', 'Peckish Pete', 'Famished Fiona',
  'Starving Steve', 'Greedy Greg', 'Empty Emma', 'Hollow Hans',
  'Voracious Vera', 'Munchie Mike', 'Bottomless Betty', 'Insatiable Ivan',
  'Craving Carl', 'Desperate Deb', 'Snacky Svetlana', 'Rumbling Roberto',
];

const EXPIRED_MESSAGES = [
  'stormed off muttering about delivery apps.',
  'left a 1-star review. It was very detailed. There was a spreadsheet.',
  'waited, sighed deeply, and is now eating cereal at home. This is your fault.',
  'has filed a formal complaint with their stomach.',
  'left. The disappointment in their eyes will haunt you.',
  'decided to become vegan out of spite.',
  'called their mother to complain. Their mother agreed.',
  'wrote a strongly-worded letter. In cursive.',
];

let _orders = [];
let _idCounter = 0;
let _onChanged = null;

export function setOrdersChangeHandler(fn) {
  _onChanged = fn;
}

export function getActiveOrders() {
  return [..._orders];
}

function getOrderableRecipes() {
  const { discoveredRecipes } = getState();
  return discoveredRecipes
    .map(id => RECIPES.find(r => r.id === id))
    .filter(r => r && INGREDIENTS[r.result]?.orderable);
}

// May remove this functionality in future. Different time limits add nothing of value.
function timeLimitForState() {
  const count = getState().discoveredRecipes.length;
  if (count < 6)  return 90;
  if (count < 14) return 70;
  return 52;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrder() {
  const orderable = getOrderableRecipes();
  if (orderable.length === 0) return null;

  // Avoid duplicating an already-active recipe if possible
  const existing = new Set(_orders.map(o => o.recipeId));
  const pool = orderable.filter(r => !existing.has(r.id));
  const recipe = pool.length > 0 ? randomFrom(pool) : randomFrom(orderable);

  const item = INGREDIENTS[recipe.result];
  const timeLimit = timeLimitForState();
  const reward = 10 + recipe.ingredients.length * 4 + Math.floor(Math.random() * 8);

  return {
    id: `ord_${++_idCounter}`,
    customerName: randomFrom(CUSTOMER_NAMES),
    recipeId: recipe.id,
    name: item.name,
    emoji: item.emoji,
    reward,
    timeLimit,
    timeRemaining: timeLimit,
    expiredMessage: randomFrom(EXPIRED_MESSAGES),
  };
}

export function resetOrders() {
  _orders = [];
  _idCounter = 0;
}

export function tryFillOrders() {
  let changed = false;
  while (_orders.length < MAX_ORDERS) {
    const order = generateOrder();
    if (!order) break;
    _orders.push(order);
    changed = true;
  }
  if (changed) _onChanged?.();
}

export function fulfillOrder(orderId) {
  const idx = _orders.findIndex(o => o.id === orderId);
  if (idx === -1) return null;

  const order = _orders[idx];

  _orders.splice(idx, 1);
  const state = getState();
  setState({
    coins: state.coins + order.reward,
    completedOrders: state.completedOrders + 1,
  });

  setTimeout(tryFillOrders, 2500);
  return order;
}

export function tickOrders() {
  const expired = [];
  const hadOrders = _orders.length > 0;

  for (let i = _orders.length - 1; i >= 0; i--) {
    _orders[i].timeRemaining -= 1;
    if (_orders[i].timeRemaining <= 0) {
      expired.push(_orders[i]);
      _orders.splice(i, 1);
    }
  }

  if (hadOrders) _onChanged?.();
  if (expired.length > 0) setTimeout(tryFillOrders, 3500);
  return expired;
}

export function startOrderTimer(onExpired) {
  setInterval(() => {
    const expired = tickOrders();
    if (expired.length > 0) onExpired?.(expired);
  }, 1000);
}
