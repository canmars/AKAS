/**
 * Risk Distribution Component
 * Risk Skoru Dağılımı Görselleştirmesi
 * Tailwind CSS ile modern tasarım
 */

import formatters from '../../utils/formatters.js';

export class RiskDistribution {
  constructor(container, riskData = {}) {
    this.container = container;
    this.riskData = riskData;
    this.render();
  }

  render() {
    const { dusuk = 0, orta = 0, yuksek = 0, kritik = 0 } = this.riskData;
    const total = dusuk + orta + yuksek + kritik;

    if (total === 0) {
      this.container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Risk Skoru Dağılımı</h2>
          <p class="text-slate-500 text-center py-8">Veri bulunmuyor</p>
        </div>
      `;
      return;
    }

    const categories = [
      {
        label: 'Düşük Risk',
        value: dusuk,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        percentage: total > 0 ? ((dusuk / total) * 100).toFixed(1) : 0,
        range: '0-30'
      },
      {
        label: 'Orta Risk',
        value: orta,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        percentage: total > 0 ? ((orta / total) * 100).toFixed(1) : 0,
        range: '31-50'
      },
      {
        label: 'Yüksek Risk',
        value: yuksek,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        percentage: total > 0 ? ((yuksek / total) * 100).toFixed(1) : 0,
        range: '51-70'
      },
      {
        label: 'Kritik Risk',
        value: kritik,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        percentage: total > 0 ? ((kritik / total) * 100).toFixed(1) : 0,
        range: '71-100'
      }
    ];

    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Risk Skoru Dağılımı</h2>
        
        <div class="space-y-4">
          ${categories.map(category => `
            <div class="border ${category.borderColor} rounded-lg p-4 ${category.bgColor}">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 ${category.color} rounded"></div>
                  <span class="font-semibold text-slate-900">${category.label}</span>
                  <span class="text-sm text-slate-500">(${category.range})</span>
                </div>
                <div class="text-right">
                  <span class="text-lg font-bold ${category.textColor}">${formatters.formatNumber(category.value)}</span>
                  <span class="text-sm text-slate-500 ml-2">${category.percentage}%</span>
                </div>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div class="${category.color} h-full rounded-full transition-all duration-500" 
                     style="width: ${category.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="mt-6 pt-6 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-600">Toplam Öğrenci</span>
            <span class="text-2xl font-bold text-slate-900">${formatters.formatNumber(total)}</span>
          </div>
        </div>
      </div>
    `;
  }

  updateData(riskData) {
    this.riskData = riskData;
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

