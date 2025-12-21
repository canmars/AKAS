/**
 * Drill-Down Modal Component - Tableau Style
 * Tablo görünümü, filtreleme, sıralama, export, satıra tıklayınca detay
 */

import formatters from '../../utils/formatters.js';

export class DrillDownModal {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title: options.title || 'Detaylar',
      data: options.data || [],
      columns: options.columns || [],
      onRowClick: options.onRowClick || null,
      filters: options.filters || [],
      exportButton: options.exportButton !== false,
      onClose: options.onClose || null,
      ...options
    };
    this.filteredData = [...this.options.data];
    this.currentSort = { column: null, direction: 'asc' };
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto" id="drill-down-modal-overlay">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 modal-overlay"></div>
          
          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
            <!-- Header -->
            <div class="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">${this.options.title}</h3>
              <div class="flex items-center gap-2">
                ${this.options.exportButton ? `
                  <button class="btn btn-outline btn-sm export-btn" data-format="excel">
                    Excel'e Aktar
                  </button>
                ` : ''}
                <button class="text-gray-400 hover:text-gray-600 close-btn">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Filters -->
            ${this.options.filters.length > 0 ? `
              <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div class="flex items-center gap-4 flex-wrap">
                  ${this.options.filters.map(filter => `
                    <div class="filter-group">
                      <label class="text-xs font-medium text-gray-700 mb-1 block">${filter.label}</label>
                      <select class="filter-select text-sm border border-gray-300 rounded-md px-3 py-1.5" data-filter="${filter.key}">
                        <option value="">Tümü</option>
                        ${filter.options ? filter.options.map(opt => `
                          <option value="${opt.value}">${opt.label}</option>
                        `).join('') : ''}
                      </select>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Table -->
            <div class="px-6 py-4 max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    ${this.options.columns.map(col => `
                      <th 
                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sortable-header cursor-pointer hover:bg-gray-100"
                        data-column="${col.key}"
                      >
                        <div class="flex items-center gap-2">
                          ${col.label || col.key}
                          <svg class="w-4 h-4 sort-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200" id="drill-down-table-body">
                  ${this.renderTableBody()}
                </tbody>
              </table>
              
              ${this.filteredData.length === 0 ? `
                <div class="text-center py-8 text-gray-500">
                  Veri bulunamadı
                </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div class="text-sm text-gray-600">
                Toplam ${this.filteredData.length} kayıt
              </div>
              <button class="btn btn-primary btn-sm close-btn">
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderTableBody() {
    return this.filteredData.map((row, index) => `
      <tr class="hover:bg-gray-50 cursor-pointer table-row" data-index="${index}">
        ${this.options.columns.map(col => {
          const value = this.getNestedValue(row, col.key);
          const formattedValue = col.formatter ? col.formatter(value, row) : value;
          return `
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              ${formattedValue}
            </td>
          `;
        }).join('')}
      </tr>
    `).join('');
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? '-';
  }

  attachEventListeners() {
    // Close button
    const closeBtns = this.container.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.close();
      });
    });

    // Overlay click
    const overlay = this.container.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.close();
      });
    }

    // Row click
    const rows = this.container.querySelectorAll('.table-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.dataset.index);
        const rowData = this.filteredData[index];
        if (this.options.onRowClick) {
          this.options.onRowClick(rowData);
        }
      });
    });

    // Sort headers
    const sortHeaders = this.container.querySelectorAll('.sortable-header');
    sortHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.column;
        this.sortBy(column);
      });
    });

    // Filters
    const filterSelects = this.container.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
      select.addEventListener('change', () => {
        this.applyFilters();
      });
    });

    // Export button
    const exportBtn = this.container.querySelector('.export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToExcel();
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container.querySelector('#drill-down-modal-overlay')) {
        this.close();
      }
    });
  }

  sortBy(column) {
    if (this.currentSort.column === column) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.column = column;
      this.currentSort.direction = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const aVal = this.getNestedValue(a, column);
      const bVal = this.getNestedValue(b, column);
      
      if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.updateTable();
    this.updateSortIcons();
  }

  updateSortIcons() {
    const headers = this.container.querySelectorAll('.sortable-header');
    headers.forEach(header => {
      const icon = header.querySelector('.sort-icon');
      if (header.dataset.column === this.currentSort.column) {
        icon.classList.remove('hidden');
        icon.style.transform = this.currentSort.direction === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)';
      } else {
        icon.classList.add('hidden');
      }
    });
  }

  applyFilters() {
    const filterSelects = this.container.querySelectorAll('.filter-select');
    const activeFilters = {};
    
    filterSelects.forEach(select => {
      const filterKey = select.dataset.filter;
      const filterValue = select.value;
      if (filterValue) {
        activeFilters[filterKey] = filterValue;
      }
    });

    this.filteredData = this.options.data.filter(row => {
      return Object.entries(activeFilters).every(([key, value]) => {
        const rowValue = this.getNestedValue(row, key);
        return String(rowValue) === String(value);
      });
    });

    this.updateTable();
  }

  updateTable() {
    const tbody = this.container.querySelector('#drill-down-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderTableBody();
      this.attachRowListeners();
    }
  }

  attachRowListeners() {
    const rows = this.container.querySelectorAll('.table-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.dataset.index);
        const rowData = this.filteredData[index];
        if (this.options.onRowClick) {
          this.options.onRowClick(rowData);
        }
      });
    });
  }

  exportToExcel() {
    // Basit CSV export (Excel uyumlu)
    const headers = this.options.columns.map(col => col.label || col.key);
    const rows = this.filteredData.map(row => 
      this.options.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [
      headers.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  close() {
    if (this.options.onClose) {
      this.options.onClose();
    }
    this.container.innerHTML = '';
  }

  destroy() {
    this.close();
  }
}

