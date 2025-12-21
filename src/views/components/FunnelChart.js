/**
 * Funnel Chart Component
 * Süreç Hattı - Akademik Aşamalar Hunisi
 * Öğrencilerin akademik süreçteki dağılımını ve darboğazları görselleştirir
 */

import { Chart, registerables } from 'chart.js';
 
Chart.register(...registerables);

export class FunnelChart {
  constructor(container, data, onStageClick) {
    this.container = container;
    this.data = data || [];
    this.onStageClick = onStageClick || (() => {});
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
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
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
              },
              footer: (items) => {
                const dataIndex = items[0].dataIndex;
                const normalValue = chartData.datasets[0].data[dataIndex];
                const uyariValue = chartData.datasets[1].data[dataIndex];
                const kritikValue = chartData.datasets[2].data[dataIndex];
                const total = normalValue + uyariValue + kritikValue;
                return `Toplam: ${total} öğrenci`;
              }
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
              },
              color: '#64748b'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Akademik Aşama',
              font: {
                size: 12,
                weight: 'bold'
              },
              color: '#64748b'
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const realAsama = this.sortedRows[index]?.asama || '';
            const risk_group =
              datasetIndex === 2 ? 'kritik' :
              datasetIndex === 1 ? 'uyari' :
              'normal';

            if (this.onStageClick) {
              this.onStageClick({ asama: realAsama, risk_group });
            }
          }
        }
      }
    });
  }

  prepareData() {
    // Beklenen data formatı: [{ asama: 'Ders', normal: n, uyari: n, kritik: n, toplam: n }, ...]
    const rows = Array.isArray(this.data) ? this.data : [];
    
    // Aşama isimlerini okunabilir hale getir
    const asamaMap = {
      'Ders': 'Ders Aşaması',
      'Yeterlik': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'TIK': 'TİK (Tez İzleme)',
      'Tez': 'Tez Yazımı',
      'Tamamlandi': 'Mezuniyet'
    };
    
    // Aşamaları sıralı göster (akademik akışa göre - ters sırada huni için)
    const asamaOrder = ['Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi'];
    this.sortedRows = [...rows]
      .filter(r => r.toplam > 0) // Sadece öğrencisi olan aşamalar
      .sort((a, b) => {
        const aIndex = asamaOrder.indexOf(a.asama) !== -1 ? asamaOrder.indexOf(a.asama) : 999;
        const bIndex = asamaOrder.indexOf(b.asama) !== -1 ? asamaOrder.indexOf(b.asama) : 999;
        return aIndex - bIndex;
      });
    
    const labels = this.sortedRows.map(r => asamaMap[r.asama] || r.asama);

    const normalData = this.sortedRows.map(r => r.normal || 0);
    const uyariData = this.sortedRows.map(r => r.uyari || 0);
    const kritikData = this.sortedRows.map(r => r.kritik || 0);

    // Huni görünümü için bar genişliklerini ayarla (en üstte geniş, altta dar)
    const maxTotal = Math.max(...this.sortedRows.map(r => r.toplam || 0), 1);
    const barWidths = this.sortedRows.map((r, index) => {
      const total = r.toplam || 0;
      // Huni efekti: İlk aşamada %100, son aşamada %60 genişlik
      const widthRatio = 1 - (index / this.sortedRows.length) * 0.4;
      return total * widthRatio;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Normal (0-49)',
          data: normalData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // green-500
          borderColor: 'rgba(22, 163, 74, 1)',
          borderWidth: 2,
          borderRadius: { topLeft: 8, bottomLeft: 8 }
        },
        {
          label: 'Uyarı (50-69)',
          data: uyariData,
          backgroundColor: 'rgba(251, 191, 36, 0.8)', // amber-500
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 2
        },
        {
          label: 'Kritik (70+)',
          data: kritikData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
          borderColor: 'rgba(220, 38, 38, 1)',
          borderWidth: 2,
          borderRadius: { topRight: 8, bottomRight: 8 }
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

