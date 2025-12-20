/**
 * Risk Donut Component
 * Risk Dağılımı - Chart.js Doughnut Chart
 * Ortada toplam öğrenci sayısı, tıklanabilir dilimler
 */

import { Chart, registerables } from 'chart.js';
import formatters from '../../utils/formatters.js';

Chart.register(...registerables);

export class RiskDonut {
  constructor(container, riskData, onSliceClick) {
    this.container = container;
    this.riskData = riskData || {};
    this.onSliceClick = onSliceClick || (() => {});
    this.chart = null;
    this.summaryContainer = null;
    this.render();
  }

  render() {
    const { dusuk = 0, orta = 0, yuksek = 0, kritik = 0 } = this.riskData;
    const total = dusuk + orta + yuksek + kritik;

    if (total === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Summary container'ı bul
    this.summaryContainer = document.getElementById('risk-donut-summary');

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Dinamik özet hesapla
    const kritikYuzde = total > 0 ? ((kritik / total) * 100).toFixed(1) : '0.0';
    const yuksekYuzde = total > 0 ? ((yuksek / total) * 100).toFixed(1) : '0.0';
    
    if (this.summaryContainer) {
      let summaryParts = [];
      if (parseFloat(kritikYuzde) > 0) {
        summaryParts.push(`<span class="text-red-600 font-semibold">%${kritikYuzde}</span> kritik`);
      }
      if (parseFloat(yuksekYuzde) > 0) {
        summaryParts.push(`<span class="text-orange-600 font-semibold">%${yuksekYuzde}</span> yüksek risk`);
      }
      if (summaryParts.length === 0) {
        summaryParts.push('<span class="text-emerald-600 font-semibold">Risk seviyesi düşük</span>');
      }
      this.summaryContainer.innerHTML = `<div class="text-sm text-slate-600 leading-relaxed">Öğrencilerin ${summaryParts.join(' ve ')} seviyesinde</div>`;
    }

    // Chart oluştur
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Düşük Risk (0-29)', 'Orta Risk (30-49)', 'Yüksek Risk (50-69)', 'Kritik Risk (70-100)'],
        datasets: [{
          data: [dusuk, orta, yuksek, kritik],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)', // emerald-500 - Düşük
            'rgba(234, 179, 8, 0.8)',  // yellow-500 - Orta
            'rgba(249, 115, 22, 0.8)', // orange-500 - Yüksek
            'rgba(239, 68, 68, 0.8)'   // red-500 - Kritik
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${formatters.formatNumber(value)} (${percentage}%)`;
              }
            }
          },
          // Ortada toplam sayı gösterimi
          datalabels: {
            display: false
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const index = element.index;
            
            // Risk seviyesini belirle
            let riskSeviyesi = '';
            let minRisk = 0;
            let maxRisk = 0;
            
            switch (index) {
              case 0: // Düşük
                riskSeviyesi = 'dusuk';
                minRisk = 0;
                maxRisk = 29;
                break;
              case 1: // Orta
                riskSeviyesi = 'orta';
                minRisk = 30;
                maxRisk = 49;
                break;
              case 2: // Yüksek
                riskSeviyesi = 'yuksek';
                minRisk = 50;
                maxRisk = 69;
                break;
              case 3: // Kritik
                riskSeviyesi = 'kritik';
                minRisk = 70;
                maxRisk = 100;
                break;
            }
            
            // Modal açma callback'ini çağır
            this.onSliceClick({ riskSeviyesi, minRisk, maxRisk, index });
          }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
          const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
          
          ctx.save();
          ctx.font = 'bold 24px Inter';
          ctx.fillStyle = '#1e293b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(formatters.formatNumber(total), centerX, centerY - 10);
          
          ctx.font = '12px Inter';
          ctx.fillStyle = '#64748b';
          ctx.fillText('Toplam Öğrenci', centerX, centerY + 15);
          ctx.restore();
        }
      }]
    });
  }

  updateData(newData) {
    this.riskData = newData || {};
    if (this.chart) {
      this.chart.destroy();
    }
    this.render();
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.container.innerHTML = '';
  }
}

