/**
 * Capacity Bars Component
 * Danışman Doluluk Oranları - Progress Bar'lar
 * Tailwind CSS ile modern tasarım
 */

import formatters from '../../utils/formatters.js';

export class CapacityBars {
  constructor(container, capacityData = []) {
    this.container = container;
    this.capacityData = capacityData;
    this.render();
  }

  render() {
    if (!this.capacityData || this.capacityData.length === 0) {
      this.container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Danışman Doluluk Oranları</h2>
          <p class="text-slate-500 text-center py-8">Veri bulunmuyor</p>
        </div>
      `;
      return;
    }

    // İlk 10 danışmanı göster
    const topCapacity = this.capacityData.slice(0, 10);

    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">Danışman Doluluk Oranları</h2>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ${this.capacityData.length} Danışman
          </span>
        </div>
        
        <div class="space-y-4">
          ${topCapacity.map(personel => {
            const percentage = personel.kapasiteKullanimYuzdesi || 0;
            const progressColor = this.getProgressColor(percentage, personel.limit_asildi_mi, personel.uyari_seviyesi_mi);
            const statusBadge = this.getStatusBadge(personel.limit_asildi_mi, personel.uyari_seviyesi_mi);
            
            return `
              <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                      <h3 class="font-semibold text-slate-900 truncate">
                        ${personel.unvan || ''} ${personel.ad || ''} ${personel.soyad || ''}
                      </h3>
                      ${statusBadge}
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-slate-600">
                      <span>${formatters.formatNumber(personel.mevcut_yuk || 0)} / ${formatters.formatNumber(personel.maksimum_kapasite || 0)}</span>
                      <span class="text-slate-400">•</span>
                      <span>Kalan: ${formatters.formatNumber(personel.kalan_kapasite || 0)}</span>
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <div class="text-2xl font-bold ${this.getPercentageColor(percentage, personel.limit_asildi_mi)}">
                      ${percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div class="${progressColor} h-full rounded-full transition-all duration-500" 
                       style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Yumuşak Limit: ${formatters.formatNumber(personel.yumusak_limit || 0)}</span>
                  <span>Sert Limit: ${formatters.formatNumber(personel.sert_limit || personel.maksimum_kapasite || 0)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        ${this.capacityData.length > 10 ? `
          <div class="mt-4 text-center">
            <button onclick="window.location.hash = '#/danismanlar'" 
                    class="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Tümünü Gör (${this.capacityData.length} danışman) →
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  getProgressColor(percentage, limitAsildiMi, uyariSeviyesiMi) {
    if (limitAsildiMi) return 'bg-red-500';
    if (uyariSeviyesiMi) return 'bg-yellow-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPercentageColor(percentage, limitAsildiMi) {
    if (limitAsildiMi) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    if (percentage >= 60) return 'text-blue-600';
    return 'text-green-600';
  }

  getStatusBadge(limitAsildiMi, uyariSeviyesiMi) {
    if (limitAsildiMi) {
      return '<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">LİMİT AŞILDI</span>';
    }
    if (uyariSeviyesiMi) {
      return '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">UYARI</span>';
    }
    return '';
  }

  updateData(capacityData) {
    this.capacityData = capacityData;
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

