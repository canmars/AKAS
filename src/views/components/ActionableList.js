/**
 * Actionable List Component - Tableau Style
 * Öncelik bazlı renklendirme, hızlı aksiyon butonları, tıklanabilir satırlar, badge'ler
 */

export class ActionableList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title: options.title || 'Aksiyon Listesi',
      items: options.items || [],
      renderItem: options.renderItem || this.defaultRenderItem,
      onItemClick: options.onItemClick || null,
      emptyMessage: options.emptyMessage || 'Aksiyon bulunamadı',
      ...options
    };
    this.render();
    this.attachEventListeners();
  }

  defaultRenderItem(item) {
    return `
      <div class="actionable-item priority-${item.priority || 'medium'}" data-item-id="${item.id || ''}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              ${item.badge ? `
                <span class="badge badge-${item.badge.type || 'medium'}">${item.badge.label}</span>
              ` : ''}
              <h4 class="text-sm font-semibold text-gray-900">${item.title}</h4>
            </div>
            ${item.description ? `
              <p class="text-sm text-gray-600 mb-2">${item.description}</p>
            ` : ''}
            ${item.meta ? `
              <div class="text-xs text-gray-500">${item.meta}</div>
            ` : ''}
          </div>
          <div class="flex items-center gap-2 ml-4">
            ${item.actions ? item.actions.map((action, idx) => `
              <button 
                class="btn btn-sm ${action.primary ? 'btn-primary' : 'btn-outline'} action-btn"
                data-action-index="${idx}"
                data-action-type="${action.type || 'default'}"
              >
                ${action.label}
              </button>
            `).join('') : ''}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.options.items || this.options.items.length === 0) {
      this.container.innerHTML = `
        <div class="card">
          <div class="card-body text-center py-8 text-gray-500">
            ${this.options.emptyMessage}
          </div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="card">
        ${this.options.title ? `
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">${this.options.title}</h3>
          </div>
        ` : ''}
        <div class="card-body">
          <div class="space-y-3" id="actionable-list-items">
            ${this.options.items.map((item, index) => `
              <div data-item-index="${index}">
                ${this.options.renderItem(item, index)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Item click
    const items = this.container.querySelectorAll('.actionable-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        // Action button'a tıklanmadıysa
        if (!e.target.closest('.action-btn')) {
          const itemIndex = parseInt(item.closest('[data-item-index]').dataset.itemIndex);
          const itemData = this.options.items[itemIndex];
          if (this.options.onItemClick) {
            this.options.onItemClick(itemData);
          }
        }
      });
    });

    // Action buttons
    const actionBtns = this.container.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemIndex = parseInt(btn.closest('[data-item-index]').dataset.itemIndex);
        const actionIndex = parseInt(btn.dataset.actionIndex);
        const itemData = this.options.items[itemIndex];
        const action = itemData.actions[actionIndex];
        
        if (action && action.onClick) {
          action.onClick(itemData, action);
        }
      });
    });
  }

  update(items) {
    this.options.items = items;
    this.render();
    this.attachEventListeners();
  }

  addItem(item) {
    this.options.items.push(item);
    this.render();
    this.attachEventListeners();
  }

  removeItem(itemId) {
    this.options.items = this.options.items.filter(item => item.id !== itemId);
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

