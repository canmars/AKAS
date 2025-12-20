/**
 * Program Pie Component
 * Program Dağılımı - Chart.js Pie Chart
 * Mavi tonlarında, bağlam metinleri ile
 */

import { Chart, registerables } from 'chart.js';
import formatters from '../../utils/formatters.js';

Chart.register(...registerables);

// CDN'den yüklenen datalabels plugin'i otomatik olarak Chart.js'e eklenir
// Plugin CDN'den yüklendiğinde Chart.js tarafından otomatik olarak tanınır

export class ProgramPie {
  constructor(container, programData, onSliceClick) {
    this.container = container;
    this.programData = programData || {};
    this.onSliceClick = onSliceClick || (() => {});
    this.chart = null;
    this.summaryContainer = null;
    this.render();
  }

  render() {
    const isArray = Array.isArray(this.programData);
    const rows = isArray ? this.programData : null;

    const labels = isArray ? rows.map(r => r.program_adi) : Object.keys(this.programData);
    const values = isArray ? rows.map(r => r.ogrenci_sayisi) : Object.values(this.programData);
    const total = values.reduce((sum, val) => sum + val, 0);

    if (total === 0 || labels.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Summary container'ı bul
    this.summaryContainer = document.getElementById('program-pie-summary');

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Mavi tonları (blue-600, blue-400, indigo-500, blue-500, sky-500)
    const blueColors = [
      'rgba(37, 99, 235, 0.8)',  // blue-600
      'rgba(96, 165, 250, 0.8)', // blue-400
      'rgba(99, 102, 241, 0.8)', // indigo-500
      'rgba(59, 130, 246, 0.8)', // blue-500
      'rgba(14, 165, 233, 0.8)'  // sky-500
    ];

    const blueBorders = [
      'rgba(37, 99, 235, 1)',
      'rgba(96, 165, 250, 1)',
      'rgba(99, 102, 241, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(14, 165, 233, 1)'
    ];

    // En yüksek programı bul
    let maxIndex = 0;
    let maxValue = Number(values[0]) || 0;
    for (let i = 1; i < values.length; i++) {
      const val = Number(values[i]) || 0;
      if (val > maxValue) {
        maxValue = val;
        maxIndex = i;
      }
    }
    const maxProgram = labels[maxIndex] || 'Program';
    const maxPercentage = total > 0 && !isNaN(maxValue) && !isNaN(total) 
      ? ((maxValue / total) * 100).toFixed(1) 
      : '0.0';

    // Dinamik özet güncelle
    if (this.summaryContainer) {
      if (total > 0 && maxProgram && maxPercentage !== '0.0') {
        this.summaryContainer.innerHTML = `
          <div class="text-sm text-slate-700 font-medium">
            Akademik yükün <strong class="text-emerald-600">%${maxPercentage}</strong>'i <strong class="text-slate-900">${maxProgram}</strong> programında
          </div>
        `;
      } else {
        this.summaryContainer.innerHTML = `
          <div class="text-sm text-slate-500">
            Program dağılımı bilgisi mevcut değil
          </div>
        `;
      }
    }

    // Chart oluştur
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, index) => blueColors[index % blueColors.length]),
          borderColor: labels.map((_, index) => blueBorders[index % blueBorders.length]),
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
          datalabels: {
            display: true,
            color: 'white',
            font: {
              weight: 'bold',
              size: 11
            },
            formatter: (value) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
              return percentage > 5 ? `${percentage}%` : ''; // Sadece %5'ten büyükse göster
            }
          }
        }
        ,
        onClick: (event, elements) => {
          if (!elements || elements.length === 0) return;
          const index = elements[0].index;

          if (Array.isArray(this.programData)) {
            const row = this.programData[index];
            if (!row) return;
            this.onSliceClick({
              program_turu_id: row.program_turu_id,
              program_adi: row.program_adi,
              ogrenci_sayisi: row.ogrenci_sayisi,
              index
            });
          }
        }
      }
    });
  }

  updateData(newData) {
    this.programData = newData || {};
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

