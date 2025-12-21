/**
 * Actionable KPI Card Component - Tableau Style
 * Trafik ışığı renkleri, trend göstergesi, action button, drill-down özelliği
 */

import formatters from '../../utils/formatters.js';

export class ActionableKPICard {
  constructor(container, kpiData) {
    this.container = container;
    this.kpiData = kpiData || {};
    this.render();
    this.attachEventListeners();
  }

  render() {
    const {
      title,
      value,
      trend,
      trendLabel,
      color,
      actionButton,
      drillDown,
      icon
    } = this.kpiData;

    // Renk belirleme (trafik ışığı sistemi)
    const colorClass = this.getColorClass(color);
    const colorValue = this.getColorValue(color);
    
    // Trend yönü belirleme
    const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '';
    const trendColor = trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500';

    this.container.innerHTML = `
      <div class="card actionable-kpi-card" data-kpi-id="${this.kpiData.id || ''}">
        <div class="card-body">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-2">
              ${icon ? `<div class="text-gray-400">${icon}</div>` : ''}
              <h3 class="text-sm font-medium text-gray-500">${title}</h3>
            </div>
            ${trend !== undefined && trend !== null ? `
              <div class="flex items-center gap-1 text-xs ${trendColor}">
                <span>${trendIcon}</span>
                <span>${Math.abs(trend)}${trendLabel ? ` ${trendLabel}` : '%'}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="flex items-baseline gap-2 mb-3">
            <div class="text-4xl font-bold" style="color: ${colorValue}">
              ${formatters.formatNumber(value)}
            </div>
          </div>
          
          ${this.kpiData.context ? `
            <p class="text-xs text-gray-500 mb-4">${this.kpiData.context}</p>
          ` : ''}
          
          <div class="flex items-center gap-2 mt-4">
            ${actionButton ? `
              <button 
                class="btn btn-primary btn-sm actionable-btn"
                data-action="${actionButton.action || 'view'}"
                style="flex: 1;"
              >
                ${actionButton.label || 'Aksiyon Al'}
              </button>
            ` : ''}
            
            ${drillDown && drillDown.enabled ? `
              <button 
                class="drill-down-indicator drill-down-btn"
                data-drill-down="true"
                title="Detayları Gör"
              >
                Detay
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getColorClass(color) {
    const colorMap = {
      'critical': 'risk-critical',
      'high': 'risk-high',
      'medium': 'risk-medium',
      'low': 'risk-low',
      'red': 'risk-critical',
      'orange': 'risk-high',
      'yellow': 'risk-medium',
      'green': 'risk-low'
    };
    return colorMap[color?.toLowerCase()] || '';
  }

  getColorValue(color) {
    const colorMap = {
      'critical': '#EF4444',
      'high': '#F59E0B',
      'medium': '#EAB308',
      'low': '#10B981',
      'red': '#EF4444',
      'orange': '#F59E0B',
      'yellow': '#EAB308',
      'green': '#10B981'
    };
    return colorMap[color?.toLowerCase()] || '#3B82F6';
  }

  attachEventListeners() {
    // Action button event
    const actionBtn = this.container.querySelector('.actionable-btn');
    if (actionBtn && this.kpiData.actionButton) {
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.kpiData.actionButton.onClick) {
          this.kpiData.actionButton.onClick(this.kpiData);
        }
      });
    }

    // Drill-down event
    const drillDownBtn = this.container.querySelector('.drill-down-btn');
    if (drillDownBtn && this.kpiData.drillDown) {
      drillDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.kpiData.drillDown.onClick) {
          this.kpiData.drillDown.onClick(this.kpiData);
        }
      });
    }

    // Card click event (drill-down için)
    const card = this.container.querySelector('.actionable-kpi-card');
    if (card && this.kpiData.drillDown && this.kpiData.drillDown.enabled) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Butonlara tıklanmadıysa
        if (!e.target.closest('.actionable-btn') && !e.target.closest('.drill-down-btn')) {
          if (this.kpiData.drillDown.onClick) {
            this.kpiData.drillDown.onClick(this.kpiData);
          }
        }
      });
    }
  }

  update(data) {
    this.kpiData = { ...this.kpiData, ...data };
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

