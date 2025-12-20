/**
 * Engagement Scatter Component
 * Interaction Matrix - Chart.js Scatter Plot
 * X-Axis: Days Since Last Login (0-365)
 * Y-Axis: Risk Score (0-100)
 * The "Death Line": Vertical red annotation at X=180 labeled "RİSK EŞİĞİ"
 * Points: RED (#ef4444) if X > 180, BLUE (#3b82f6) otherwise
 */

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export class EngagementScatter {
  constructor(container, data, onPointClick) {
    this.container = container;
    this.data = data || [];
    this.onPointClick = onPointClick || (() => {});
    this.chart = null;
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

    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Prepare datasets: RED for X > 180, BLUE for X <= 180
    const criticalData = [];
    const normalData = [];

    this.data.forEach(ogrenci => {
      const gunSayisi = ogrenci.gun_sayisi || 999;
      const riskSkoru = ogrenci.risk_skoru || 0;
      const xValue = gunSayisi === 999 ? 365 : Math.min(gunSayisi, 365);
      
      const point = {
        x: xValue,
        y: riskSkoru,
        ogrenci_id: ogrenci.ogrenci_id,
        ad: ogrenci.ad,
        soyad: ogrenci.soyad,
        gun_sayisi: gunSayisi,
        risk_skoru: riskSkoru,
        ogrenci: ogrenci
      };

      if (xValue > 180) {
        criticalData.push(point);
      } else {
        normalData.push(point);
      }
    });

    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Normal',
            data: normalData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Kritik',
            data: criticalData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
            pointRadius: 8,
            pointHoverRadius: 10
          }
        ]
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
            position: 'top'
          },
          tooltip: {
            callbacks: {
              title: () => '',
              label: (context) => {
                const point = context.raw;
                return `${point.ad || ''} ${point.soyad || ''}: ${point.gun_sayisi === 999 ? 'Hiç giriş yapmamış' : point.gun_sayisi + ' gün'}, Risk: ${point.risk_skoru}`;
              }
            }
          },
          annotation: {
            annotations: {
              deathLine: {
                type: 'line',
                xMin: 180,
                xMax: 180,
                yMin: 0,
                yMax: 100,
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 3,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: 'RİSK EŞİĞİ',
                  position: 'start',
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  font: {
                    weight: 'bold',
                    size: 12
                  },
                  padding: 6,
                  xAdjust: 10,
                  yAdjust: -20
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Son Girişten Bu Yana Geçen Gün',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            min: 0,
            max: 365,
            ticks: {
              stepSize: 60
            },
            grid: {
              color: (context) => {
                if (context.tick.value === 180) {
                  return 'rgba(239, 68, 68, 0.3)';
                }
                return 'rgba(0, 0, 0, 0.1)';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Risk Skoru',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const dataset = this.chart.data.datasets[datasetIndex];
            const point = dataset.data[index];
            
            if (point && point.ogrenci_id && this.onPointClick) {
              this.onPointClick([point.ogrenci], 'engagement', 'Etkileşim Matriksi');
            }
          }
        }
      }
    });
  }

  updateData(newData) {
    this.data = newData || [];
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

