/**
 * Gantt Chart Component
 * Mezuniyet tahmin modeli - Timeline görselleştirmesi
 * Öğrencinin mezuniyet olasılığı ve tahmini mezuniyet tarihi
 */

export class GanttChart {
  constructor(container, data, onBarClick) {
    this.container = container;
    this.data = data || [];
    this.onBarClick = onBarClick || (() => {});
    this.render();
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Gantt chart için timeline görselleştirmesi
    this.renderTimeline(this.data);
  }

  renderTimeline(data) {
    // Her öğrenci için timeline bar
    let html = `
      <div class="space-y-4">
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-slate-700 mb-2">Mezuniyet Tahminleri</h4>
          <p class="text-xs text-slate-500">Öğrencilerin tahmini mezuniyet tarihleri ve olasılıkları</p>
        </div>
        
        <div class="space-y-3">
          ${data.map((item, index) => {
            const { ogrenci_id, ad, soyad, tahmini_mezuniyet_tarihi, mezuniyet_olasiligi, mevcut_yariyil } = item;
            
            // Timeline bar genişliği (olasılığa göre)
            const barWidth = mezuniyet_olasiligi || 0;
            const barColor = this.getProbabilityColor(mezuniyet_olasiligi);
            
            return `
              <div 
                class="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onclick="window.ganttChart?.onBarClick('${ogrenci_id}')"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">${ad} ${soyad}</p>
                    <p class="text-xs text-slate-500">Mevcut Yarıyıl: ${mevcut_yariyil}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold ${this.getProbabilityTextColor(mezuniyet_olasiligi)}">
                      %${mezuniyet_olasiligi || 0}
                    </p>
                    <p class="text-xs text-slate-500">
                      ${tahmini_mezuniyet_tarihi ? new Date(tahmini_mezuniyet_tarihi).toLocaleDateString('tr-TR') : 'Hesaplanıyor...'}
                    </p>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    class="h-3 rounded-full transition-all ${barColor}"
                    style="width: ${barWidth}%"
                  ></div>
                </div>
                
                <!-- Olasılık Açıklaması -->
                <div class="mt-2 text-xs text-slate-600">
                  ${this.getProbabilityDescription(mezuniyet_olasiligi)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Global erişim için
    window.ganttChart = this;
  }

  getProbabilityColor(olasilik) {
    if (olasilik >= 70) return 'bg-green-600';
    if (olasilik >= 50) return 'bg-yellow-500';
    if (olasilik >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getProbabilityTextColor(olasilik) {
    if (olasilik >= 70) return 'text-green-600';
    if (olasilik >= 50) return 'text-yellow-600';
    if (olasilik >= 30) return 'text-orange-600';
    return 'text-red-600';
  }

  getProbabilityDescription(olasilik) {
    if (olasilik >= 70) {
      return 'Yüksek olasılıkla mezun olacak';
    } else if (olasilik >= 50) {
      return 'Orta olasılıkla mezun olacak, dikkatli takip gerekli';
    } else if (olasilik >= 30) {
      return 'Düşük olasılık, müdahale önerilir';
    } else {
      return 'Çok düşük olasılık, acil müdahale gerekli';
    }
  }

  onBarClick(ogrenciId) {
    if (this.onBarClick) {
      this.onBarClick(ogrenciId);
    }
  }

  destroy() {
    window.ganttChart = null;
  }
}

