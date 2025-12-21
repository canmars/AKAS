/**
 * Performans Raporları Page
 * Danışman, program ve dönem bazlı performans raporları
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';
import Chart from 'chart.js/auto';

export class PerformansRaporlariPage {
  constructor(container) {
    this.container = container;
    this.charts = {};
    this.filters = {
      akademik_yil: new Date().getFullYear(),
      danisman_id: null,
      program_turu_id: null
    };
  }

  async init() {
    this.showLoading();
    try {
      await this.loadData();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Performans raporları yükleme hatası:', error);
      this.showError('Performans raporları yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [danismanRapor, programRapor, donemRapor, riskSkorlari] = await Promise.all([
      ApiService.getDanismanPerformansRaporu({ akademik_yil: this.filters.akademik_yil }),
      ApiService.getProgramPerformansRaporu({ akademik_yil: this.filters.akademik_yil }),
      ApiService.getDonemBazliPerformans({ akademik_yil: this.filters.akademik_yil }),
      ApiService.getRiskYonetimiSkorlari()
    ]);

    this.data = {
      danismanRapor: danismanRapor.data || [],
      programRapor: programRapor.data || [],
      donemRapor: donemRapor.data || [],
      riskSkorlari: riskSkorlari.data || []
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Sayfa Başlığı -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Performans Raporları</h1>
            <p class="text-sm text-slate-600 mt-1">Danışman, program ve dönem bazlı performans metrikleri</p>
          </div>
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
        </div>

        <!-- Filtreler -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Akademik Yıl</label>
              <input 
                type="number" 
                id="filter-akademik-yil" 
                value="${this.filters.akademik_yil}"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="flex items-end">
              <button 
                id="filter-apply-btn"
                class="w-full btn btn-primary"
              >
                Filtrele
              </button>
            </div>
          </div>
        </div>

        <!-- Danışman Performans Raporu -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Danışman Performans Raporu</h3>
                <p class="text-xs text-slate-600">Yıllık karşılaştırma ve trend analizi</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Mezuniyet Oranları Trendi</h4>
              <canvas id="danisman-trend-chart" style="height: 300px;"></canvas>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Danışman Performans Tablosu</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Danışman</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Mezun Sayısı</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Ort. Mezuniyet Süresi (Ay)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Başarı Oranı (%)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Ort. Risk Skoru</th>
                    </tr>
                  </thead>
                  <tbody id="danisman-tablo-body" class="bg-white divide-y divide-slate-200">
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Program Performans Raporu -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Program Performans Raporu</h3>
                <p class="text-xs text-slate-600">Program bazlı mezuniyet oranları ve başarı metrikleri</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Program Bazlı Mezuniyet Oranları</h4>
              <canvas id="program-mezuniyet-chart" style="height: 300px;"></canvas>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Program Performans Tablosu</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Program</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Toplam Öğrenci</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Mezun Sayısı</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Mezuniyet Oranı (%)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Ortalama Not</th>
                    </tr>
                  </thead>
                  <tbody id="program-tablo-body" class="bg-white divide-y divide-slate-200">
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Dönem Bazlı Performans -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Dönem Bazlı Performans</h3>
                <p class="text-xs text-slate-600">Akademik takvim entegrasyonu ile dönem bazlı analiz</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Dönem Bazlı Öğrenci Sayıları ve Ortalama Not</h4>
              <canvas id="donem-performans-chart" style="height: 300px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Risk Yönetimi Skorları -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Risk Yönetimi Skorları</h3>
                <p class="text-xs text-slate-600">Danışman bazlı risk yönetimi performansı</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Risk Yönetimi Skorları</h4>
              <canvas id="risk-yonetimi-chart" style="height: 300px;"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderCharts();
    this.renderTables();
  }

  renderCharts() {
    // Danışman Trend Chart
    this.renderDanismanTrendChart();
    
    // Program Mezuniyet Chart
    this.renderProgramMezuniyetChart();
    
    // Dönem Performans Chart
    this.renderDonemPerformansChart();
    
    // Risk Yönetimi Chart
    this.renderRiskYonetimiChart();
  }

  renderDanismanTrendChart() {
    const ctx = document.getElementById('danisman-trend-chart');
    if (!ctx) return;

    // Yıl bazlı grupla
    const yilMap = {};
    this.data.danismanRapor.forEach(item => {
      const yil = item.akademik_yil;
      if (!yilMap[yil]) {
        yilMap[yil] = { count: 0, basariOraniToplam: 0 };
      }
      yilMap[yil].count++;
      yilMap[yil].basariOraniToplam += item.basari_orani || 0;
    });

    const labels = Object.keys(yilMap).sort();
    const data = labels.map(yil => {
      const item = yilMap[yil];
      return item.count > 0 ? item.basariOraniToplam / item.count : 0;
    });

    this.charts.danismanTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ortalama Başarı Oranı (%)',
          data: data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  renderProgramMezuniyetChart() {
    const ctx = document.getElementById('program-mezuniyet-chart');
    if (!ctx) return;

    const labels = this.data.programRapor.map(p => p.program_adi || p.program_kodu);
    const data = this.data.programRapor.map(p => p.mezuniyet_orani || 0);

    this.charts.programMezuniyet = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mezuniyet Oranı (%)',
          data: data,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  renderDonemPerformansChart() {
    const ctx = document.getElementById('donem-performans-chart');
    if (!ctx) return;

    const labels = this.data.donemRapor.map(d => `${d.akademik_yil} ${d.donem}`);
    const ogrenciSayisi = this.data.donemRapor.map(d => d.toplam_ogrenci || 0);
    const ortalamaNot = this.data.donemRapor.map(d => d.ortalama_not || 0);

    this.charts.donemPerformans = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Toplam Öğrenci',
            data: ogrenciSayisi,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            yAxisID: 'y'
          },
          {
            label: 'Ortalama Not',
            data: ortalamaNot,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 4,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  renderRiskYonetimiChart() {
    const ctx = document.getElementById('risk-yonetimi-chart');
    if (!ctx) return;

    // Danışman ID'lerini al (risk skorlarından)
    const danismanIds = [...new Set(this.data.riskSkorlari.map(r => r.danisman_id))];
    
    // Danışman bilgilerini al
    const danismanMap = {};
    this.data.danismanRapor.forEach(item => {
      if (item.akademik_personel) {
        danismanMap[item.danisman_id] = `${item.akademik_personel.ad} ${item.akademik_personel.soyad}`;
      }
    });

    const labels = danismanIds.map(id => danismanMap[id] || 'Bilinmeyen');
    const riskSkorlari = danismanIds.map(id => {
      const item = this.data.riskSkorlari.find(r => r.danisman_id === id);
      return item?.risk_yonetimi_skoru || 0;
    });

    this.charts.riskYonetimi = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Risk Yönetimi Skoru',
          data: riskSkorlari,
          backgroundColor: riskSkorlari.map(skor => {
            if (skor >= 80) return 'rgba(34, 197, 94, 0.5)';
            if (skor >= 60) return 'rgba(249, 115, 22, 0.5)';
            return 'rgba(239, 68, 68, 0.5)';
          }),
          borderColor: riskSkorlari.map(skor => {
            if (skor >= 80) return 'rgb(34, 197, 94)';
            if (skor >= 60) return 'rgb(249, 115, 22)';
            return 'rgb(239, 68, 68)';
          }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  renderTables() {
    // Danışman Tablosu
    const danismanTabloBody = document.getElementById('danisman-tablo-body');
    if (danismanTabloBody) {
      danismanTabloBody.innerHTML = this.data.danismanRapor.map(item => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 text-sm text-slate-900">
            ${item.akademik_personel?.ad || ''} ${item.akademik_personel?.soyad || ''}
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">${item.mezun_ettigi_ogrenci_sayisi || 0}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${(item.ortalama_mezuniyet_suresi_ay || 0).toFixed(1)}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${(item.basari_orani || 0).toFixed(1)}%</td>
          <td class="px-4 py-3 text-sm text-slate-600">${(item.ortalama_risk_skoru || 0).toFixed(1)}</td>
        </tr>
      `).join('');
    }

    // Program Tablosu
    const programTabloBody = document.getElementById('program-tablo-body');
    if (programTabloBody) {
      programTabloBody.innerHTML = this.data.programRapor.map(item => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 text-sm text-slate-900">${item.program_adi || item.program_kodu}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${item.toplam_ogrenci || 0}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${item.mezun_sayisi || 0}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${(item.mezuniyet_orani || 0).toFixed(1)}%</td>
          <td class="px-4 py-3 text-sm text-slate-600">${(item.ortalama_not || 0).toFixed(2)}</td>
        </tr>
      `).join('');
    }
  }

  setupEventListeners() {
    const filterBtn = document.getElementById('filter-apply-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        this.filters.akademik_yil = parseInt(document.getElementById('filter-akademik-yil')?.value || new Date().getFullYear());
        this.init();
      });
    }
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

