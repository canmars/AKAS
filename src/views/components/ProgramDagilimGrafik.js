/**
 * Program Dağılım Grafik Component
 * Program bazında öğrenci dağılım grafiği (Chart.js)
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export class ProgramDagilimGrafik {
  constructor(container, programDagilimi) {
    this.container = container;
    this.programDagilimi = programDagilimi;
    this.chart = null;
    this.render();
  }

  render() {
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const labels = Object.keys(this.programDagilimi);
    const data = Object.values(this.programDagilimi);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Öğrenci Sayısı',
          data: data,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Öğrenci Sayısı: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const programAdi = labels[index];
            // Drill-down: Program türüne göre öğrenci listesi göster
            window.location.hash = `/ogrenci?program_turu=${encodeURIComponent(programAdi)}`;
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

