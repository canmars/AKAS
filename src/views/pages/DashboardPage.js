/**
 * Dashboard Page - Google Analytics Style
 * Modern, minimalist, professional design
 * Clean white background, subtle shadows, large numbers
 */

import { KPICard } from '../components/KPICard.js';
import { FunnelChart } from '../components/FunnelChart.js';
import { LoadHeatmap } from '../components/LoadHeatmap.js';
import { RiskDonut } from '../components/RiskDonut.js';
import { ProgramPie } from '../components/ProgramPie.js';
import { EngagementScatter } from '../components/EngagementScatter.js';
import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class DashboardPage {
  constructor(container) {
    this.container = container;
    this.components = {};
    this.charts = {};
    this.data = null;
  }

  async init() {
    this.showLoading();
    try {
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Dashboard yükleme hatası:', error);
      this.showError('Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    // Temel dashboard verileri
    const [kpiResponse, riskDagilimiResponse, programDagilimiResponse, danismanYukResponse, surecHattiResponse, attritionResponse] = await Promise.all([
      ApiService.getKPIMetrics().catch(() => ({ success: false, data: {} })),
      ApiService.getRiskDagilimi().catch(() => ({ success: false, data: {} })),
      ApiService.getProgramDagilimi().catch(() => ({ success: false, data: [] })),
      ApiService.getDanismanYuk().catch(() => ({ success: false, data: [] })),
      ApiService.getSurecHatti().catch(() => ({ success: false, data: [] })),
      ApiService.getAttritionData().catch(() => ({ success: false, data: [] }))
    ]);

    // Stratejik analiz verileri
    const [basariTrendiResponse, danismanPerformansResponse, kritikDarbogazlarResponse, programBasariResponse] = await Promise.all([
      ApiService.getBasariTrendi({ akademik_yil: new Date().getFullYear() }).catch(() => ({ success: false, data: [] })),
      ApiService.getDanismanKarsilastirma({ akademik_yil: new Date().getFullYear() }).catch(() => ({ success: false, data: [] })),
      ApiService.getKritikDarbogazlar().catch(() => ({ success: false, data: [] })),
      ApiService.getProgramBazliBasari({ akademik_yil: new Date().getFullYear() }).catch(() => ({ success: false, data: [] }))
    ]);

    this.data = {
      kpi: kpiResponse?.data || {},
      riskDagilimi: riskDagilimiResponse?.data || {},
      programDagilimi: programDagilimiResponse?.data || [],
      danismanYuk: danismanYukResponse?.data || [],
      surecHattiData: surecHattiResponse?.data || [],
      engagementData: this.prepareEngagementData(attritionResponse?.data || []),
      basariTrendi: basariTrendiResponse?.data || [],
      danismanPerformans: danismanPerformansResponse?.data || [],
      kritikDarbogazlar: kritikDarbogazlarResponse?.data || [],
      programBasari: programBasariResponse?.data || []
    };
  }

  prepareEngagementData(attritionData) {
    if (!attritionData || !Array.isArray(attritionData)) {
      return [];
    }
    return attritionData.map(item => ({
      ogrenci_id: item.ogrenci_id,
      ad: item.ad,
      soyad: item.soyad,
      gun_sayisi: item.gun_sayisi || item.login_olmayan_gun_sayisi || 0,
      risk_skoru: item.risk_skoru || 0,
      program_adi: item.program_adi || 'N/A'
    }));
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-gray-50 min-h-screen">
        <!-- Header - Google Analytics Style -->
        <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-normal text-gray-900">Dashboard</h1>
                <p class="text-sm text-gray-500 mt-1">Stratejik Karar Destek Sistemi</p>
              </div>
              <div class="flex items-center gap-3">
                <button onclick="window.location.hash='/stratejik-analiz'" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                  Stratejik Analiz
                </button>
                <button onclick="window.location.hash='/performans-raporlari'" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                  Raporlar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="px-6 py-6">
          <!-- KPI Cards - Google Analytics Style -->
          <div id="kpi-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>
          
          <!-- Main Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Risk Dağılımı -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-medium text-gray-900">Risk Dağılımı</h2>
              </div>
              <div class="p-6">
                <div id="risk-donut-container" style="height: 280px;"></div>
              </div>
            </div>

            <!-- Program Dağılımı -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-medium text-gray-900">Program Dağılımı</h2>
              </div>
              <div class="p-6">
                <div id="program-pie-container" style="height: 280px;"></div>
              </div>
            </div>
          </div>

          <!-- Başarı Trendi ve Program Karşılaştırma -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Başarı Trendi -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-base font-medium text-gray-900">Başarı Trendi</h2>
                <button onclick="window.location.hash='/stratejik-analiz'" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Detaylı görünüm →
                </button>
              </div>
              <div class="p-6">
                <canvas id="basari-trendi-mini-chart" style="height: 250px;"></canvas>
              </div>
            </div>

            <!-- Program Karşılaştırma -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-base font-medium text-gray-900">Program Karşılaştırma</h2>
                <button onclick="window.location.hash='/performans-raporlari'" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Detaylı görünüm →
                </button>
              </div>
              <div class="p-6">
                <canvas id="program-karsilastirma-chart" style="height: 250px;"></canvas>
              </div>
            </div>
          </div>

          <!-- Süreç Hunisi ve Engagement -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Süreç Hunisi -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-medium text-gray-900">Süreç Hunisi</h2>
                <p class="text-xs text-gray-500 mt-1">Aşama bazlı öğrenci akışı</p>
              </div>
              <div class="p-6">
                <div id="funnel-container" style="height: 320px;"></div>
              </div>
            </div>

            <!-- Engagement Analizi -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-medium text-gray-900">Engagement Analizi</h2>
                <p class="text-xs text-gray-500 mt-1">Son login vs Risk skoru</p>
              </div>
              <div class="p-6">
                <div id="engagement-scatter-container" style="height: 320px;"></div>
              </div>
            </div>
          </div>

          <!-- Danışman Yük ve Performans -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Danışman Yük -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-medium text-gray-900">Danışman Yük Dengesi</h2>
              </div>
              <div class="p-6">
                <div id="load-heatmap-container" style="height: 300px;"></div>
              </div>
            </div>

            <!-- Danışman Performans -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-base font-medium text-gray-900">Danışman Performans</h2>
                <button onclick="window.location.hash='/performans-raporlari'" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Detaylı görünüm →
                </button>
              </div>
              <div class="p-6">
                <canvas id="danisman-performans-heatmap" style="height: 300px;"></canvas>
              </div>
            </div>
          </div>

          <!-- Kritik Darboğazlar -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 class="text-base font-medium text-gray-900">Kritik Darboğazlar</h2>
                <p class="text-xs text-gray-500 mt-1">Acil müdahale gereken süreç darboğazları</p>
              </div>
              <button onclick="window.location.hash='/stratejik-analiz'" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Tüm darboğazlar →
              </button>
            </div>
            <div class="p-6">
              <div id="kritik-darbogaz-list" class="space-y-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderComponents();
  }

  renderComponents() {
    // KPI Scorecards
    const kpiContainer = document.getElementById('kpi-container');
    if (kpiContainer) {
      this.components.kpi = new KPICard(kpiContainer, this.data.kpi);
    }

    // Risk Donut
    const riskDonutContainer = document.getElementById('risk-donut-container');
    if (riskDonutContainer && this.data.riskDagilimi) {
      this.components.riskDonut = new RiskDonut(riskDonutContainer, this.data.riskDagilimi);
    }

    // Program Pie
    const programPieContainer = document.getElementById('program-pie-container');
    if (programPieContainer && this.data.programDagilimi) {
      this.components.programPie = new ProgramPie(programPieContainer, this.data.programDagilimi);
    }

    // Load Heatmap
    const loadContainer = document.getElementById('load-heatmap-container');
    if (loadContainer && this.data.danismanYuk) {
      this.components.loadHeatmap = new LoadHeatmap(loadContainer, this.data.danismanYuk);
    }

    // Funnel Chart
    const funnelContainer = document.getElementById('funnel-container');
    if (funnelContainer && this.data.surecHattiData) {
      this.components.funnelChart = new FunnelChart(funnelContainer, this.data.surecHattiData);
    }

    // Engagement Scatter
    const engagementContainer = document.getElementById('engagement-scatter-container');
    if (engagementContainer && this.data.engagementData) {
      this.components.engagementScatter = new EngagementScatter(engagementContainer, this.data.engagementData);
    }

    // Yeni grafikler
    this.renderBasariTrendiMiniChart();
    this.renderProgramKarsilastirmaChart();
    this.renderDanismanPerformansHeatmap();
    this.renderKritikDarbogazlar();
  }

  renderBasariTrendiMiniChart() {
    const ctx = document.getElementById('basari-trendi-mini-chart');
    if (!ctx) return;

    if (!this.data.basariTrendi || this.data.basariTrendi.length === 0) {
      ctx.parentElement.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Başarı trendi verisi bulunamadı.</p>';
      return;
    }

    // Son 4 dönem verisini hazırla
    const trendMap = {};
    this.data.basariTrendi.forEach(item => {
      const key = `${item.akademik_yil}-${item.yariyil}`;
      if (!trendMap[key]) {
        trendMap[key] = { count: 0, sum: 0 };
      }
      trendMap[key].count++;
      if (item.ortalama_not) {
        trendMap[key].sum += parseFloat(item.ortalama_not);
      }
    });

    const sortedKeys = Object.keys(trendMap).sort().slice(-4);
    if (sortedKeys.length === 0) {
      ctx.parentElement.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Yeterli veri yok.</p>';
      return;
    }

    const labels = sortedKeys.map(key => {
      const [yil, yariyil] = key.split('-');
      return `${yil} ${yariyil === '1' ? 'Güz' : 'Bahar'}`;
    });
    const data = sortedKeys.map(key => {
      const item = trendMap[key];
      return item.count > 0 ? parseFloat((item.sum / item.count).toFixed(2)) : 0;
    });

    // Google Analytics style - minimal colors
    this.charts.basariTrendiMini = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ortalama Not',
          data: data,
          borderColor: '#4285f4', // Google blue
          backgroundColor: 'rgba(66, 133, 244, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#4285f4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13,
              weight: 'normal'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          },
          y: {
            beginAtZero: false,
            min: 0,
            max: 4,
            grid: {
              color: '#f0f0f0'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          }
        }
      }
    });
  }

  renderProgramKarsilastirmaChart() {
    const ctx = document.getElementById('program-karsilastirma-chart');
    if (!ctx) return;

    if (!this.data.programBasari || this.data.programBasari.length === 0) {
      ctx.parentElement.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Program karşılaştırma verisi bulunamadı.</p>';
      return;
    }

    const labels = this.data.programBasari.map(p => p.program_adi || p.program_kodu);
    const ortalamaNot = this.data.programBasari.map(p => p.ortalama_not || 0);
    const mezuniyetOrani = this.data.programBasari.map(p => p.mezuniyet_orani || 0);

    // Google Analytics style colors
    this.charts.programKarsilastirma = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ortalama Not',
            data: ortalamaNot,
            backgroundColor: '#4285f4', // Google blue
            borderColor: '#4285f4',
            borderWidth: 0,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Mezuniyet Oranı (%)',
            data: mezuniyetOrani,
            backgroundColor: '#34a853', // Google green
            borderColor: '#34a853',
            borderWidth: 0,
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            max: 4,
            grid: {
              color: '#f0f0f0'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          }
        }
      }
    });
  }

  renderDanismanPerformansHeatmap() {
    const ctx = document.getElementById('danisman-performans-heatmap');
    if (!ctx) return;

    if (!this.data.danismanPerformans || this.data.danismanPerformans.length === 0) {
      ctx.parentElement.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Danışman performans verisi bulunamadı.</p>';
      return;
    }

    const labels = this.data.danismanPerformans.map(d => {
      const personel = d.akademik_personel;
      return personel ? `${personel.ad?.charAt(0)}. ${personel.soyad}` : 'Bilinmeyen';
    });
    const basariOranlari = this.data.danismanPerformans.map(d => d.basari_orani || 0);

    // Google Analytics style - subtle colors
    this.charts.danismanPerformansHeatmap = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Başarı Oranı (%)',
            data: basariOranlari,
            backgroundColor: basariOranlari.map(oran => {
              if (oran >= 80) return '#34a853'; // Green
              if (oran >= 60) return '#fbbc04'; // Yellow
              return '#ea4335'; // Red
            }),
            borderWidth: 0,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#666'
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#f0f0f0'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#666'
            }
          }
        }
      }
    });
  }

  renderKritikDarbogazlar() {
    const container = document.getElementById('kritik-darbogaz-list');
    if (!container) return;

    const kritikDarbogazlar = this.data.kritikDarbogazlar.slice(0, 5);

    if (kritikDarbogazlar.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">Kritik darboğaz bulunamadı.</p>';
      return;
    }

    // Google Analytics style - clean list
    container.innerHTML = kritikDarbogazlar.map(item => `
      <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 class="text-sm font-medium text-gray-900">${item.asama || 'Bilinmeyen Aşama'}</h3>
            <span class="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded">
              ${item.darbogaz_seviyesi || 'Kritik'}
            </span>
          </div>
          <p class="text-sm text-gray-600 ml-5">
            ${item.program_turleri?.program_adi || 'Tüm Programlar'} • 
            <span class="font-semibold text-gray-900">${item.takilan_ogrenci_sayisi || 0}</span> öğrenci takılı • 
            Ortalama: <span class="font-medium">${(item.ortalama_takilma_suresi_ay || 0).toFixed(1)} ay</span>
          </p>
        </div>
      </div>
    `).join('');
  }

  showLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="bg-gray-50 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-4"></div>
            <p class="text-sm text-gray-600">Yükleniyor...</p>
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
        <div class="bg-gray-50 min-h-screen flex items-center justify-center">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-base font-medium text-gray-900">Hata</h3>
            </div>
            <p class="text-sm text-gray-600">${message}</p>
          </div>
        </div>
      `;
    }
  }

  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = {};

    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}
