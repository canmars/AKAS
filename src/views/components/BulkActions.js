/**
 * Bulk Actions Component - Tableau Style
 * Toplu işlemler için checkbox'lar ve action butonları
 */

export class BulkActions {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: options.items || [],
      actions: options.actions || [],
      onSelectionChange: options.onSelectionChange || null,
      ...options
    };
    this.selectedItems = new Set();
    this.render();
    this.attachEventListeners();
  }

  render() {
    const hasSelection = this.selectedItems.size > 0;

    this.container.innerHTML = `
      <div class="bulk-actions-bar ${hasSelection ? 'active' : ''}">
        <div class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="bulk-select-all"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                ${this.selectedItems.size === this.options.items.length && this.options.items.length > 0 ? 'checked' : ''}
              />
              <label for="bulk-select-all" class="text-sm font-medium text-gray-700 cursor-pointer">
                Tümünü Seç
              </label>
            </div>
            <div class="text-sm text-gray-600">
              <span class="font-semibold text-blue-600">${this.selectedItems.size}</span> öğe seçildi
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${this.options.actions.map((action, index) => `
              <button 
                class="btn btn-sm ${action.primary ? 'btn-primary' : 'btn-outline'} bulk-action-btn"
                data-action-index="${index}"
                ${!hasSelection ? 'disabled' : ''}
              >
                ${action.label}
              </button>
            `).join('')}
            <button 
              class="btn btn-outline btn-sm"
              onclick="window.bulkActions?.clearSelection()"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Select all checkbox
    const selectAll = this.container.querySelector('#bulk-select-all');
    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectAll();
        } else {
          this.clearSelection();
        }
      });
    }

    // Action buttons
    const actionBtns = this.container.querySelectorAll('.bulk-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const actionIndex = parseInt(btn.dataset.actionIndex);
        const action = this.options.actions[actionIndex];
        if (action && action.onClick) {
          action.onClick(Array.from(this.selectedItems));
        }
      });
    });
  }

  selectAll() {
    this.selectedItems = new Set(this.options.items.map(item => item.id || item.ogrenci_id || item.milestone_id));
    this.updateSelection();
  }

  clearSelection() {
    this.selectedItems.clear();
    this.updateSelection();
  }

  toggleItem(itemId) {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
    this.updateSelection();
  }

  updateSelection() {
    this.render();
    this.attachEventListeners();
    
    if (this.options.onSelectionChange) {
      this.options.onSelectionChange(Array.from(this.selectedItems));
    }
  }

  getSelectedItems() {
    return Array.from(this.selectedItems);
  }

  setItems(items) {
    this.options.items = items;
    this.selectedItems.clear();
    this.render();
    this.attachEventListeners();
  }

  setActions(actions) {
    this.options.actions = actions;
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

