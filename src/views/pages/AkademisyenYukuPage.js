/**
 * Akademisyen Yükü Page - Healthcare Dashboard Style
 * Danışman yük analizi ve kapasite yönetimi
 */

import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class AkademisyenYukuPage {
  constructor(container) {
    this.container = container;
    this.data = null;
    this.charts = {};
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Akademisyen yükü yükleme hatası:', error);
      this.showError('Akademisyen yükü verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [danismanYukResponse, unvanDagilimiResponse] = await Promise.all([
      ApiService.getDanismanYuk().catch(() => ({ success: false, data: [] })),
      ApiService.getKPIMetrics().catch(() => ({ success: false, data: {} }))
    ]);

    this.data = {
      danismanYuk: danismanYukResponse?.data || [],
      unvanDagilimi: this.prepareUnvanDagilimi(danismanYukResponse?.data || [])
    };
  }

  prepareUnvanDagilimi(danismanYuk) {
    const dagilim = {
      'Prof. Dr.': 0,
      'Doç. Dr.': 0,
      'Dr. Öğr. Üyesi': 0,
      'Araş. Gör.': 0
    };

    danismanYuk.forEach(d => {
      const unvan = (d.unvan || '').toLowerCase();
      if (unvan.includes('prof')) {
        dagilim['Prof. Dr.']++;
      } else if (unvan.includes('doç')) {
        dagilim['Doç. Dr.']++;
      } else if (unvan.includes('öğr. üyesi') || unvan.includes('öğretim üyesi')) {
        dagilim['Dr. Öğr. Üyesi']++;
      } else if (unvan.includes('araş') || unvan.includes('araştırma')) {
        dagilim['Araş. Gör.']++;
      }
    });

    return dagilim;
  }

  render() {
    if (!this.data) return;

    const { danismanYuk, unvanDagilimi } = this.data;
    const toplamDanisman = danismanYuk.length;
    const asiriYuklu = danismanYuk.filter(d => (d.kapasite_kullanim_yuzdesi || 0) > 90).length;
    const dusukYuklu = danismanYuk.filter(d => (d.kapasite_kullanim_yuzdesi || 0) < 30).length;
    const ortalamaYuk = danismanYuk.length > 0 
      ? (danismanYuk.reduce((sum, d) => sum + (d.kapasite_kullanim_yuzdesi || 0), 0) / danismanYuk.length).toFixed(1)
      : 0;

    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Akademisyen Yükü</h1>
            <p class="text-sm text-slate-600 mt-1">Danışman kapasite analizi ve yük dengesi</p>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <!-- Toplam Danışman - Purple -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${toplamDanisman}</div>
                <div class="text-sm text-slate-600">Toplam Danışman</div>
              </div>
            </div>

            <!-- Aşırı Yüklü - Red -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${asiriYuklu}</div>
                <div class="text-sm text-slate-600">Aşırı Yüklü (>90%)</div>
              </div>
            </div>

            <!-- Düşük Yüklü - Green -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${dusukYuklu}</div>
                <div class="text-sm text-slate-600">Düşük Yüklü (<30%)</div>
              </div>
            </div>

            <!-- Ortalama Yük - Blue -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${ortalamaYuk}%</div>
                <div class="text-sm text-slate-600">Ortalama Yük</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Danışman Yük Dağılımı (Bar Chart) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Danışman Yük Dağılımı</h3>
                <p class="text-xs text-slate-600 mt-1">Kapasite kullanım oranları</p>
              </div>
              <div class="p-6">
                <canvas id="yuk-dagilim-chart" style="height: 300px;"></canvas>
              </div>
            </div>

            <!-- Unvan Bazlı Dağılım (Donut Chart) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Unvan Bazlı Dağılım</h3>
                <p class="text-xs text-slate-600 mt-1">Akademik unvan dağılımı</p>
              </div>
              <div class="p-6">
                <canvas id="unvan-dagilim-chart" style="height: 300px;"></canvas>
              </div>
            </div>
          </div>

          <!-- Danışman Listesi -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Danışman Listesi</h3>
              <input 
                type="text" 
                id="search-danisman"
                placeholder="Danışman ara..." 
                class="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Danışman</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unvan</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Mevcut Yük</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Kapasite</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Kullanım %</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody id="danisman-liste-body" class="bg-white divide-y divide-slate-200">
                  ${this.renderDanismanListesi(danismanYuk)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderCharts();
    this.setupEventListeners();
  }

  renderDanismanListesi(danismanYuk) {
    if (!danismanYuk || danismanYuk.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-500">
            Danışman bulunamadı.
          </td>
        </tr>
      `;
    }

    return danismanYuk.map(d => {
      const yuzde = d.kapasite_kullanim_yuzdesi || 0;
      const durumClass = yuzde >= 90 ? 'bg-red-100 text-red-800' : yuzde >= 70 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
      const durumText = yuzde >= 90 ? 'Aşırı Yüklü' : yuzde >= 70 ? 'Yüksek' : 'Normal';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-sm font-medium text-indigo-700">${(d.ad?.charAt(0) || '')}${(d.soyad?.charAt(0) || '')}</span>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-slate-900">${d.ad || ''} ${d.soyad || ''}</div>
                <div class="text-sm text-slate-500">${d.personel_id || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-slate-900">${d.unvan || 'N/A'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-semibold text-slate-900">${d.ogrenci_sayisi || 0}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-slate-900">${d.maksimum_kapasite || 0}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="w-24 bg-slate-200 rounded-full h-2 mr-2">
                <div class="h-2 rounded-full ${yuzde >= 90 ? 'bg-red-500' : yuzde >= 70 ? 'bg-orange-500' : 'bg-green-500'}" style="width: ${Math.min(yuzde, 100)}%"></div>
              </div>
              <span class="text-sm font-semibold ${yuzde >= 90 ? 'text-red-600' : yuzde >= 70 ? 'text-orange-600' : 'text-green-600'}">${yuzde.toFixed(1)}%</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full ${durumClass}">
              ${durumText}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderCharts() {
    this.renderYukDagilimChart();
    this.renderUnvanDagilimChart();
  }

  renderYukDagilimChart() {
    const ctx = document.getElementById('yuk-dagilim-chart');
    if (!ctx) return;

    const { danismanYuk } = this.data;
    if (!danismanYuk || danismanYuk.length === 0) return;

    const labels = danismanYuk.slice(0, 10).map(d => {
      const ad = d.ad || '';
      const soyad = d.soyad || '';
      return `${ad.charAt(0)}. ${soyad}`;
    });
    const data = danismanYuk.slice(0, 10).map(d => d.kapasite_kullanim_yuzdesi || 0);

    if (this.charts.yukDagilim) {
      this.charts.yukDagilim.destroy();
    }

    this.charts.yukDagilim = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Kapasite Kullanımı (%)',
          data: data,
          backgroundColor: data.map(yuzde => {
            if (yuzde >= 90) return 'rgba(239, 68, 68, 0.8)';
            if (yuzde >= 70) return 'rgba(245, 158, 11, 0.8)';
            return 'rgba(34, 197, 94, 0.8)';
          }),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8,
            cornerRadius: 4
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
          y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#64748b' } }
        }
      }
    });
  }

  renderUnvanDagilimChart() {
    const ctx = document.getElementById('unvan-dagilim-chart');
    if (!ctx) return;

    const { unvanDagilimi } = this.data;
    const labels = Object.keys(unvanDagilimi);
    const data = Object.values(unvanDagilimi);
    const total = data.reduce((a, b) => a + b, 0);

    if (this.charts.unvanDagilim) {
      this.charts.unvanDagilim.destroy();
    }

    this.charts.unvanDagilim = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgb(139, 92, 246)',
            'rgb(99, 102, 241)',
            'rgb(245, 158, 11)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 10, font: { size: 11 }, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8,
            cornerRadius: 4,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-danisman');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterDanismanlar(e.target.value);
      });
    }
  }

  filterDanismanlar(searchTerm) {
    const filtered = this.data.danismanYuk.filter(d => {
      const ad = (d.ad || '').toLowerCase();
      const soyad = (d.soyad || '').toLowerCase();
      const unvan = (d.unvan || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return ad.includes(term) || soyad.includes(term) || unvan.includes(term);
    });

    const tbody = document.getElementById('danisman-liste-body');
    if (tbody) {
      tbody.innerHTML = this.renderDanismanListesi(filtered);
    }
  }

  showLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-slate-50">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
            <p class="text-sm text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      `;
    }
  }

  hideLoading() {
    // Loading state'i render() metodu tarafından temizlenir
  }

  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-slate-50">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900">Hata</h3>
            </div>
            <p class="text-sm text-slate-600 mb-6">${message}</p>
            <button 
              onclick="location.reload()"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      `;
    }
  }

  destroy() {
    if (this.charts) {
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      this.charts = {};
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

