/**
 * Stratejik Analiz Page
 * Başarı trendi, danışman performansı, darboğaz analizi
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';
import Chart from 'chart.js/auto';

export class StratejikAnalizPage {
  constructor(container) {
    this.container = container;
    this.charts = {};
    this.filters = {
      akademik_yil: new Date().getFullYear(),
      yariyil: null,
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
      console.error('Stratejik analiz yükleme hatası:', error);
      this.showError('Stratejik analiz verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [basariTrendi, danismanPerformans, darbogaz, programBasari, kritikDarbogazlar] = await Promise.all([
      ApiService.getBasariTrendi(this.filters),
      ApiService.getDanismanPerformans({ akademik_yil: this.filters.akademik_yil }),
      ApiService.getSurecDarbogaz(this.filters),
      ApiService.getProgramBazliBasari({ akademik_yil: this.filters.akademik_yil }),
      ApiService.getKritikDarbogazlar()
    ]);

    this.data = {
      basariTrendi: basariTrendi.data || [],
      danismanPerformans: danismanPerformans.data || [],
      darbogaz: darbogaz.data || [],
      programBasari: programBasari.data || [],
      kritikDarbogazlar: kritikDarbogazlar.data || []
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Sayfa Başlığı -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Stratejik Analiz Merkezi</h1>
            <p class="text-sm text-slate-600 mt-1">Başarı trendi, performans metrikleri ve darboğaz analizleri</p>
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
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Yarıyıl</label>
              <select 
                id="filter-yariyil"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tümü</option>
                <option value="1">1. Yarıyıl</option>
                <option value="2">2. Yarıyıl</option>
              </select>
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

        <!-- Başarı Trendi Analizi -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Başarı Trendi Analizi</h3>
                <p class="text-xs text-slate-600">Dönem bazlı ortalama not ve ders tamamlama trendi</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-slate-700 mb-3">Ortalama Not Trendi</h4>
                <canvas id="basari-trend-line-chart" style="height: 300px;"></canvas>
              </div>
              <div>
                <h4 class="text-sm font-medium text-slate-700 mb-3">Tamamlanan Ders Sayısı</h4>
                <canvas id="basari-trend-bar-chart" style="height: 300px;"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Danışman Performans Karşılaştırması -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Danışman Performans Karşılaştırması</h3>
                <p class="text-xs text-slate-600">Mezuniyet oranları ve başarı metrikleri</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-slate-700 mb-3">Mezuniyet Oranları</h4>
                <canvas id="danisman-mezuniyet-chart" style="height: 300px;"></canvas>
              </div>
              <div>
                <h4 class="text-sm font-medium text-slate-700 mb-3">Ortalama Mezuniyet Süresi vs Başarı Oranı</h4>
                <canvas id="danisman-scatter-chart" style="height: 300px;"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Süreç Darboğaz Analizi -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Süreç Darboğaz Analizi</h3>
                <p class="text-xs text-slate-600">Aşama bazlı takılma analizi ve kritik darboğazlar</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-4">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Aşama Bazlı Takılan Öğrenci Sayıları</h4>
              <canvas id="darbogaz-waterfall-chart" style="height: 300px;"></canvas>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Kritik Darboğazlar</h4>
              <div id="kritik-darbogaz-list" class="space-y-2"></div>
            </div>
          </div>
        </div>

        <!-- Program Bazlı Başarı Karşılaştırması -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Program Bazlı Başarı Karşılaştırması</h3>
                <p class="text-xs text-slate-600">Program türlerine göre başarı metrikleri</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <canvas id="program-basari-chart" style="height: 300px;"></canvas>
          </div>
        </div>
      </div>
    `;

    this.renderCharts();
    this.renderKritikDarbogazlar();
  }

  renderCharts() {
    // Başarı Trendi - Line Chart
    this.renderBasariTrendLineChart();
    
    // Başarı Trendi - Bar Chart
    this.renderBasariTrendBarChart();
    
    // Danışman Mezuniyet Oranları
    this.renderDanismanMezuniyetChart();
    
    // Danışman Scatter Chart
    this.renderDanismanScatterChart();
    
    // Darboğaz Waterfall Chart
    this.renderDarbogazWaterfallChart();
    
    // Program Başarı Chart
    this.renderProgramBasariChart();
  }

  renderBasariTrendLineChart() {
    const ctx = document.getElementById('basari-trend-line-chart');
    if (!ctx) return;

    // Veriyi dönem bazlı grupla
    const trendMap = {};
    this.data.basariTrendi.forEach(item => {
      const key = `${item.akademik_yil}-${item.yariyil}`;
      if (!trendMap[key]) {
        trendMap[key] = { labels: [], data: [], count: 0, sum: 0 };
      }
      trendMap[key].count++;
      if (item.ortalama_not) {
        trendMap[key].sum += parseFloat(item.ortalama_not);
      }
    });

    const labels = Object.keys(trendMap).sort();
    const data = labels.map(key => {
      const item = trendMap[key];
      return item.count > 0 ? item.sum / item.count : 0;
    });

    this.charts.basariTrendLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ortalama Not',
          data: data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
            beginAtZero: false,
            min: 0,
            max: 4
          }
        }
      }
    });
  }

  renderBasariTrendBarChart() {
    const ctx = document.getElementById('basari-trend-bar-chart');
    if (!ctx) return;

    const trendMap = {};
    this.data.basariTrendi.forEach(item => {
      const key = `${item.akademik_yil}-${item.yariyil}`;
      if (!trendMap[key]) {
        trendMap[key] = { count: 0, sum: 0 };
      }
      trendMap[key].count++;
      trendMap[key].sum += item.tamamlanan_ders_sayisi || 0;
    });

    const labels = Object.keys(trendMap).sort();
    const data = labels.map(key => {
      const item = trendMap[key];
      return item.count > 0 ? item.sum / item.count : 0;
    });

    this.charts.basariTrendBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ortalama Tamamlanan Ders',
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
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
            beginAtZero: true
          }
        }
      }
    });
  }

  renderDanismanMezuniyetChart() {
    const ctx = document.getElementById('danisman-mezuniyet-chart');
    if (!ctx) return;

    const labels = this.data.danismanPerformans.map(d => 
      `${d.akademik_personel?.ad || ''} ${d.akademik_personel?.soyad || ''}`.trim() || 'Bilinmeyen'
    );
    const data = this.data.danismanPerformans.map(d => d.basari_orani || 0);

    this.charts.danismanMezuniyet = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Başarı Oranı (%)',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
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

  renderDanismanScatterChart() {
    const ctx = document.getElementById('danisman-scatter-chart');
    if (!ctx) return;

    const data = this.data.danismanPerformans.map(d => ({
      x: d.ortalama_mezuniyet_suresi_ay || 0,
      y: d.basari_orani || 0
    }));

    this.charts.danismanScatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Danışman Performansı',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)'
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
          x: {
            title: {
              display: true,
              text: 'Ortalama Mezuniyet Süresi (Ay)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Başarı Oranı (%)'
            }
          }
        }
      }
    });
  }

  renderDarbogazWaterfallChart() {
    const ctx = document.getElementById('darbogaz-waterfall-chart');
    if (!ctx) return;

    const labels = this.data.darbogaz.map(d => d.asama || 'Bilinmeyen');
    const data = this.data.darbogaz.map(d => d.takilan_ogrenci_sayisi || 0);

    this.charts.darbogazWaterfall = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Takılan Öğrenci Sayısı',
          data: data,
          backgroundColor: data.map((val, idx) => {
            const item = this.data.darbogaz[idx];
            if (item?.kritik_darbogaz_mi) return 'rgba(239, 68, 68, 0.8)';
            if (item?.darbogaz_seviyesi === 'Yuksek') return 'rgba(249, 115, 22, 0.8)';
            return 'rgba(59, 130, 246, 0.5)';
          }),
          borderColor: data.map((val, idx) => {
            const item = this.data.darbogaz[idx];
            if (item?.kritik_darbogaz_mi) return 'rgb(239, 68, 68)';
            if (item?.darbogaz_seviyesi === 'Yuksek') return 'rgb(249, 115, 22)';
            return 'rgb(59, 130, 246)';
          }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderProgramBasariChart() {
    const ctx = document.getElementById('program-basari-chart');
    if (!ctx) return;

    const labels = this.data.programBasari.map(p => p.program_adi || p.program_kodu);
    const ortalamaNot = this.data.programBasari.map(p => p.ortalama_not || 0);
    const ortalamaDers = this.data.programBasari.map(p => p.ortalama_ders_sayisi || 0);

    this.charts.programBasari = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ortalama Not',
            data: ortalamaNot,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            yAxisID: 'y'
          },
          {
            label: 'Ortalama Ders Sayısı',
            data: ortalamaDers,
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
            beginAtZero: true,
            max: 4
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  renderKritikDarbogazlar() {
    const container = document.getElementById('kritik-darbogaz-list');
    if (!container) return;

    if (this.data.kritikDarbogazlar.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-500">Kritik darboğaz bulunamadı.</p>';
      return;
    }

    container.innerHTML = this.data.kritikDarbogazlar.map(item => `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="font-medium text-red-900">${item.asama || 'Bilinmeyen Aşama'}</h5>
            <p class="text-sm text-red-700">
              ${item.program_turleri?.program_adi || 'Tüm Programlar'} - 
              ${item.takilan_ogrenci_sayisi || 0} öğrenci takılı
            </p>
            <p class="text-xs text-red-600 mt-1">
              Ortalama takılma süresi: ${item.ortalama_takilma_suresi_ay || 0} ay
            </p>
          </div>
          <div class="px-3 py-1 bg-red-200 rounded-full">
            <span class="text-xs font-semibold text-red-900">${item.darbogaz_seviyesi || 'Kritik'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    const filterBtn = document.getElementById('filter-apply-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        this.filters.akademik_yil = parseInt(document.getElementById('filter-akademik-yil')?.value || new Date().getFullYear());
        this.filters.yariyil = document.getElementById('filter-yariyil')?.value || null;
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
    // Chart'ları temizle
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

