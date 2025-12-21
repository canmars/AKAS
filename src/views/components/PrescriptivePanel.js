/**
 * Prescriptive Action Panel Component - Tableau Style
 * Otomatik öneriler, eylem butonları, öncelik gösterimi, toplu işlem desteği
 */

export class PrescriptivePanel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      insight: options.insight || '',
      recommendations: options.recommendations || [],
      onActionClick: options.onActionClick || null,
      ...options
    };
    this.render();
    this.attachEventListeners();
  }

  render() {
    if (!this.options.insight && this.options.recommendations.length === 0) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="card border-l-4 border-blue-500">
        ${this.options.insight ? `
          <div class="card-header bg-blue-50">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-sm font-semibold text-blue-900">İçgörü</h3>
            </div>
            <p class="text-sm text-blue-800 mt-1">${this.options.insight}</p>
          </div>
        ` : ''}
        
        <div class="card-body">
          ${this.options.recommendations.length > 0 ? `
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Önerilen Aksiyonlar</h4>
              ${this.options.recommendations.map((rec, index) => this.renderRecommendation(rec, index)).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderRecommendation(rec, index) {
    const priorityClass = this.getPriorityClass(rec.priority);
    const priorityLabel = this.getPriorityLabel(rec.priority);
    
    return `
      <div class="prescriptive-recommendation border border-gray-200 rounded-lg p-4 ${priorityClass}" data-rec-index="${index}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-${rec.priority || 'medium'}">${priorityLabel}</span>
              <h5 class="text-sm font-semibold text-gray-900">${rec.action}</h5>
            </div>
            ${rec.description ? `
              <p class="text-xs text-gray-600 mb-2">${rec.description}</p>
            ` : ''}
            ${rec.students && rec.students.length > 0 ? `
              <div class="text-xs text-gray-500 mb-2">
                <span class="font-medium">${rec.students.length} öğrenci:</span>
                ${rec.students.slice(0, 3).map(s => s.ad || s.name || 'Öğrenci').join(', ')}
                ${rec.students.length > 3 ? ` ve ${rec.students.length - 3} daha...` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            class="btn btn-primary btn-sm action-btn"
            data-rec-index="${index}"
            data-action-type="primary"
          >
            ${rec.actionButtonLabel || 'Aksiyon Al'}
          </button>
          ${rec.secondaryAction ? `
            <button 
              class="btn btn-outline btn-sm secondary-action-btn"
              data-rec-index="${index}"
              data-action-type="secondary"
            >
              ${rec.secondaryAction.label}
            </button>
          ` : ''}
          ${rec.students && rec.students.length > 1 ? `
            <button 
              class="btn btn-outline btn-sm bulk-action-btn"
              data-rec-index="${index}"
              data-action-type="bulk"
            >
              Toplu İşlem
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  getPriorityClass(priority) {
    const classMap = {
      'critical': 'border-l-4 border-red-500 bg-red-50',
      'high': 'border-l-4 border-orange-500 bg-orange-50',
      'medium': 'border-l-4 border-yellow-500 bg-yellow-50',
      'low': 'border-l-4 border-green-500 bg-green-50'
    };
    return classMap[priority?.toLowerCase()] || 'border-l-4 border-gray-300 bg-gray-50';
  }

  getPriorityLabel(priority) {
    const labelMap = {
      'critical': 'Kritik',
      'high': 'Yüksek',
      'medium': 'Orta',
      'low': 'Düşük'
    };
    return labelMap[priority?.toLowerCase()] || 'Orta';
  }

  attachEventListeners() {
    // Primary action buttons
    const actionBtns = this.container.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.recIndex);
        const recommendation = this.options.recommendations[index];
        if (this.options.onActionClick) {
          this.options.onActionClick(recommendation, 'primary');
        }
        if (recommendation.onClick) {
          recommendation.onClick(recommendation);
        }
      });
    });

    // Secondary action buttons
    const secondaryBtns = this.container.querySelectorAll('.secondary-action-btn');
    secondaryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.recIndex);
        const recommendation = this.options.recommendations[index];
        if (recommendation.secondaryAction && recommendation.secondaryAction.onClick) {
          recommendation.secondaryAction.onClick(recommendation);
        }
      });
    });

    // Bulk action buttons
    const bulkBtns = this.container.querySelectorAll('.bulk-action-btn');
    bulkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.recIndex);
        const recommendation = this.options.recommendations[index];
        if (recommendation.bulkAction && recommendation.bulkAction.onClick) {
          recommendation.bulkAction.onClick(recommendation);
        }
      });
    });
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

