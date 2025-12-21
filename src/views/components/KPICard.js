/**
 * KPI Cards Component - Google Analytics Style
 * Minimal, clean, professional design
 */

import formatters from '../../utils/formatters.js';

export class KPICard {
  constructor(container, kpiData) {
    this.container = container;
    this.kpiData = kpiData || {};
    this.render();
  }

  render() {
    // Calculate KPI values
    const toplamRiskli = this.kpiData.toplamRiskli ?? 0;
    const akademikKopus = this.kpiData.hayaletOgrenci ?? 0;
    const kritikDarbogaz = this.kpiData.kritikDarbogaz ?? 0;
    const kapasiteAsimi = this.kpiData.kapasiteAlarmi ?? 0;
    const toplamOgrenci = this.kpiData.toplamOgrenci ?? 0;

    const kpis = [
      {
        title: 'Toplam Riskli',
        value: toplamRiskli,
        context: `Risk skoru ≥70 (${toplamOgrenci > 0 ? ((toplamRiskli / toplamOgrenci) * 100).toFixed(1) : 0}%)`,
        trend: null,
        color: '#ea4335' // Google red
      },
      {
        title: 'Hayalet Öğrenci',
        value: akademikKopus,
        context: '180+ gün giriş yok',
        trend: null,
        color: '#fbbc04' // Google yellow
      },
      {
        title: 'Kritik Darboğaz',
        value: kritikDarbogaz,
        context: '4. Yarıyıl Seminer',
        trend: null,
        color: '#ff9800' // Orange
      },
      {
        title: 'Kapasite Aşımı',
        value: kapasiteAsimi,
        context: 'Danışman limit aşıldı',
        trend: null,
        color: '#4285f4' // Google blue
      }
    ];

    // Google Analytics style - minimal, clean cards
    this.container.innerHTML = kpis.map(kpi => `
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-sm font-normal text-gray-500">${kpi.title}</h3>
            ${kpi.trend ? `
              <div class="flex items-center gap-1 text-xs ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M${kpi.trend > 0 ? '5.293' : '14.707'} ${kpi.trend > 0 ? '7.707' : '12.293'}a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4z" clip-rule="evenodd" />
                </svg>
                ${Math.abs(kpi.trend)}%
              </div>
            ` : ''}
          </div>
          <div class="flex items-baseline gap-2 mb-2">
            <div class="text-3xl font-normal text-gray-900" style="color: ${kpi.color}">
              ${formatters.formatNumber(kpi.value)}
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">${kpi.context}</p>
        </div>
      </div>
    `).join('');
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
