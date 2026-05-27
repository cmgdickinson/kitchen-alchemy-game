export function renderOrderBoard(orders, discoveredRecipeIds) {
  const list = document.getElementById('order-list');
  if (!list) return;

  if (orders.length === 0) {
    list.innerHTML = `
      <div class="order-placeholder">
        <span class="order-placeholder-emoji">🍽️</span>
        Discover more recipes to<br>attract hungry customers!
      </div>
    `;
    return;
  }

  // Remove the empty-state placeholder if present
  list.querySelector('.order-placeholder:not([data-expired])')?.remove();

  // Remove cards for orders that are no longer active
  const activeIds = new Set(orders.map(o => o.id));
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
      if (fill) {
        fill.style.width = `${pct}%`;
        fill.className = `order-timer-fill ${fillClass}`;
      }
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
          <span class="order-customer">${order.customerName}</span>
          <span class="order-reward">+💰${order.reward}</span>
        </div>
        <div class="order-dish">
          <span class="order-dish-emoji">${order.emoji}</span>
          <span class="order-dish-name">${order.name}</span>
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
      list.appendChild(card);
    }
  }
}

export function showExpiredMessage(order) {
  const list = document.getElementById('order-list');
  if (!list) return;

  const msg = document.createElement('div');
  msg.className = 'order-placeholder';
  msg.dataset.expired = 'true';
  msg.style.borderColor = 'var(--danger)';
  msg.style.color = 'var(--danger)';
  msg.innerHTML = `
    <div class="expired-message-row">
      <span><strong>${order.customerName}</strong> ${order.expiredMessage}</span>
      <button class="expired-dismiss-btn" title="Dismiss">✕</button>
    </div>
  `;

  const timer = setTimeout(() => msg.remove(), 10000);
  msg.querySelector('.expired-dismiss-btn').addEventListener('click', () => {
    clearTimeout(timer);
    msg.remove();
  });

  list.prepend(msg);
}
