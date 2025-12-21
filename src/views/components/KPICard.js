/**
 * Smart KPI Cards Component
 * Enterprise-Grade Analytics Cockpit
 * Icon (Left, Rounded BG) + Title (Uppercase, Tracking-wide) + Value (Huge Bold) + Context (Small Footer)
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
    const toplamRiskli = this.kpiData.toplamRiskli ?? 0; // Risk skoru >= 70
    const akademikKopus = this.kpiData.hayaletOgrenci ?? 0; // Students > 180 days inactive
    const kritikDarbogaz = this.kpiData.kritikDarbogaz ?? 0; // ACİL_EYLEM count
    const kapasiteAsimi = this.kpiData.kapasiteAlarmi ?? 0; // Advisors over limit
    const toplamOgrenci = this.kpiData.toplamOgrenci ?? 0; // Total active students

    const kpis = [
      {
        title: 'TOPLAM RİSKLİ',
        value: toplamRiskli,
        context: `Risk skoru ≥70 (${toplamOgrenci > 0 ? ((toplamRiskli / toplamOgrenci) * 100).toFixed(1) : 0}%)`,
        icon: this.getAlertIcon(),
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        valueColor: 'text-red-600',
        borderColor: 'border-red-200'
      },
      {
        title: 'HAYALET ÖĞRENCİ',
        value: akademikKopus,
        context: '180+ gün giriş yok',
        icon: this.getUserXIcon(),
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
        valueColor: 'text-orange-600',
        borderColor: 'border-orange-200'
      },
      {
        title: 'KRİTİK DARBOĞAZ',
        value: kritikDarbogaz,
        context: '4. Yarıyıl Seminer',
        icon: this.getHourglassIcon(),
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        valueColor: 'text-amber-600',
        borderColor: 'border-amber-200'
      },
      {
        title: 'KAPASİTE AŞIMI',
        value: kapasiteAsimi,
        context: 'Danışman limit aşıldı',
        icon: this.getUsersIcon(),
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      }
    ];

    this.container.innerHTML = kpis.map(kpi => `
      <div class="bg-white rounded-xl border-2 ${kpi.borderColor} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div class="p-5">
          <div class="flex items-start gap-4">
            <div class="${kpi.iconBg} ${kpi.iconColor} rounded-lg p-3 flex-shrink-0">
              ${kpi.icon}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">${kpi.title}</h3>
              <div class="text-3xl font-bold ${kpi.valueColor} mb-1">${formatters.formatNumber(kpi.value)}</div>
              <p class="text-xs text-slate-600">${kpi.context}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getUserXIcon() {
    return `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    `;
  }

  getHourglassIcon() {
    return `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;
  }

  getUsersIcon() {
    return `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    `;
  }

  getAlertIcon() {
    return `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    `;
  }

  getSchoolIcon() {
    return `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
