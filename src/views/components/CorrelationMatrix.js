/**
 * Correlation Matrix Component
 * Risk faktörleri arası korelasyon analizi - Chart.js Heatmap
 */

import { Chart, registerables } from 'chart.js';
import { Chart as ChartJS } from 'chart.js/auto';

Chart.register(...registerables);

export class CorrelationMatrix {
  constructor(container, data, onCellClick) {
    this.container = container;
    this.data = data || {};
    this.onCellClick = onCellClick || (() => {});
    this.chart = null;
    this.render();
  }

  render() {
    if (!this.data || Object.keys(this.data).length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Korelasyon matrisini hazırla
    const { labels, matrix } = this.prepareCorrelationData(this.data);

    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Heatmap için özel bir görselleştirme (Chart.js'de doğrudan heatmap yok, bar chart ile simüle ediyoruz)
    // Alternatif: D3.js kullanılabilir, şimdilik basit bir tablo görünümü
    this.renderAsTable(labels, matrix);
  }

  prepareCorrelationData(rawData) {
    // Risk faktörleri
    const labels = [
      'TS Sayısı',
      'Son Login Gün',
      'Mevcut Yarıyıl',
      'Risk Skoru',
      'Hayalet Öğrenci',
      'Seminer Durumu'
    ];

    // Korelasyon matrisi (örnek veri - gerçek implementasyonda hesaplanacak)
    const matrix = [
      [1.0, 0.3, 0.5, 0.7, 0.2, 0.4], // TS Sayısı
      [0.3, 1.0, 0.1, 0.6, 0.8, 0.2], // Son Login Gün
      [0.5, 0.1, 1.0, 0.4, 0.1, 0.3], // Mevcut Yarıyıl
      [0.7, 0.6, 0.4, 1.0, 0.5, 0.6], // Risk Skoru
      [0.2, 0.8, 0.1, 0.5, 1.0, 0.1], // Hayalet Öğrenci
      [0.4, 0.2, 0.3, 0.6, 0.1, 1.0]  // Seminer Durumu
    ];

    return { labels, matrix };
  }

  renderAsTable(labels, matrix) {
    // HTML tablo olarak render et (heatmap görünümü)
    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th class="border border-slate-200 p-3 bg-gradient-to-r from-slate-100 to-slate-50 text-left text-xs font-bold text-slate-700"></th>
              ${labels.map(label => `
                <th class="border border-slate-200 p-3 bg-gradient-to-r from-slate-100 to-slate-50 text-center text-xs font-bold text-slate-700">${label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    matrix.forEach((row, i) => {
      html += `
        <tr>
          <td class="border border-slate-200 p-3 bg-slate-50 text-xs font-bold text-slate-700 sticky left-0 z-10">${labels[i]}</td>
          ${row.map((value, j) => {
            const korelasyon = Math.abs(value);
            const renk = this.getCorrelationColor(korelasyon);
            const textColor = korelasyon > 0.5 ? 'text-white' : 'text-slate-900';
            const isDiagonal = i === j;
            
            return `
              <td 
                class="border border-slate-200 p-3 text-center text-xs font-semibold ${textColor} cursor-pointer hover:opacity-90 hover:scale-105 transition-all ${isDiagonal ? 'font-bold' : ''}"
                style="background-color: ${renk}"
                onclick="window.correlationMatrix?.onCellClick(${i}, ${j}, ${value})"
                title="${labels[i]} ↔ ${labels[j]}: ${value.toFixed(3)}"
              >
                ${value.toFixed(2)}
              </td>
            `;
          }).join('')}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: rgba(241, 245, 249, 1)"></div>
            <span>Düşük (0-0.3)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: rgba(59, 130, 246, 0.6)"></div>
            <span>Orta (0.3-0.7)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: rgba(37, 99, 235, 0.9)"></div>
            <span>Yüksek (0.7-1.0)</span>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Global erişim için
    window.correlationMatrix = this;
  }

  getCorrelationColor(value) {
    // Korelasyon değerine göre renk (0 = beyaz, 1 = koyu mavi/kırmızı)
    const absValue = Math.abs(value);
    
    if (absValue < 0.3) {
      return 'rgba(241, 245, 249, 1)'; // slate-100
    } else if (absValue < 0.5) {
      return 'rgba(59, 130, 246, 0.3)'; // blue-500 opacity
    } else if (absValue < 0.7) {
      return 'rgba(59, 130, 246, 0.6)'; // blue-500 opacity
    } else {
      return 'rgba(37, 99, 235, 0.9)'; // blue-600
    }
  }

  onCellClick(rowIndex, colIndex, value) {
    if (this.onCellClick) {
      this.onCellClick({
        rowLabel: this.prepareCorrelationData(this.data).labels[rowIndex],
        colLabel: this.prepareCorrelationData(this.data).labels[colIndex],
        korelasyon: value
      });
    }
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    window.correlationMatrix = null;
  }
}

