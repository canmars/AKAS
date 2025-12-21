/**
 * Öğrenci Takibi Page - Healthcare Dashboard Style
 * Öğrenci listesi, filtreleme ve risk bazlı görünüm
 */

import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class OgrenciTakibiPage {
  constructor(container) {
    this.container = container;
    this.data = null;
    this.filters = {
      risk_skoru: null,
      program_turu: null,
      durum: null
    };
    this.charts = {};
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Öğrenci takibi yükleme hatası:', error);
      this.showError('Öğrenci verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [ogrencilerResponse, riskDagilimiResponse, programDagilimiResponse] = await Promise.all([
      ApiService.getOgrenci().catch(() => ({ success: false, data: [] })),
      ApiService.getRiskDagilimi().catch(() => ({ success: false, data: {} })),
      ApiService.getProgramDagilimi().catch(() => ({ success: false, data: [] }))
    ]);

    this.data = {
      ogrenciler: Array.isArray(ogrencilerResponse?.data) 
        ? ogrencilerResponse.data 
        : (ogrencilerResponse?.data?.data || []),
      riskDagilimi: riskDagilimiResponse?.data || {},
      programDagilimi: programDagilimiResponse?.data || []
    };
  }

  render() {
    if (!this.data) return;

    const { ogrenciler, riskDagilimi } = this.data;
    const toplamOgrenci = ogrenciler.length;
    const kritikRisk = riskDagilimi.kritik || 0;
    const yuksekRisk = riskDagilimi.yuksek || 0;

    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Öğrenci Takibi</h1>
            <p class="text-sm text-slate-600 mt-1">Tüm öğrencilerin listesi ve risk analizi</p>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <!-- Toplam Öğrenci - Purple -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${toplamOgrenci}</div>
                <div class="text-sm text-slate-600">Toplam Öğrenci</div>
              </div>
            </div>

            <!-- Kritik Risk - Red -->
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
                <div class="text-3xl font-bold text-slate-900 mb-1">${kritikRisk}</div>
                <div class="text-sm text-slate-600">Kritik Risk</div>
              </div>
            </div>

            <!-- Yüksek Risk - Orange -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${yuksekRisk}</div>
                <div class="text-sm text-slate-600">Yüksek Risk</div>
              </div>
            </div>

            <!-- Aktif Öğrenci - Green -->
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
                <div class="text-3xl font-bold text-slate-900 mb-1">${ogrenciler.filter(o => o.durum_turleri?.durum_adi === 'Aktif').length}</div>
                <div class="text-sm text-slate-600">Aktif Öğrenci</div>
              </div>
            </div>
          </div>

          <!-- Filters and Chart Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Risk Dağılımı Chart -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Risk Dağılımı</h3>
              </div>
              <div class="p-6">
                <canvas id="risk-dagilim-chart" style="height: 250px;"></canvas>
              </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Filtreler</h3>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Risk Skoru</label>
                  <select id="filter-risk" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tümü</option>
                    <option value="0-30">Düşük (0-30)</option>
                    <option value="31-50">Orta (31-50)</option>
                    <option value="51-70">Yüksek (51-70)</option>
                    <option value="71-100">Kritik (71-100)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Program Türü</label>
                  <select id="filter-program" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tümü</option>
                    ${this.data.programDagilimi.map(p => `
                      <option value="${p.program_turu_id}">${p.program_adi}</option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Durum</label>
                  <select id="filter-durum" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tümü</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Dondurdu">Dondurdu</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
                <button 
                  onclick="window.ogrenciTakibiInstance?.applyFilters()"
                  class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Filtrele
                </button>
              </div>
            </div>

            <!-- Program Bazlı Dağılım -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Program Bazlı Dağılım</h3>
              </div>
              <div class="p-6">
                <canvas id="program-dagilim-chart" style="height: 250px;"></canvas>
              </div>
            </div>
          </div>

          <!-- Öğrenci Listesi -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Öğrenci Listesi</h3>
              <div class="flex items-center gap-3">
                <input 
                  type="text" 
                  id="search-input"
                  placeholder="Ara..." 
                  class="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64"
                />
                <button 
                  onclick="window.ogrenciTakibiInstance?.exportData()"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Dışa Aktar
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Program</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Skoru</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Danışman</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Aksiyon</th>
                  </tr>
                </thead>
                <tbody id="ogrenci-liste-body" class="bg-white divide-y divide-slate-200">
                  ${this.renderOgrenciListesi(ogrenciler)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    window.ogrenciTakibiInstance = this;
    this.renderCharts();
    this.setupEventListeners();
  }

  renderOgrenciListesi(ogrenciler) {
    if (!ogrenciler || ogrenciler.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-500">
            Öğrenci bulunamadı.
          </td>
        </tr>
      `;
    }

    return ogrenciler.map(ogrenci => {
      const riskSkoru = ogrenci.mevcut_risk_skoru || 0;
      const riskColor = this.getRiskColor(riskSkoru);
      const riskBadge = this.getRiskBadge(riskSkoru);

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-sm font-medium text-indigo-700">${(ogrenci.ad?.charAt(0) || '')}${(ogrenci.soyad?.charAt(0) || '')}</span>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-slate-900">${ogrenci.ad || ''} ${ogrenci.soyad || ''}</div>
                <div class="text-sm text-slate-500">${ogrenci.ogrenci_no || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-slate-900">${ogrenci.program_turleri?.program_adi || 'N/A'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full ${this.getDurumBadgeClass(ogrenci.durum_turleri?.durum_adi)}">
              ${ogrenci.durum_turleri?.durum_adi || 'N/A'}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="text-sm font-semibold ${riskColor}">${riskSkoru.toFixed(1)}</div>
              <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded ${riskBadge.class}">${riskBadge.text}</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-slate-900">${ogrenci.akademik_personel?.ad || ''} ${ogrenci.akademik_personel?.soyad || 'Atanmamış'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <button 
              onclick="window.location.hash='/ogrenci/${ogrenci.ogrenci_id}'"
              class="text-indigo-600 hover:text-indigo-900 font-medium"
            >
              Detay →
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  getRiskColor(riskSkoru) {
    if (riskSkoru >= 71) return 'text-red-600';
    if (riskSkoru >= 51) return 'text-orange-600';
    if (riskSkoru >= 31) return 'text-yellow-600';
    return 'text-green-600';
  }

  getRiskBadge(riskSkoru) {
    if (riskSkoru >= 71) return { class: 'bg-red-100 text-red-800', text: 'Kritik' };
    if (riskSkoru >= 51) return { class: 'bg-orange-100 text-orange-800', text: 'Yüksek' };
    if (riskSkoru >= 31) return { class: 'bg-yellow-100 text-yellow-800', text: 'Orta' };
    return { class: 'bg-green-100 text-green-800', text: 'Düşük' };
  }

  getDurumBadgeClass(durum) {
    if (durum === 'Aktif') return 'bg-green-100 text-green-800';
    if (durum === 'Dondurdu') return 'bg-yellow-100 text-yellow-800';
    if (durum === 'Pasif') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  }

  renderCharts() {
    this.renderRiskDagilimChart();
    this.renderProgramDagilimChart();
  }

  renderRiskDagilimChart() {
    const ctx = document.getElementById('risk-dagilim-chart');
    if (!ctx) return;

    const { riskDagilimi } = this.data;
    const labels = ['Düşük', 'Orta', 'Yüksek', 'Kritik'];
    const data = [
      riskDagilimi.dusuk || 0,
      riskDagilimi.orta || 0,
      riskDagilimi.yuksek || 0,
      riskDagilimi.kritik || 0
    ];

    if (this.charts.riskDagilim) {
      this.charts.riskDagilim.destroy();
    }

    this.charts.riskDagilim = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(234, 179, 8)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
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
            cornerRadius: 4
          }
        }
      }
    });
  }

  renderProgramDagilimChart() {
    const ctx = document.getElementById('program-dagilim-chart');
    if (!ctx) return;

    const { programDagilimi } = this.data;
    const labels = programDagilimi.map(p => p.program_adi || 'N/A');
    const data = programDagilimi.map(p => p.toplam_ogrenci || 0);

    if (this.charts.programDagilim) {
      this.charts.programDagilim.destroy();
    }

    this.charts.programDagilim = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Öğrenci Sayısı',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
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
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748b' } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, color: '#64748b' } }
        }
      }
    });
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterOgrenciler();
      });
    }
  }

  applyFilters() {
    this.filters.risk_skoru = document.getElementById('filter-risk')?.value || null;
    this.filters.program_turu = document.getElementById('filter-program')?.value || null;
    this.filters.durum = document.getElementById('filter-durum')?.value || null;
    this.filterOgrenciler();
  }

  filterOgrenciler() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    let filtered = [...this.data.ogrenciler];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(o => 
        (o.ad || '').toLowerCase().includes(searchTerm) ||
        (o.soyad || '').toLowerCase().includes(searchTerm) ||
        (o.ogrenci_no || '').toLowerCase().includes(searchTerm)
      );
    }

    // Risk filter
    if (this.filters.risk_skoru) {
      const [min, max] = this.filters.risk_skoru.split('-').map(Number);
      filtered = filtered.filter(o => {
        const risk = o.mevcut_risk_skoru || 0;
        return risk >= min && risk <= max;
      });
    }

    // Program filter
    if (this.filters.program_turu) {
      filtered = filtered.filter(o => o.program_turleri?.program_turu_id == this.filters.program_turu);
    }

    // Durum filter
    if (this.filters.durum) {
      filtered = filtered.filter(o => o.durum_turleri?.durum_adi === this.filters.durum);
    }

    // Update table
    const tbody = document.getElementById('ogrenci-liste-body');
    if (tbody) {
      tbody.innerHTML = this.renderOgrenciListesi(filtered);
    }
  }

  exportData() {
    // Export functionality
    alert('Dışa aktarma özelliği yakında eklenecek.');
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
    if (window.ogrenciTakibiInstance === this) {
      delete window.ogrenciTakibiInstance;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

