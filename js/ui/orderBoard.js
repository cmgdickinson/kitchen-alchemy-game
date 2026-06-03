import { INGREDIENTS } from '../data/ingredients.js';

// Placeholder text for the two empty-board situations. Hard-coded HTML, no
// dynamic data — see XSS convention note in pantry.js for why innerHTML is
// acceptable here but not for ingredient/customer names.
const NO_ORDERABLE_RECIPES_MSG =
  '<span class="order-placeholder-emoji">🍽️</span> Discover more recipes to<br>attract hungry customers!';
const REFILL_COMING_MSG =
  '<span class="order-placeholder-emoji">👀</span> Word travels fast. A new<br>customer is already on the way...';

export function renderOrderBoard(orders, discoveredRecipeIds) {
  const list = document.getElementById('order-list');
  if (!list) return;

  if (orders.length === 0) {
    for (const card of list.querySelectorAll('.order-card')) card.remove();

    // Pick the right placeholder. If the player has discovered at least one
    // orderable recipe, the orders queue is briefly empty between a fulfill/expiry
    // and the refill timer firing (2.5s / 3.5s later) — so tell them more is on
    // the way. Otherwise, customers genuinely can't arrive until they unlock
    // their first orderable recipe.
    //
    // .some(...) returns true as soon as it finds an element matching the
    // callback, and false if none do. The `?.` (optional chaining) on
    // INGREDIENTS[id]?.orderable returns undefined instead of throwing if the
    // id somehow isn't in INGREDIENTS — defensive against stale save data.
    const refillComing = discoveredRecipeIds.some(id => INGREDIENTS[id]?.orderable);
    const html = refillComing ? REFILL_COMING_MSG : NO_ORDERABLE_RECIPES_MSG;

    // Reuse the existing placeholder element if it's there (avoid flicker), and
    // update its content in case the situation flipped since the last render
    // (e.g. the player just discovered their first orderable recipe).
    let placeholder = list.querySelector('.order-placeholder:not([data-expired])');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'order-placeholder';
      list.appendChild(placeholder);
    }
    if (placeholder.innerHTML !== html) placeholder.innerHTML = html;
    return;
  }

  // Remove the empty-state placeholder if present
  list.querySelector('.order-placeholder:not([data-expired])')?.remove();

  // Remove cards for orders that are no longer active
  const activeIds = new Set(orders.map(o => o.id)); // O(1) lookup per card vs O(n) with array.includes
  for (const card of list.querySelectorAll('.order-card')) {
    if (!activeIds.has(card.dataset.orderId)) card.remove();
  }

  for (const order of orders) {
    const pct = (order.timeRemaining / order.timeLimit) * 100;
    const fillClass = pct > 40 ? '' : pct > 15 ? 'warning' : 'danger';
    const isExpiring = pct <= 15;

    const existing = list.querySelector(`.order-card[data-order-id="${order.id}"]`);

    if (existing) {
      // Patch only the parts that change every tick
      existing.classList.toggle('expiring', isExpiring);

      const fill = existing.querySelector('.order-timer-fill');
      fill.style.width = `${pct}%`;
      fill.className = `order-timer-fill ${fillClass}`;
      existing.querySelector('.order-timer-text').textContent = `${order.timeRemaining}s`;

      // Update the footer if fulfillability changed (new recipe discovered)
      const canFulfill = discoveredRecipeIds.includes(order.recipeId);
      const footer = existing.querySelector('.order-footer');
      const hasButton = !!footer.querySelector('.order-fulfill-btn');
      if (canFulfill && !hasButton) {
        footer.innerHTML = `<button class="order-fulfill-btn" data-order-id="${order.id}">Serve ✓</button>`;
      } else if (!canFulfill && hasButton) {
        footer.innerHTML = `<span class="order-unknown-hint">Discover the recipe first...</span>`;
      }
    } else {
      // Genuinely new order — create card fresh (slide-in animation plays once)
      const canFulfill = discoveredRecipeIds.includes(order.recipeId);
      const card = document.createElement('div');
      card.className = `order-card${isExpiring ? ' expiring' : ''}`;
      card.dataset.orderId = order.id;
      card.innerHTML = `
        <div class="order-header">
          <span class="order-customer"></span>
          <span class="order-reward">+💰${order.reward}</span>
        </div>
        <div class="order-dish">
          <span class="order-dish-emoji"></span>
          <span class="order-dish-name"></span>
        </div>
        <div class="order-timer-row">
          <div class="order-timer-bar">
            <div class="order-timer-fill ${fillClass}" style="width:${pct}%"></div>
          </div>
          <span class="order-timer-text">${order.timeRemaining}s</span>
        </div>
        <div class="order-footer">
          ${canFulfill
            ? `<button class="order-fulfill-btn" data-order-id="${order.id}">Serve ✓</button>`
            : `<span class="order-unknown-hint">Discover the recipe first...</span>`
          }
        </div>
      `;
      // textContent — prevents XSS (convention note in pantry.js)
      card.querySelector('.order-customer').textContent = order.customerName;
      card.querySelector('.order-dish-emoji').textContent = order.emoji;
      card.querySelector('.order-dish-name').textContent = order.name;
      list.appendChild(card);
    }
  }
}

export function showExpiredMessage(order) {
  const list = document.getElementById('order-list');
  if (!list) return;

  const msg = document.createElement('div');
  msg.className = 'order-placeholder';
  // data-expired both tags this element so renderOrderBoard's selector can skip
  // it when looking for the empty-state placeholder, and triggers the danger
  // colour rule in orders.css.
  msg.dataset.expired = 'true';
  msg.innerHTML = `
    <div class="expired-message-row">
      <span class="expired-message-text"></span>
      <button class="expired-dismiss-btn" title="Dismiss">✕</button>
    </div>
  `;
  // createElement + textContent — prevents XSS (convention note in pantry.js)
  const nameEl = document.createElement('strong');
  nameEl.textContent = order.customerName;
  msg.querySelector('.expired-message-text').append(nameEl, ` ${order.expiredMessage}`);

  const timer = setTimeout(() => msg.remove(), 10000);
  msg.querySelector('.expired-dismiss-btn').addEventListener('click', () => {
    clearTimeout(timer);
    msg.remove();
  });

  list.prepend(msg);
}
