/**
 * Akademik Takvim Page
 * Gantt chart, dönem bazlı analiz
 */

import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class AkademikTakvimPage {
  constructor(container) {
    this.container = container;
    this.charts = {};
    this.ganttChart = null;
  }

  async init() {
    this.showLoading();
    try {
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Akademik takvim yükleme hatası:', error);
      this.showError('Akademik takvim verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [takvim, aktifDonem, ogrenciSayilari, riskDagilimi] = await Promise.all([
      ApiService.getAkademikTakvim(),
      ApiService.getAktifDonem(),
      ApiService.getDonemBazliOgrenciSayilari(),
      ApiService.getDonemBazliRiskDagilimi()
    ]);

    this.data = {
      takvim: takvim.data || [],
      aktifDonem: aktifDonem.data || null,
      ogrenciSayilari: ogrenciSayilari.data || [],
      riskDagilimi: riskDagilimi.data || []
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Akademik Takvim Yönetimi</h1>
            <p class="text-sm text-slate-600 mt-1">Dönem zaman çizelgesi ve dönem bazlı analizler</p>
          </div>
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
        </div>

        ${this.data.aktifDonem ? `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-blue-900">
                Aktif Dönem: ${this.data.aktifDonem.akademik_yil} ${this.data.aktifDonem.donem} (${this.data.aktifDonem.yariyil_no}. Yarıyıl)
              </span>
            </div>
          </div>
        ` : ''}

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100">
            <h3 class="text-base font-semibold text-slate-900">Dönem Zaman Çizelgesi</h3>
          </div>
          <div class="p-5">
            <div id="gantt-chart-container" style="height: 400px;"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100">
              <h3 class="text-base font-semibold text-slate-900">Dönem Bazlı Öğrenci Sayıları</h3>
            </div>
            <div class="p-5">
              <canvas id="ogrenci-sayilari-chart" style="height: 300px;"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100">
              <h3 class="text-base font-semibold text-slate-900">Dönem Bazlı Risk Dağılımı</h3>
            </div>
            <div class="p-5">
              <canvas id="risk-dagilimi-chart" style="height: 300px;"></canvas>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100">
            <h3 class="text-base font-semibold text-slate-900">Dönem Detayları</h3>
          </div>
          <div class="p-5">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Akademik Yıl</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Dönem</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Başlangıç</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Bitiş</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Öğrenci Sayısı</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody id="donem-tablo-body" class="bg-white divide-y divide-slate-200">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderGanttChart();
    this.renderCharts();
    this.renderTable();
  }

  renderGanttChart() {
    const container = document.getElementById('gantt-chart-container');
    if (!container) return;

    // Basit timeline görselleştirmesi
    const sortedTakvim = [...this.data.takvim].sort((a, b) => 
      new Date(a.baslangic_tarihi) - new Date(b.baslangic_tarihi)
    );

    const minDate = new Date(Math.min(...sortedTakvim.map(d => new Date(d.baslangic_tarihi))));
    const maxDate = new Date(Math.max(...sortedTakvim.map(d => new Date(d.bitis_tarihi))));
    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    container.innerHTML = `
      <div class="space-y-3">
        ${sortedTakvim.map(donem => {
          const start = new Date(donem.baslangic_tarihi);
          const end = new Date(donem.bitis_tarihi);
          const startOffset = (start - minDate) / (1000 * 60 * 60 * 24);
          const duration = (end - start) / (1000 * 60 * 60 * 24);
          const leftPercent = (startOffset / totalDays) * 100;
          const widthPercent = (duration / totalDays) * 100;

          return `
            <div class="relative h-12">
              <div class="absolute top-0 left-0 right-0 h-full bg-slate-100 rounded"></div>
              <div 
                class="absolute h-full rounded ${donem.aktif_mi ? 'bg-blue-500' : 'bg-slate-400'}"
                style="left: ${leftPercent}%; width: ${widthPercent}%;"
              >
                <div class="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                  ${donem.akademik_yil} ${donem.donem}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderCharts() {
    // Öğrenci Sayıları Chart
    const ogrenciCtx = document.getElementById('ogrenci-sayilari-chart');
    if (ogrenciCtx) {
      const labels = this.data.ogrenciSayilari.map(d => `${d.akademik_yil} ${d.donem}`);
      const data = this.data.ogrenciSayilari.map(d => d.ogrenci_sayisi || 0);

      this.charts.ogrenciSayilari = new Chart(ogrenciCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Öğrenci Sayısı',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Risk Dağılımı Chart
    const riskCtx = document.getElementById('risk-dagilimi-chart');
    if (riskCtx) {
      const labels = this.data.riskDagilimi.map(d => `${d.akademik_yil}-${d.yariyil}`);
      const kritik = this.data.riskDagilimi.map(d => d.kritik_riskli || 0);
      const yuksek = this.data.riskDagilimi.map(d => d.yuksek_riskli || 0);
      const orta = this.data.riskDagilimi.map(d => d.orta_riskli || 0);
      const dusuk = this.data.riskDagilimi.map(d => d.dusuk_riskli || 0);

      this.charts.riskDagilimi = new Chart(riskCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Kritik', data: kritik, backgroundColor: 'rgba(239, 68, 68, 0.5)' },
            { label: 'Yüksek', data: yuksek, backgroundColor: 'rgba(249, 115, 22, 0.5)' },
            { label: 'Orta', data: orta, backgroundColor: 'rgba(251, 191, 36, 0.5)' },
            { label: 'Düşük', data: dusuk, backgroundColor: 'rgba(34, 197, 94, 0.5)' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          }
        }
      });
    }
  }

  renderTable() {
    const body = document.getElementById('donem-tablo-body');
    if (!body) return;

    body.innerHTML = this.data.takvim.map(donem => {
      const ogrenciSayisi = this.data.ogrenciSayilari.find(d => 
        d.akademik_yil === donem.akademik_yil && d.donem === donem.donem
      )?.ogrenci_sayisi || 0;

      return `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 text-sm text-slate-900">${donem.akademik_yil}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${donem.donem}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${new Date(donem.baslangic_tarihi).toLocaleDateString('tr-TR')}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${new Date(donem.bitis_tarihi).toLocaleDateString('tr-TR')}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${ogrenciSayisi}</td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${donem.aktif_mi ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
              ${donem.aktif_mi ? 'Aktif' : 'Pasif'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  showLoading() {
    if (this.container) {
      this.container.innerHTML = '<div class="flex items-center justify-center p-12"><div class="text-slate-600">Yükleniyor...</div></div>';
    }
  }

  hideLoading() {
    // Loading zaten render içinde yönetiliyor
  }

  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800">${message}</p>
          </div>
        </div>
      `;
    }
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

