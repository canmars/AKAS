/**
 * KPI Card Component
 * KPI kartları (4 ana metrik)
 */

import formatters from '../../utils/formatters.js';

export class KPICard {
  constructor(container, kpiData) {
    this.container = container;
    this.kpiData = kpiData;
    this.render();
  }

  render() {
    const kpis = [
      {
        title: 'Toplam Öğrenci',
        value: this.kpiData.toplamOgrenci,
        change: 'Aktif öğrenciler',
        className: 'dusuk'
      },
      {
        title: 'Kritik Risk',
        value: this.kpiData.kritikRisk,
        change: 'Risk skoru 70+',
        className: 'kritik'
      },
      {
        title: 'Yaklaşan TİK',
        value: this.kpiData.yaklasanTik,
        change: '1 ay içinde',
        className: this.kpiData.yaklasanTik > 0 ? 'yuksek' : 'dusuk'
      },
      {
        title: 'Hayalet Öğrenci',
        value: this.kpiData.hayaletOgrenci,
        change: '6+ ay login yok',
        className: this.kpiData.hayaletOgrenci > 0 ? 'kritik' : 'dusuk'
      }
    ];

    this.container.innerHTML = kpis.map(kpi => `
      <div class="kpi-card ${kpi.className}">
        <div class="kpi-card-title">${kpi.title}</div>
        <div class="kpi-card-value">${formatters.formatNumber(kpi.value)}</div>
        <div class="kpi-card-change">${kpi.change}</div>
      </div>
    `).join('');
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

