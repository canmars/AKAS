/**
 * Dashboard Page
 * Pilot Kokpiti - %100 Grafiksel Dashboard
 * KATMAN 1: Scorecards | KATMAN 2: 3 Grafik | KATMAN 3: Detay Tablosu (Gizli)
 */

import { KPICard } from '../components/KPICard.js';
import { ProgressStackedBar } from '../components/ProgressStackedBar.js';
import { LoadHeatmap } from '../components/LoadHeatmap.js';
import { RiskDonut } from '../components/RiskDonut.js';
import { ProgramPie } from '../components/ProgramPie.js';
import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class DashboardPage {
  constructor(container) {
    this.container = container;
    this.components = {};
    this.actionTable = null;
    this.detailPanel = null;
  }

  render(data) {
    if (!this.container) {
      console.error('DashboardPage: Container is not defined');
      return;
    }

    // Önceki component'leri temizle
    this.destroy();
    
    // Container'ı temizle ve Tailwind ile layout oluştur
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-8">
        <!-- KATMAN 1: Canlı Durum Paneli (Scorecards) -->
        <div id="kpi-container"></div>
        
        <!-- KATMAN 2: Stratejik Görselleştirme (Enterprise Analytics) -->
        
        <!-- Üst Satır: 3 Kart (Risk, Danışman Yük, Program) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- GRAFİK 1: Risk Dağılımı -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
            <div class="flex items-start gap-3 p-5 border-b border-slate-100">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg font-semibold text-slate-900 leading-tight">Risk Dağılımı</h3>
                <p class="text-sm text-slate-500 leading-snug">Dilimlere tıklayarak ilgili öğrenci listesini açın.</p>
              </div>
            </div>
            <div class="p-6">
              <div id="risk-donut-container" class="chart-container" style="height: 280px;"></div>
              <div id="risk-donut-summary" class="mt-4 text-sm text-slate-600"></div>
            </div>
          </div>
          
          <!-- GRAFİK 2: Danışman Yük Dengesi -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
            <div class="flex items-start gap-3 p-5 border-b border-slate-100">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg font-semibold text-slate-900 leading-tight">Danışman Yük Dengesi</h3>
                <p class="text-sm text-slate-500 leading-snug">Bara tıklayarak danışmanın öğrenci listesini açın.</p>
              </div>
            </div>
            <div class="p-6">
              <div id="load-heatmap-container" class="chart-container" style="height: 280px;"></div>
              <div id="load-summary" class="mt-4 text-sm text-slate-600"></div>
            </div>
          </div>
          
          <!-- GRAFİK 3: Program Dağılımı -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
            <div class="flex items-start gap-3 p-5 border-b border-slate-100">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg font-semibold text-slate-900 leading-tight">Program Dağılımı</h3>
                <p class="text-sm text-slate-500 leading-snug">Dilimlere tıklayarak programın öğrenci listesini açın.</p>
              </div>
            </div>
            <div class="p-6">
              <div id="program-pie-container" class="chart-container" style="height: 280px;"></div>
              <div id="program-pie-summary" class="mt-4 text-sm text-slate-600"></div>
            </div>
          </div>
        </div>
        
        <!-- Alt Satır: Süreç Hattı (Geniş) -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="flex items-start gap-3 p-5 border-b border-slate-100">
            <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-slate-900 leading-tight">Süreç Hattı</h3>
              <p class="text-sm text-slate-500 leading-snug">
                Öğrencilerin akademik aşamalara göre dağılımı. Bara tıklayarak aşama ve risk grubuna göre öğrenci listesini görüntüleyin.
              </p>
            </div>
          </div>
          <div class="p-6">
            <div id="progress-stacked-container" class="chart-container" style="height: 350px;"></div>
          </div>
        </div>
        
        <!-- Detay Paneli (Sayfanın Altında) -->
        <div id="detail-panel" class="hidden bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden transition-all duration-300">
          <!-- Panel içeriği dinamik olarak doldurulacak -->
        </div>
      </div>
    `;
    
    // Detay paneli referansını al ve global erişim için window'a ekle
    this.detailPanel = document.getElementById('detail-panel');
    window.dashboardPage = this; // Global erişim için
    
    // KATMAN 1: KPI Scorecards
    const kpiContainer = document.getElementById('kpi-container');
    if (kpiContainer) {
      this.components.kpi = new KPICard(kpiContainer, data?.kpi || {});
    }
    
    // KATMAN 2: GRAFİK 1 - Risk Dağılımı (Doughnut)
    const riskDonutContainer = document.getElementById('risk-donut-container');
    if (riskDonutContainer && data?.riskDagilimi) {
      this.components.riskDonut = new RiskDonut(
        riskDonutContainer,
        data.riskDagilimi,
        async (clickData) => {
          // Risk seviyesindeki öğrencileri getir ve detay panelini aç
          if (clickData) {
            try {
              const response = await ApiService.getOgrenciler({
                min_risk_skoru: clickData.minRisk,
                max_risk_skoru: clickData.maxRisk
              });
              
              if (response.success && response.data && response.data.length > 0) {
                const riskLabel = clickData.riskSeviyesi === 'kritik' ? 'Kritik Risk' :
                                 clickData.riskSeviyesi === 'yuksek' ? 'Yüksek Risk' :
                                 clickData.riskSeviyesi === 'orta' ? 'Orta Risk' : 'Düşük Risk';
                this.showDetailPanel(
                  response.data,
                  `${riskLabel} Seviyesindeki Öğrenciler`,
                  `Risk skoru ${clickData.minRisk}-${clickData.maxRisk} aralığında olan öğrenciler`
                );
              } else if (response.success && response.data && response.data.length === 0) {
                // Boş liste durumu
                const riskLabel = clickData.riskSeviyesi === 'kritik' ? 'Kritik Risk' :
                                 clickData.riskSeviyesi === 'yuksek' ? 'Yüksek Risk' :
                                 clickData.riskSeviyesi === 'orta' ? 'Orta Risk' : 'Düşük Risk';
                this.showDetailPanel(
                  [],
                  `${riskLabel} Seviyesindeki Öğrenciler`,
                  `Risk skoru ${clickData.minRisk}-${clickData.maxRisk} aralığında öğrenci bulunamadı`
                );
              }
            } catch (error) {
              console.error('Risk seviyesi öğrencileri alınamadı:', error);
            }
          }
        }
      );
    }
    
    // KATMAN 2: GRAFİK 2 - Danışman Yük Dengesi (Bar Chart)
    const loadContainer = document.getElementById('load-heatmap-container');
    if (loadContainer && data?.danismanYuk) {
      this.components.loadHeatmap = new LoadHeatmap(
        loadContainer,
        data.danismanYuk,
        async (clickedData, type, title) => {
          // Danışmanın öğrencilerini detay panelinde göster
          console.log('LoadHeatmap click:', { clickedData, type, title });
          if (clickedData && Array.isArray(clickedData) && clickedData.length > 0) {
            this.showDetailPanel(
              clickedData,
              title || 'Danışman Öğrenci Listesi',
              `Bu danışmanın ${clickedData.length} öğrencisi bulunmaktadır`
            );
          } else if (clickedData && Array.isArray(clickedData) && clickedData.length === 0) {
            // Boş liste durumu
            this.showDetailPanel(
              [],
              title || 'Danışman Öğrenci Listesi',
              'Bu danışmanın henüz öğrencisi bulunmamaktadır'
            );
          } else {
            console.warn('LoadHeatmap: Geçersiz veri', { clickedData });
          }
        }
      );
    }
    
    // KATMAN 2: GRAFİK 3 - Program Dağılımı (Pie)
    const programPieContainer = document.getElementById('program-pie-container');
    if (programPieContainer && data?.programDagilimi) {
      this.components.programPie = new ProgramPie(
        programPieContainer,
        data.programDagilimi,
        async (clickData) => {
          if (!clickData?.program_turu_id) return;
          try {
            const response = await ApiService.getOgrenciler({
              program_turu_id: clickData.program_turu_id
            });
            if (response?.success && response.data && response.data.length > 0) {
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
      );
    }
    
    // KATMAN 2: GRAFİK 4 - Süreç Hattı (Stacked Bar)
    const progressContainer = document.getElementById('progress-stacked-container');
    if (progressContainer && data?.surecHattiData) {
      this.components.progressStackedBar = new ProgressStackedBar(
        progressContainer,
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
            if (response?.success && response.data && response.data.length > 0) {
              const riskLabel =
                riskGroup === 'kritik' ? 'Kritik' :
                riskGroup === 'uyari' ? 'Uyarı' :
                'Normal';
              
              // Aşama ismini okunabilir hale getir
              const asamaMap = {
                'Ders': 'Ders Aşaması',
                'Yeterlik': 'Yeterlik Sınavı',
                'Tez_Onersi': 'Tez Önerisi',
                'TIK': 'TİK (Tez İzleme Komitesi)',
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
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-slate-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    `;
  }

  hideLoading() {
    // Loading zaten render() ile değiştirilecek
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 font-medium">${message}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Detay panelini göster (sayfanın altında)
   */
  showDetailPanel(students, title, subtitle) {
    if (!this.detailPanel) return;

    if (!students || students.length === 0) {
      this.detailPanel.innerHTML = `
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">${title || 'Öğrenci Listesi'}</h3>
            <button onclick="window.dashboardPage?.hideDetailPanel()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-slate-500">Öğrenci bulunamadı.</p>
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

  /**
   * Detay panelini gizle
   */
  hideDetailPanel() {
    if (this.detailPanel) {
      this.detailPanel.classList.add('hidden');
    }
  }

  /**
   * Sayfayı detay paneline scroll et
   */
  scrollToPanel() {
    setTimeout(() => {
      if (this.detailPanel) {
        this.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Öğrenci listesi render
   */
  renderStudentList(students, title, subtitle) {
    return `
      <div class="p-6">
        <!-- Header -->
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
          <button onclick="window.dashboardPage?.hideDetailPanel()" class="text-slate-400 hover:text-slate-600 transition-colors ml-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="mb-6">
          <input 
            type="text" 
            id="detail-panel-search" 
            placeholder="Öğrenci ara..." 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Program</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Skoru</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Aşama</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200" id="detail-panel-table-body">
              ${students.map(ogrenci => {
                const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
                const programAdi = ogrenci.program_adi || ogrenci.program_turleri?.program_adi || 'N/A';
                const mevcutAsama = ogrenci.mevcut_asinama || 'Bilinmiyor';
                const searchText = `${ogrenci.ad || ''} ${ogrenci.soyad || ''} ${programAdi} ${mevcutAsama}`.toLowerCase();
                
                return `
                  <tr class="detail-panel-row hover:bg-slate-50 transition-colors" data-search="${searchText.replace(/"/g, '&quot;')}">
                    <td class="px-6 py-4 whitespace-normal">
                      <div class="flex items-center">
                        <div class="w-10 h-10 ${this.getAvatarGradient(ogrenci.ogrenci_id)} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                          ${`${ogrenci.ad?.[0] || ''}${ogrenci.soyad?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-slate-900 break-words">${ogrenci.ad} ${ogrenci.soyad}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-normal text-sm text-slate-600 break-words">${programAdi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${this.getRiskBadgeClass(riskSkoru)}">
                        ${riskSkoru}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-normal text-center text-sm text-slate-600 break-words">${mevcutAsama}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'; window.dashboardPage?.hideDetailPanel();"
                        class="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
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

  /**
   * Öğrenci listesi arama fonksiyonu
   */
  setupStudentListSearch() {
    const input = document.getElementById('detail-panel-search');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.detail-panel-row');
      let visibleCount = 0;

      rows.forEach(row => {
        const searchText = row.getAttribute('data-search') || '';
        if (searchText.includes(searchTerm)) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  /**
   * Avatar gradient renkleri
   */
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

  /**
   * Risk badge class
   */
  getRiskBadgeClass(riskSkoru) {
    if (riskSkoru >= 70) return 'bg-red-100 text-red-800';
    if (riskSkoru >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  destroy() {
    // Component'leri temizle
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = {};
    
    // Detay panelini gizle
    if (this.detailPanel) {
      this.detailPanel.classList.add('hidden');
    }
  }
}
