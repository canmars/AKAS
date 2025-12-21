/**
 * Dashboard Page - Modernized
 * Executive Cockpit - Stratejik Karar Destek Sistemi
 * 5 Saniye Kuralı: Durum bir bakışta anlaşılmalı
 */

import { KPICard } from '../components/KPICard.js';
import { FunnelChart } from '../components/FunnelChart.js';
import { LoadHeatmap } from '../components/LoadHeatmap.js';
import { RiskDonut } from '../components/RiskDonut.js';
import { ProgramPie } from '../components/ProgramPie.js';
import { EngagementScatter } from '../components/EngagementScatter.js';
import { SankeyDiagram } from '../components/SankeyDiagram.js';
import { CorrelationMatrix } from '../components/CorrelationMatrix.js';
import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class DashboardPage {
  constructor(container) {
    this.container = container;
    this.components = {};
    this.detailPanel = null;
    this.data = null;
  }

  render(data) {
    if (!this.container) {
      console.error('DashboardPage: Container is not defined');
      return;
    }

    this.data = data;
    this.destroy();
    
    // Modern, temiz layout
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-6">
        <!-- KATMAN 1: KPI Scorecards (4 Kart) -->
        <div id="kpi-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></div>
        
        <!-- KATMAN 2: Üst Satır - 3 Ana Grafik -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Risk Dağılımı -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Risk Dağılımı</h3>
                  <p class="text-xs text-slate-600">Dilimlere tıklayın</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="risk-donut-container" style="height: 250px;"></div>
              <div id="risk-donut-summary" class="mt-3 text-xs text-slate-600"></div>
            </div>
          </div>

          <!-- Program Dağılımı -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Program Dağılımı</h3>
                  <p class="text-xs text-slate-600">Dilimlere tıklayın</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="program-pie-container" style="height: 250px;"></div>
              <div id="program-pie-summary" class="mt-3 text-xs text-slate-600"></div>
            </div>
          </div>

          <!-- Danışman Yük Dengesi -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Danışman Yük</h3>
                  <p class="text-xs text-slate-600">Bara tıklayın</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="load-heatmap-container" style="height: 250px;"></div>
              <div id="load-summary" class="mt-3 text-xs text-slate-600"></div>
            </div>
          </div>
        </div>

        <!-- KATMAN 3: Orta Satır - Süreç Hattı + Engagement -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Süreç Hattı -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Süreç Hunisi</h3>
                  <p class="text-xs text-slate-600">Akademik aşamalar ve darboğazlar</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="funnel-container" style="height: 300px;"></div>
            </div>
          </div>

          <!-- Engagement Scatter -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Engagement Analizi</h3>
                  <p class="text-xs text-slate-600">Son login vs Risk skoru</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="engagement-scatter-container" style="height: 300px;"></div>
            </div>
          </div>
        </div>

        <!-- KATMAN 4: Alt Satır - Yeni Stratejik Grafikler -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Sankey Diagram - Öğrenci Akışı -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Öğrenci Akışı</h3>
                  <p class="text-xs text-slate-600">Aşama geçişleri</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="sankey-container" style="min-height: 300px;"></div>
            </div>
          </div>

          <!-- Correlation Matrix -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Risk Faktörleri Korelasyonu</h3>
                  <p class="text-xs text-slate-600">Faktörler arası ilişki</p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div id="correlation-matrix-container" style="min-height: 300px;"></div>
            </div>
          </div>
        </div>

        <!-- Detay Paneli (Gizli/Açılır) -->
        <div id="detail-panel" class="hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"></div>
      </div>
    `;
    
    this.detailPanel = document.getElementById('detail-panel');
    window.dashboardPage = this;
    
    // Component'leri render et
    this.renderComponents(data);
  }

  renderComponents(data) {
    // KPI Scorecards
    const kpiContainer = document.getElementById('kpi-container');
    if (kpiContainer) {
      this.components.kpi = new KPICard(kpiContainer, data?.kpi || {});
    }

    // Risk Donut
    const riskDonutContainer = document.getElementById('risk-donut-container');
    if (riskDonutContainer && data?.riskDagilimi) {
      this.components.riskDonut = new RiskDonut(
        riskDonutContainer,
        data.riskDagilimi,
        async (clickData) => {
          if (clickData) {
            try {
              const response = await ApiService.getOgrenciler({
                min_risk_skoru: clickData.minRisk,
                max_risk_skoru: clickData.maxRisk
              });
              
              if (response.success && response.data) {
                const riskLabel = clickData.riskSeviyesi === 'kritik' ? 'Kritik Risk' :
                                 clickData.riskSeviyesi === 'yuksek' ? 'Yüksek Risk' :
                                 clickData.riskSeviyesi === 'orta' ? 'Orta Risk' : 'Düşük Risk';
                this.showDetailPanel(
                  response.data,
                  `${riskLabel} Seviyesindeki Öğrenciler`,
                  `Risk skoru ${clickData.minRisk}-${clickData.maxRisk} aralığında olan öğrenciler`
                );
              }
            } catch (error) {
              console.error('Risk seviyesi öğrencileri alınamadı:', error);
            }
          }
        }
      );
    }

    // Program Pie
    const programPieContainer = document.getElementById('program-pie-container');
    if (programPieContainer && data?.programDagilimi) {
      this.components.programPie = new ProgramPie(
        programPieContainer,
        data.programDagilimi,
        async (clickData) => {
          if (clickData?.program_turu_id) {
            try {
              const response = await ApiService.getOgrenciler({
                program_turu_id: clickData.program_turu_id
              });
              if (response?.success && response.data) {
                this.showDetailPanel(
                  response.data,
                  `${clickData.program_adi} Programı - Öğrenciler`,
                  `Toplam ${response.data.length} öğrenci`
                );
              }
            } catch (error) {
              console.error('Program öğrencileri alınamadı:', error);
            }
          }
        }
      );
    }

    // Load Heatmap
    const loadContainer = document.getElementById('load-heatmap-container');
    if (loadContainer && data?.danismanYuk) {
      this.components.loadHeatmap = new LoadHeatmap(
        loadContainer,
        data.danismanYuk,
        async (clickedData, type, title) => {
          if (clickedData && Array.isArray(clickedData) && clickedData.length > 0) {
            this.showDetailPanel(
              clickedData,
              title || 'Danışman Öğrenci Listesi',
              `Bu danışmanın ${clickedData.length} öğrencisi bulunmaktadır`
            );
          }
        }
      );
    }

    // Funnel Chart (Süreç Hunisi)
    const funnelContainer = document.getElementById('funnel-container');
    if (funnelContainer && data?.surecHattiData) {
      this.components.funnelChart = new FunnelChart(
        funnelContainer,
        data.surecHattiData,
        async (clickData) => {
          if (!clickData?.asama) return;

          const riskGroup = clickData.risk_group;
          const params = { mevcut_asinama: clickData.asama };
          if (riskGroup === 'kritik') {
            params.min_risk_skoru = 70;
            params.max_risk_skoru = 100;
          } else if (riskGroup === 'uyari') {
            params.min_risk_skoru = 50;
            params.max_risk_skoru = 69;
          } else if (riskGroup === 'normal') {
            params.min_risk_skoru = 0;
            params.max_risk_skoru = 49;
          }

          try {
            const response = await ApiService.getOgrenciler(params);
            if (response?.success && response.data) {
              const riskLabel = riskGroup === 'kritik' ? 'Kritik' :
                               riskGroup === 'uyari' ? 'Uyarı' : 'Normal';
              const asamaMap = {
                'Ders': 'Ders Aşaması',
                'Yeterlik': 'Yeterlik Sınavı',
                'Tez_Onersi': 'Tez Önerisi',
                'TIK': 'TİK',
                'Tez': 'Tez Yazımı',
                'Tamamlandi': 'Tamamlandı'
              };
              const asamaLabel = asamaMap[clickData.asama] || clickData.asama;

              this.showDetailPanel(
                response.data,
                `${asamaLabel} - ${riskLabel} Risk Öğrenciler`,
                `Toplam ${response.data.length} öğrenci bu kategoride`
              );
            }
          } catch (error) {
            console.error('Süreç hattı öğrenci listesi alınamadı:', error);
          }
        }
      );
    }

    // Engagement Scatter
    const engagementContainer = document.getElementById('engagement-scatter-container');
    if (engagementContainer && data?.engagementData) {
      this.components.engagementScatter = new EngagementScatter(
        engagementContainer,
        data.engagementData,
        async (point) => {
          if (point?.ogrenci_id) {
            window.location.hash = `#/ogrenci/${point.ogrenci_id}`;
          }
        }
      );
    }

    // Sankey Diagram
    const sankeyContainer = document.getElementById('sankey-container');
    if (sankeyContainer && data?.surecHattiData) {
      // Süreç hattı verisini Sankey formatına dönüştür
      const sankeyData = this.convertToSankeyData(data.surecHattiData);
      this.components.sankey = new SankeyDiagram(
        sankeyContainer,
        sankeyData,
        (stageId) => {
          // Aşamaya tıklandığında öğrenci listesini göster
          const asamaData = data.surecHattiData.find(d => d.asama === stageId);
          if (asamaData) {
            this.showDetailPanel(
              [],
              `${stageId} Aşamasındaki Öğrenciler`,
              'Öğrenci listesi yükleniyor...'
            );
            // API'den öğrenci listesini al
            ApiService.getOgrenciler({ mevcut_asinama: stageId })
              .then(response => {
                if (response?.success && response.data) {
                  this.showDetailPanel(
                    response.data,
                    `${stageId} Aşamasındaki Öğrenciler`,
                    `Toplam ${response.data.length} öğrenci`
                  );
                }
              })
              .catch(error => console.error('Öğrenci listesi alınamadı:', error));
          }
        }
      );
    }

    // Correlation Matrix
    const correlationContainer = document.getElementById('correlation-matrix-container');
    if (correlationContainer) {
      // Korelasyon verisini hazırla (gerçek implementasyonda API'den gelecek)
      const correlationData = this.prepareCorrelationData(data);
      this.components.correlationMatrix = new CorrelationMatrix(
        correlationContainer,
        correlationData,
        (cellData) => {
          console.log('Correlation cell clicked:', cellData);
        }
      );
    }
  }

  convertToSankeyData(surecHattiData) {
    // Süreç hattı verisini Sankey formatına dönüştür
    const sankeyData = {};
    if (surecHattiData && Array.isArray(surecHattiData)) {
      surecHattiData.forEach(item => {
        const asama = item.asama || item.mevcut_asinama;
        if (asama) {
          // toplam varsa onu kullan, yoksa normal+uyari+kritik topla
          const total = item.toplam || ((item.kritik || 0) + (item.uyari || 0) + (item.normal || 0));
          sankeyData[asama] = total;
        }
      });
    }
    return sankeyData;
  }

  prepareCorrelationData(data) {
    // Basit korelasyon verisi (gerçek implementasyonda AnalyticsService'den gelecek)
    return {
      labels: ['TS Sayısı', 'Son Login Gün', 'Mevcut Yarıyıl', 'Risk Skoru', 'Hayalet Öğrenci', 'Seminer Durumu'],
      matrix: [
        [1.0, 0.3, 0.5, 0.7, 0.2, 0.4],
        [0.3, 1.0, 0.1, 0.6, 0.8, 0.2],
        [0.5, 0.1, 1.0, 0.4, 0.1, 0.3],
        [0.7, 0.6, 0.4, 1.0, 0.5, 0.6],
        [0.2, 0.8, 0.1, 0.5, 1.0, 0.1],
        [0.4, 0.2, 0.3, 0.6, 0.1, 1.0]
      ]
    };
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-slate-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    `;
  }

  hideLoading() {
    // Loading state'i render() metodu tarafından temizlenir
    // Bu metod sadece interface uyumluluğu için
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-sm text-red-700 font-medium">${message}</p>
        </div>
      </div>
    `;
  }

  showDetailPanel(students, title, subtitle) {
    if (!this.detailPanel) return;

    if (!students || students.length === 0) {
      this.detailPanel.innerHTML = `
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">${title || 'Öğrenci Listesi'}</h3>
            <button onclick="window.dashboardPage?.hideDetailPanel()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-slate-500">${subtitle || 'Öğrenci bulunamadı.'}</p>
        </div>
      `;
      this.detailPanel.classList.remove('hidden');
      this.scrollToPanel();
      return;
    }

    this.detailPanel.innerHTML = this.renderStudentList(students, title, subtitle);
    this.detailPanel.classList.remove('hidden');
    this.setupStudentListSearch();
    this.scrollToPanel();
  }

  hideDetailPanel() {
    if (this.detailPanel) {
      this.detailPanel.classList.add('hidden');
    }
  }

  scrollToPanel() {
    setTimeout(() => {
      if (this.detailPanel) {
        this.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  renderStudentList(students, title, subtitle) {
    return `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-slate-900 mb-2">${title || 'Öğrenci Listesi'}</h3>
            ${subtitle ? `<p class="text-sm text-slate-600">${subtitle}</p>` : ''}
            <div class="mt-3 flex items-center gap-2">
              <span class="text-sm text-slate-500">Toplam:</span>
              <span class="text-xl font-bold text-blue-600">${students.length}</span>
              <span class="text-sm text-slate-500">öğrenci</span>
            </div>
          </div>
          <button onclick="window.dashboardPage?.hideDetailPanel()" class="text-slate-400 hover:text-slate-600 ml-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="mb-6">
          <input 
            type="text" 
            id="detail-panel-search" 
            placeholder="Öğrenci ara..." 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Öğrenci</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Program</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Risk</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Aşama</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200" id="detail-panel-table-body">
              ${students.map(ogrenci => {
                const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
                const programAdi = ogrenci.program_adi || ogrenci.program_turleri?.program_adi || 'N/A';
                const mevcutAsama = ogrenci.mevcut_asinama || 'Bilinmiyor';
                const searchText = `${ogrenci.ad || ''} ${ogrenci.soyad || ''} ${programAdi} ${mevcutAsama}`.toLowerCase();
                
                return `
                  <tr class="detail-panel-row hover:bg-slate-50" data-search="${searchText.replace(/"/g, '&quot;')}">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 ${this.getAvatarGradient(ogrenci.ogrenci_id)} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          ${`${ogrenci.ad?.[0] || ''}${ogrenci.soyad?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div class="text-sm font-semibold text-slate-900">${ogrenci.ad} ${ogrenci.soyad}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${programAdi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${this.getRiskBadgeClass(riskSkoru)}">
                        ${riskSkoru}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">${mevcutAsama}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'; window.dashboardPage?.hideDetailPanel();"
                        class="text-blue-600 hover:text-blue-800 font-semibold">
                        Detay →
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  setupStudentListSearch() {
    const input = document.getElementById('detail-panel-search');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.detail-panel-row');
      
      rows.forEach(row => {
        const searchText = row.getAttribute('data-search') || '';
        row.style.display = searchText.includes(searchTerm) ? '' : 'none';
      });
    });
  }

  getAvatarGradient(ogrenciId) {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-teal-500 to-teal-600'
    ];
    if (!ogrenciId) return gradients[0];
    const hash = ogrenciId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }

  getRiskBadgeClass(riskSkoru) {
    if (riskSkoru >= 70) return 'bg-red-100 text-red-800';
    if (riskSkoru >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = {};
    
    if (this.detailPanel) {
      this.detailPanel.classList.add('hidden');
    }
  }
}
