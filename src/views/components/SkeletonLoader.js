/**
 * Skeleton Loader Component - Tableau Style
 * Yükleme animasyonları için skeleton screens
 */

export class SkeletonLoader {
  constructor(container, type = 'default') {
    this.container = container;
    this.type = type;
    this.render();
  }

  render() {
    switch (this.type) {
      case 'kpi-card':
        this.renderKPICard();
        break;
      case 'table':
        this.renderTable();
        break;
      case 'chart':
        this.renderChart();
        break;
      case 'list':
        this.renderList();
        break;
      default:
        this.renderDefault();
    }
  }

  renderDefault() {
    this.container.innerHTML = `
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    `;
  }

  renderKPICard() {
    this.container.innerHTML = `
      <div class="card animate-pulse">
        <div class="card-body">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    `;
  }

  renderTable() {
    this.container.innerHTML = `
      <div class="card animate-pulse">
        <div class="card-body">
          <div class="space-y-3">
            ${Array(5).fill(0).map(() => `
              <div class="flex items-center gap-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderChart() {
    this.container.innerHTML = `
      <div class="card animate-pulse">
        <div class="card-body">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    `;
  }

  renderList() {
    this.container.innerHTML = `
      <div class="space-y-3 animate-pulse">
        ${Array(3).fill(0).map(() => `
          <div class="card">
            <div class="card-body">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

