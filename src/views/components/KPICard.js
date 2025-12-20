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
    const akademikKopus = this.kpiData.hayaletOgrenci ?? 0; // Students > 180 days inactive
    const kritikDarbogaz = this.kpiData.kritikDarbogaz ?? 0; // ACİL_EYLEM count
    const kapasiteAsimi = this.kpiData.kapasiteAlarmi ?? 0; // Advisors over limit
    const toplamOgrenci = this.kpiData.toplamOgrenci ?? 0; // Total active students

    const kpis = [
      {
        title: 'AKADEMİK KOPUŞ',
        value: akademikKopus,
        context: 'Acil Müdahale Gerekli',
        icon: this.getUserXIcon(),
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        valueColor: 'text-red-600'
      },
      {
        title: 'KRİTİK DARBOĞAZ',
        value: kritikDarbogaz,
        context: '4. Yarıyıl Alarmı',
        icon: this.getHourglassIcon(),
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        valueColor: 'text-amber-600'
      },
      {
        title: 'KAPASİTE AŞIMI',
        value: kapasiteAsimi,
        context: 'Danışman Limit Aşıldı',
        icon: this.getUsersIcon(),
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-600'
      },
      {
        title: 'TOPLAM ÖĞRENCİ',
        value: toplamOgrenci,
        context: 'Aktif Öğrenci Sayısı',
        icon: this.getSchoolIcon(),
        iconBg: 'bg-slate-50',
        iconColor: 'text-slate-600',
        valueColor: 'text-slate-900'
      }
    ];

    this.container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${kpis.map(kpi => `
          <div class="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(6,81,237,0.12)] border border-slate-100 transition-all duration-300 overflow-hidden">
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <div class="${kpi.iconBg} ${kpi.iconColor} rounded-lg p-3 flex-shrink-0">
                  ${kpi.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">${kpi.title}</h3>
                  <div class="text-3xl font-bold ${kpi.valueColor} mb-2">${formatters.formatNumber(kpi.value)}</div>
                  <p class="text-xs text-slate-500">${kpi.context}</p>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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
