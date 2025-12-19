/**
 * Risk Skoru Grafik Component
 * Risk skoru dağılım grafiği (Chart.js)
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export class RiskSkoruGrafik {
  constructor(container, riskDagilimi) {
    this.container = container;
    this.riskDagilimi = riskDagilimi;
    this.chart = null;
    this.render();
  }

  render() {
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Düşük (0-30)', 'Orta (31-50)', 'Yüksek (51-70)', 'Kritik (71-100)'],
        datasets: [{
          data: [
            this.riskDagilimi.dusuk || 0,
            this.riskDagilimi.orta || 0,
            this.riskDagilimi.yuksek || 0,
            this.riskDagilimi.kritik || 0
          ],
          backgroundColor: [
            '#10b981', // Düşük - Yeşil
            '#f59e0b', // Orta - Sarı
            '#f97316', // Yüksek - Turuncu
            '#ef4444'  // Kritik - Kırmızı
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const labels = ['Düşük', 'Orta', 'Yüksek', 'Kritik'];
            // Drill-down: Risk seviyesine göre öğrenci listesi göster
            window.location.hash = `/ogrenci?risk_seviyesi=${labels[index]}`;
          }
        }
      }
    });
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.container.innerHTML = '';
  }
}

