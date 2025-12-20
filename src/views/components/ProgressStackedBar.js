/**
 * Progress Stacked Bar Component
 * Process Pipeline - Chart.js Stacked Bar Chart
 * Labels: Ders | Seminer | Yeterlik | Tez
 * Dataset 1 (Normal): blue-200 - "Normal Süreç"
 * Dataset 2 (Critical): red-500 - "Darboğaz/Riskli" (especially Seminer bottleneck)
 */

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export class ProgressStackedBar {
  constructor(container, data, onBarClick) {
    this.container = container;
    this.data = data || [];
    this.onBarClick = onBarClick || (() => {});
    this.chart = null;
    this.categoriesData = {};
    this.sortedRows = [];
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

    const chartData = this.prepareData();
    const ctx = canvas.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y',
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
              label: (context) => {
                const datasetLabel = context.dataset.label || '';
                const value = context.parsed.x;
                const dataIndex = context.dataIndex;
                const normalValue = chartData.datasets[0].data[dataIndex];
                const uyariValue = chartData.datasets[1].data[dataIndex];
                const kritikValue = chartData.datasets[2].data[dataIndex];
                const total = normalValue + uyariValue + kritikValue;
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${datasetLabel}: ${value} öğrenci (${percentage}%)`;
              }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'right',
            color: 'white',
            font: {
              weight: 'bold',
              size: 11
            },
            formatter: (value, context) => {
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              // Son dataset üstünde toplamı yaz
              if (datasetIndex === 2) {
                const normalValue = chartData.datasets[0].data[dataIndex];
                const uyariValue = chartData.datasets[1].data[dataIndex];
                const kritikValue = chartData.datasets[2].data[dataIndex];
                const total = normalValue + uyariValue + kritikValue;
                return total > 0 ? total : '';
              }
              return '';
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Öğrenci Sayısı',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Aşama',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            // Gerçek aşama kodunu al (label değil)
            const realAsama = this.sortedRows[index]?.asama || '';
            const risk_group =
              datasetIndex === 2 ? 'kritik' :
              datasetIndex === 1 ? 'uyari' :
              'normal';

            if (this.onBarClick) {
              this.onBarClick({ asama: realAsama, risk_group });
            }
          }
        }
      }
    });
  }

  prepareData() {
    // Beklenen data formatı (backend /dashboard/surec-hatti):
    // [{ asama: 'Ders', normal: n, uyari: n, kritik: n, toplam: n }, ...]
    const rows = Array.isArray(this.data) ? this.data : [];
    
    // Aşama isimlerini okunabilir hale getir
    const asamaMap = {
      'Ders': 'Ders Aşaması',
      'Yeterlik': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'TIK': 'TİK (Tez İzleme Komitesi)',
      'Tez': 'Tez Yazımı',
      'Tamamlandi': 'Tamamlandı'
    };
    
    // Aşamaları sıralı göster (akademik akışa göre)
    const asamaOrder = ['Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi'];
    this.sortedRows = [...rows].sort((a, b) => {
      const aIndex = asamaOrder.indexOf(a.asama) !== -1 ? asamaOrder.indexOf(a.asama) : 999;
      const bIndex = asamaOrder.indexOf(b.asama) !== -1 ? asamaOrder.indexOf(b.asama) : 999;
      return aIndex - bIndex;
    });
    
    const labels = this.sortedRows.map(r => asamaMap[r.asama] || r.asama);

    const normalData = this.sortedRows.map(r => r.normal || 0);
    const uyariData = this.sortedRows.map(r => r.uyari || 0);
    const kritikData = this.sortedRows.map(r => r.kritik || 0);

    this.categoriesData = {};
    this.sortedRows.forEach(r => {
      this.categoriesData[r.asama] = { ...r };
    });

    return {
      labels,
      datasets: [
        {
          label: 'Normal (0-49)',
          data: normalData,
          backgroundColor: 'rgba(59, 130, 246, 0.85)', // blue-500
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
          borderRadius: { bottomLeft: 8, topLeft: 8 }
        },
        {
          label: 'Uyarı (50-69)',
          data: uyariData,
          backgroundColor: 'rgba(96, 165, 250, 0.55)', // blue-400 soft
          borderColor: 'rgba(96, 165, 250, 1)',
          borderWidth: 1
        },
        {
          label: 'Kritik (70+)',
          data: kritikData,
          backgroundColor: 'rgba(239, 68, 68, 0.85)', // red-500
          borderColor: 'rgba(220, 38, 38, 1)',
          borderWidth: 2,
          borderRadius: { bottomRight: 8, topRight: 8 }
        }
      ]
    };
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

