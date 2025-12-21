/**
 * Context-Aware Filters Component - Tableau Style
 * Rol bazlı filtreler, hızlı filtre butonları, filtre durumu gösterimi, bookmark
 */

export class ContextualFilters {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      filters: options.filters || [],
      quickFilters: options.quickFilters || ['Bugün', 'Bu Hafta', 'Bu Ay', 'Bu Yıl'],
      onFilterChange: options.onFilterChange || null,
      role: options.role || null,
      ...options
    };
    this.activeFilters = {};
    this.activeQuickFilter = null;
    this.render();
    this.attachEventListeners();
  }

  render() {
    // Rol bazlı filtreleri filtrele
    const visibleFilters = this.options.filters.filter(filter => {
      if (filter.roleBased && this.options.role) {
        return filter.roles?.includes(this.options.role);
      }
      return true;
    });

    this.container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-700">Filtreler</h3>
          ${Object.keys(this.activeFilters).length > 0 ? `
            <button class="text-xs text-primary clear-filters-btn">
              Filtreleri Temizle
            </button>
          ` : ''}
        </div>
        
        <!-- Quick Filters -->
        ${this.options.quickFilters.length > 0 ? `
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            ${this.options.quickFilters.map(qf => {
              const isActive = this.activeQuickFilter === qf;
              return `
                <button 
                  class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'} quick-filter-btn"
                  data-quick-filter="${qf}"
                >
                  ${qf}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
        
        <!-- Filter Groups -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${visibleFilters.map(filter => this.renderFilterGroup(filter)).join('')}
        </div>
        
        <!-- Active Filters Display -->
        ${Object.keys(this.activeFilters).length > 0 ? `
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-medium text-gray-700">Aktif Filtreler:</span>
              ${Object.entries(this.activeFilters).map(([key, value]) => {
                const filter = visibleFilters.find(f => f.key === key);
                return `
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                    ${filter?.label || key}: ${this.getFilterDisplayValue(filter, value)}
                    <button 
                      class="ml-1 text-blue-700 hover:text-blue-900 remove-filter-btn"
                      data-filter-key="${key}"
                    >
                      ×
                    </button>
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderFilterGroup(filter) {
    switch (filter.type) {
      case 'date':
        return this.renderDateFilter(filter);
      case 'select':
        return this.renderSelectFilter(filter);
      case 'multiselect':
        return this.renderMultiSelectFilter(filter);
      case 'range':
        return this.renderRangeFilter(filter);
      default:
        return '';
    }
  }

  renderDateFilter(filter) {
    const value = this.activeFilters[filter.key] || filter.default || '';
    return `
      <div class="filter-group">
        <label class="block text-xs font-medium text-gray-700 mb-1">
          ${filter.label}
        </label>
        <input 
          type="date"
          class="filter-input w-full text-sm border border-gray-300 rounded-md px-3 py-2"
          data-filter-key="${filter.key}"
          value="${value}"
        />
      </div>
    `;
  }

  renderSelectFilter(filter) {
    const value = this.activeFilters[filter.key] || filter.default || '';
    return `
      <div class="filter-group">
        <label class="block text-xs font-medium text-gray-700 mb-1">
          ${filter.label}
        </label>
        <select 
          class="filter-select w-full text-sm border border-gray-300 rounded-md px-3 py-2"
          data-filter-key="${filter.key}"
        >
          <option value="">Tümü</option>
          ${filter.options ? filter.options.map(opt => `
            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
              ${opt.label}
            </option>
          `).join('') : ''}
        </select>
      </div>
    `;
  }

  renderMultiSelectFilter(filter) {
    const values = this.activeFilters[filter.key] || [];
    return `
      <div class="filter-group">
        <label class="block text-xs font-medium text-gray-700 mb-1">
          ${filter.label}
        </label>
        <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
          ${filter.options ? filter.options.map(opt => {
            const isChecked = values.includes(opt.value);
            return `
              <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                  type="checkbox"
                  class="filter-checkbox"
                  data-filter-key="${filter.key}"
                  value="${opt.value}"
                  ${isChecked ? 'checked' : ''}
                />
                <span>${opt.label}</span>
              </label>
            `;
          }).join('') : ''}
        </div>
      </div>
    `;
  }

  renderRangeFilter(filter) {
    const range = this.activeFilters[filter.key] || { min: filter.min || 0, max: filter.max || 100 };
    return `
      <div class="filter-group">
        <label class="block text-xs font-medium text-gray-700 mb-1">
          ${filter.label}
        </label>
        <div class="flex items-center gap-2">
          <input 
            type="number"
            class="filter-range-input w-full text-sm border border-gray-300 rounded-md px-3 py-2"
            data-filter-key="${filter.key}"
            data-range-type="min"
            placeholder="Min"
            value="${range.min}"
            min="${filter.min || 0}"
            max="${filter.max || 100}"
          />
          <span class="text-gray-500">-</span>
          <input 
            type="number"
            class="filter-range-input w-full text-sm border border-gray-300 rounded-md px-3 py-2"
            data-filter-key="${filter.key}"
            data-range-type="max"
            placeholder="Max"
            value="${range.max}"
            min="${filter.min || 0}"
            max="${filter.max || 100}"
          />
        </div>
      </div>
    `;
  }

  getFilterDisplayValue(filter, value) {
    if (filter.type === 'multiselect') {
      return Array.isArray(value) ? value.join(', ') : value;
    }
    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  }

  attachEventListeners() {
    // Quick filter buttons
    const quickFilterBtns = this.container.querySelectorAll('.quick-filter-btn');
    quickFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const quickFilter = btn.dataset.quickFilter;
        this.applyQuickFilter(quickFilter);
      });
    });

    // Filter inputs
    const filterInputs = this.container.querySelectorAll('.filter-input, .filter-select');
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        const key = input.dataset.filterKey;
        this.activeFilters[key] = input.value;
        this.activeQuickFilter = null; // Quick filter'i temizle
        this.notifyFilterChange();
        this.render();
        this.attachEventListeners();
      });
    });

    // Multi-select checkboxes
    const checkboxes = this.container.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const key = checkbox.dataset.filterKey;
        const value = checkbox.value;
        if (!this.activeFilters[key]) {
          this.activeFilters[key] = [];
        }
        if (checkbox.checked) {
          if (!this.activeFilters[key].includes(value)) {
            this.activeFilters[key].push(value);
          }
        } else {
          this.activeFilters[key] = this.activeFilters[key].filter(v => v !== value);
        }
        this.activeQuickFilter = null;
        this.notifyFilterChange();
        this.render();
        this.attachEventListeners();
      });
    });

    // Range inputs
    const rangeInputs = this.container.querySelectorAll('.filter-range-input');
    rangeInputs.forEach(input => {
      input.addEventListener('change', () => {
        const key = input.dataset.filterKey;
        const rangeType = input.dataset.rangeType;
        if (!this.activeFilters[key]) {
          this.activeFilters[key] = {};
        }
        this.activeFilters[key][rangeType] = parseFloat(input.value) || 0;
        this.activeQuickFilter = null;
        this.notifyFilterChange();
        this.render();
        this.attachEventListeners();
      });
    });

    // Remove filter buttons
    const removeBtns = this.container.querySelectorAll('.remove-filter-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.filterKey;
        delete this.activeFilters[key];
        this.notifyFilterChange();
        this.render();
        this.attachEventListeners();
      });
    });

    // Clear filters button
    const clearBtn = this.container.querySelector('.clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  applyQuickFilter(quickFilter) {
    this.activeQuickFilter = quickFilter;
    
    const today = new Date();
    let startDate, endDate;
    
    switch (quickFilter) {
      case 'Bugün':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'Bu Hafta':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'Bu Ay':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'Bu Yıl':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
    }
    
    // Date filter'ı bul ve uygula
    const dateFilter = this.options.filters.find(f => f.type === 'date');
    if (dateFilter) {
      this.activeFilters[dateFilter.key] = startDate;
      if (dateFilter.range) {
        this.activeFilters[`${dateFilter.key}_end`] = endDate;
      }
    }
    
    this.notifyFilterChange();
    this.render();
    this.attachEventListeners();
  }

  clearFilters() {
    this.activeFilters = {};
    this.activeQuickFilter = null;
    this.notifyFilterChange();
    this.render();
    this.attachEventListeners();
  }

  notifyFilterChange() {
    if (this.options.onFilterChange) {
      this.options.onFilterChange(this.activeFilters);
    }
  }

  getFilters() {
    return { ...this.activeFilters };
  }

  setFilters(filters) {
    this.activeFilters = { ...filters };
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

