/**
 * Bölüm Başkanı Dashboard Page - Healthcare Dashboard Style
 * Modern, temiz ve karar destek odaklı arayüz
 * Görsel referans: Healthcare management dashboard
 */

import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class BolumBaskaniDashboardPage {
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
      console.error('Dashboard yükleme hatası:', error);
      this.showError('Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [kpiResponse, riskDagilimiResponse, programDagilimiResponse, danismanYukResponse, surecHattiResponse] = await Promise.all([
      ApiService.getKPIMetrics().catch(() => ({ success: false, data: {} })),
      ApiService.getRiskDagilimi().catch(() => ({ success: false, data: {} })),
      ApiService.getProgramDagilimi().catch(() => ({ success: false, data: [] })),
      ApiService.getDanismanYuk().catch(() => ({ success: false, data: [] })),
      ApiService.getSurecHatti().catch(() => ({ success: false, data: [] }))
    ]);

    this.data = {
      kpi: kpiResponse?.data || {},
      riskDagilimi: riskDagilimiResponse?.data || {},
      programDagilimi: programDagilimiResponse?.data || [],
      danismanYuk: danismanYukResponse?.data || [],
      surecHatti: surecHattiResponse?.data || []
    };

    // Docs'a göre risk dağılımı (0-30: Düşük, 31-50: Orta, 51-70: Yüksek, 71-100: Kritik)
    this.data.riskDagilimiDetay = {
      'Düşük Risk': this.data.riskDagilimi.dusuk || 0,
      'Orta Risk': this.data.riskDagilimi.orta || 0,
      'Yüksek Risk': this.data.riskDagilimi.yuksek || 0,
      'Kritik Risk': this.data.riskDagilimi.kritik || 0
    };

    // Program bazlı dağılım (Docs'a göre: Doktora, Tezli YL, Tezsiz YL İÖ, Tezsiz YL Uzaktan)
    this.data.programBazliDagilim = this.prepareProgramBazliDagilim();

    // Süreç hattı (Docs'a göre: Dersler → Yeterlik → Tez Önerisi → TİK → Savunma)
    this.data.surecHattiDetay = this.prepareSurecHatti();
  }

  prepareProgramBazliDagilim() {
    // Docs'a göre: Doktora, Tezli YL, Tezsiz YL İÖ, Tezsiz YL Uzaktan
    const dagilim = {
      'Doktora': 0,
      'Tezli Yüksek Lisans': 0,
      'Tezsiz YL (İÖ)': 0,
      'Tezsiz YL (Uzaktan)': 0
    };

    this.data.programDagilimi.forEach(program => {
      const programAdi = (program.program_adi || '').toLowerCase();
      if (programAdi.includes('doktora')) {
        dagilim['Doktora'] += program.toplam_ogrenci || 0;
      } else if (programAdi.includes('tezli')) {
        dagilim['Tezli Yüksek Lisans'] += program.toplam_ogrenci || 0;
      } else if (programAdi.includes('uzaktan') || programAdi.includes('uzaktan öğretim')) {
        dagilim['Tezsiz YL (Uzaktan)'] += program.toplam_ogrenci || 0;
      } else if (programAdi.includes('iö') || programAdi.includes('ikinci öğretim')) {
        dagilim['Tezsiz YL (İÖ)'] += program.toplam_ogrenci || 0;
      } else if (programAdi.includes('tezsiz')) {
        dagilim['Tezsiz YL (İÖ)'] += program.toplam_ogrenci || 0;
      }
    });

    return dagilim;
  }

  prepareSurecHatti() {
    // Docs'a göre: Dersler → Yeterlik → Tez Önerisi → TİK → Savunma
    const surecHatti = {
      'Dersler': 0,
      'Yeterlik': 0,
      'Tez Önerisi': 0,
      'TİK': 0,
      'Savunma': 0
    };

    if (this.data.surecHatti && this.data.surecHatti.length > 0) {
      this.data.surecHatti.forEach(item => {
        const asama = (item.asama_adi || '').toLowerCase();
        if (asama.includes('ders') || asama.includes('ders aşaması')) {
          surecHatti['Dersler'] += item.ogrenci_sayisi || 0;
        } else if (asama.includes('yeterlik')) {
          surecHatti['Yeterlik'] += item.ogrenci_sayisi || 0;
        } else if (asama.includes('tez önerisi') || asama.includes('öneri')) {
          surecHatti['Tez Önerisi'] += item.ogrenci_sayisi || 0;
        } else if (asama.includes('tik') || asama.includes('tez izleme')) {
          surecHatti['TİK'] += item.ogrenci_sayisi || 0;
        } else if (asama.includes('savunma')) {
          surecHatti['Savunma'] += item.ogrenci_sayisi || 0;
        }
      });
    } else {
      // Varsayılan dağılım
      const toplam = this.data.kpi.toplamOgrenci || 0;
      surecHatti['Dersler'] = Math.floor(toplam * 0.30);
      surecHatti['Yeterlik'] = Math.floor(toplam * 0.15);
      surecHatti['Tez Önerisi'] = Math.floor(toplam * 0.15);
      surecHatti['TİK'] = Math.floor(toplam * 0.25);
      surecHatti['Savunma'] = Math.floor(toplam * 0.15);
    }

    return surecHatti;
  }

  render() {
    if (!this.data) return;

    const { kpi, riskDagilimiDetay, programBazliDagilim, surecHattiDetay, danismanYuk } = this.data;
    const toplamOgrenci = kpi.toplamOgrenci || 0;
    const savunmaBekleyen = surecHattiDetay['Savunma'] || 0;
    const aktifDanisman = (kpi.aktifDanisman || this.data.danismanYuk?.length || 0);
    const mezuniyetHedefi = Math.floor(toplamOgrenci * 0.15);
    // Mezun sayısı için süreç hattından hesapla (eğer varsa) veya varsayılan değer
    const mezuniyetIlerleme = Math.floor(savunmaBekleyen * 0.3); // Savunma bekleyenlerin bir kısmı mezun olabilir

    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <!-- Main Content -->
        <div class="p-6">
          <!-- KPI Cards - Tam Renkli -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <!-- Toplam Lisansüstü Öğrenci - Purple -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <button class="text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${toplamOgrenci.toLocaleString('tr-TR')}</div>
                <div class="text-sm text-slate-600">Toplam Lisansüstü Öğrenci</div>
              </div>
            </div>

            <!-- Savunma Bekleyen Tezler - Light Blue -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <button class="text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${savunmaBekleyen}</div>
                <div class="text-sm text-slate-600">Savunma Bekleyen Tezler</div>
              </div>
            </div>

            <!-- Aktif Akademik Danışman - Orange -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <button class="text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${aktifDanisman}</div>
                <div class="text-sm text-slate-600">Aktif Akademik Danışman</div>
              </div>
            </div>

            <!-- Bu Dönem Mezuniyet - Pink -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-pink-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <button class="text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${mezuniyetIlerleme}/${mezuniyetHedefi}</div>
                <div class="text-sm text-slate-600">Bu Dönem Mezuniyet</div>
              </div>
            </div>
          </div>

          <!-- Charts Row - 3 Grafik Yan Yana (Docs'a göre) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Risk Dağılımı (Donut Chart) - Docs: 0-30 Düşük, 31-50 Orta, 51-70 Yüksek, 71-100 Kritik -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Risk Dağılımı</h3>
                <p class="text-xs text-slate-600 mt-1">Risk skoruna göre öğrenci dağılımı</p>
              </div>
              <div class="p-6">
                <canvas id="risk-dagilim-chart" style="height: 250px;"></canvas>
              </div>
            </div>

            <!-- Program Bazlı Dağılım (Donut Chart) - Docs: Doktora, Tezli YL, Tezsiz YL İÖ, Tezsiz YL Uzaktan -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Program Bazlı Dağılım</h3>
                <p class="text-xs text-slate-600 mt-1">Program türüne göre öğrenci sayısı</p>
              </div>
              <div class="p-6">
                <canvas id="program-dagilim-chart" style="height: 250px;"></canvas>
              </div>
            </div>

            <!-- Süreç Hattı (Bar Chart) - Docs: Dersler → Yeterlik → Tez Önerisi → TİK → Savunma -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Süreç Hattı</h3>
                <p class="text-xs text-slate-600 mt-1">Aşama bazlı öğrenci akışı</p>
              </div>
              <div class="p-6">
                <canvas id="surec-hatti-chart" style="height: 250px;"></canvas>
              </div>
            </div>
          </div>

          <!-- Bottom Row - 3 Bileşen -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Risk Trendi (Line Chart) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 class="text-base font-semibold text-slate-900">Risk Trendi</h3>
                <select class="text-xs text-slate-600 border border-slate-200 rounded px-2 py-1">
                  <option>Bugün</option>
                  <option>Bu Hafta</option>
                  <option>Bu Ay</option>
                </select>
              </div>
              <div class="p-6">
                <canvas id="risk-trend-chart" style="height: 200px;"></canvas>
              </div>
            </div>

            <!-- Danışman Yük Dengesi (Bar Chart) - Docs'a göre -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Danışman Yük Dengesi</h3>
                <p class="text-xs text-slate-600 mt-1">Kapasite kullanım oranları</p>
              </div>
              <div class="p-6">
                <canvas id="danisman-yuk-chart" style="height: 200px;"></canvas>
              </div>
            </div>

            <!-- Bu Ay Öğrenci Sayısı (Büyük Kart) -->
            <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl border border-slate-200 shadow-sm p-6 text-white">
              <div class="mb-4">
                <div class="text-sm font-medium text-indigo-100 mb-2">Bu Ay Öğrenci Sayısı</div>
                <div class="text-4xl font-bold mb-4">${toplamOgrenci.toLocaleString('tr-TR')}</div>
              </div>
              <div class="mt-4">
                <canvas id="aylik-trend-chart" style="height: 100px;"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render charts (Docs'a göre)
    this.renderRiskDagilimChart();
    this.renderProgramDagilimChart();
    this.renderSurecHattiChart();
    this.renderDanismanYukChart();
    this.renderRiskTrendChart();
    this.renderAylikTrendChart();
  }

  renderRiskDagilimChart() {
    const ctx = document.getElementById('risk-dagilim-chart');
    if (!ctx) return;

    const { riskDagilimiDetay } = this.data;
    const labels = Object.keys(riskDagilimiDetay);
    const data = Object.values(riskDagilimiDetay);
    const total = data.reduce((a, b) => a + b, 0);

    if (this.charts.riskDagilim) {
      this.charts.riskDagilim.destroy();
    }

    // Docs'a göre renkler: Düşük (yeşil), Orta (sarı), Yüksek (turuncu), Kritik (kırmızı)
    this.charts.riskDagilim = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Yeşil - Düşük Risk
            'rgba(234, 179, 8, 0.8)',   // Sarı - Orta Risk
            'rgba(245, 158, 11, 0.8)',  // Turuncu - Yüksek Risk
            'rgba(239, 68, 68, 0.8)'    // Kırmızı - Kritik Risk
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
            labels: {
              padding: 10,
              font: { size: 11 },
              usePointStyle: true
            }
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
                return `${label}: ${value} öğrenci (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderProgramDagilimChart() {
    const ctx = document.getElementById('program-dagilim-chart');
    if (!ctx) return;

    const { programBazliDagilim } = this.data;
    const labels = Object.keys(programBazliDagilim);
    const data = Object.values(programBazliDagilim);
    const total = data.reduce((a, b) => a + b, 0);

    if (this.charts.programDagilim) {
      this.charts.programDagilim.destroy();
    }

    // Docs'a göre: Doktora, Tezli YL, Tezsiz YL İÖ, Tezsiz YL Uzaktan
    this.charts.programDagilim = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',   // Purple - Doktora
            'rgba(99, 102, 241, 0.8)',   // Indigo - Tezli YL
            'rgba(245, 158, 11, 0.8)',   // Amber - Tezsiz YL İÖ
            'rgba(34, 197, 94, 0.8)'     // Green - Tezsiz YL Uzaktan
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
            labels: {
              padding: 10,
              font: { size: 11 },
              usePointStyle: true
            }
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
                return `${label}: ${value} öğrenci (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderSurecHattiChart() {
    const ctx = document.getElementById('surec-hatti-chart');
    if (!ctx) return;

    const { surecHattiDetay } = this.data;
    const labels = Object.keys(surecHattiDetay);
    const data = Object.values(surecHattiDetay);

    if (this.charts.surecHatti) {
      this.charts.surecHatti.destroy();
    }

    // Docs'a göre: Dersler → Yeterlik → Tez Önerisi → TİK → Savunma
    this.charts.surecHatti = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Öğrenci Sayısı',
          data: data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',   // Indigo
            'rgba(139, 92, 246, 0.8)',   // Purple
            'rgba(245, 158, 11, 0.8)',   // Amber
            'rgba(34, 197, 94, 0.8)',    // Green
            'rgba(239, 68, 68, 0.8)'     // Red
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(139, 92, 246)',
            'rgb(245, 158, 11)',
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1,
          borderRadius: 4
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 }, color: '#64748b' }
          }
        }
      }
    });
  }

  renderDanismanYukChart() {
    const ctx = document.getElementById('danisman-yuk-chart');
    if (!ctx) return;

    const { danismanYuk } = this.data;
    if (!danismanYuk || danismanYuk.length === 0) return;

    const labels = danismanYuk.slice(0, 8).map(d => {
      const ad = d.ad || '';
      const soyad = d.soyad || '';
      return `${ad.charAt(0)}. ${soyad}`;
    });
    const data = danismanYuk.slice(0, 8).map(d => d.kapasite_kullanim_yuzdesi || 0);

    if (this.charts.danismanYuk) {
      this.charts.danismanYuk.destroy();
    }

    // Kapasite kullanımına göre renk: <70 yeşil, 70-90 sarı, >90 kırmızı
    this.charts.danismanYuk = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Kapasite Kullanımı (%)',
          data: data,
          backgroundColor: data.map(yuzde => {
            if (yuzde >= 90) return 'rgba(239, 68, 68, 0.8)';  // Kırmızı
            if (yuzde >= 70) return 'rgba(245, 158, 11, 0.8)'; // Turuncu
            return 'rgba(34, 197, 94, 0.8)';                   // Yeşil
          }),
          borderWidth: 1,
          borderRadius: 4
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8,
            cornerRadius: 4,
            callbacks: {
              label: function(context) {
                return `Kapasite: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10 }, color: '#64748b' }
          }
        }
      }
    });
  }

  renderRiskTrendChart() {
    const ctx = document.getElementById('risk-trend-chart');
    if (!ctx) return;

    const labels = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
    const data = [45, 113, 87, 95, 78, 102];

    if (this.charts.riskTrend) {
      this.charts.riskTrend.destroy();
    }

    this.charts.riskTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Risk Skoru',
          data: data,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(245, 158, 11)',
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 8,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10 }, color: '#64748b' }
          }
        }
      }
    });
  }

  renderAylikTrendChart() {
    const ctx = document.getElementById('aylik-trend-chart');
    if (!ctx) return;

    const labels = ['14', '15', '16', '17', '18', '19'];
    const data = [180, 195, 210, 205, 232, 220];

    if (this.charts.aylikTrend) {
      this.charts.aylikTrend.destroy();
    }

    this.charts.aylikTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Öğrenci',
          data: data,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
          pointBorderColor: 'rgba(139, 92, 246, 1)',
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
            padding: 6,
            cornerRadius: 4,
            titleColor: '#fff',
            bodyColor: '#fff'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 9 }, color: 'rgba(255, 255, 255, 0.7)' }
          },
          y: {
            beginAtZero: false,
            grid: { display: false },
            ticks: { display: false }
          }
        }
      }
    });
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
    // Chart'ları temizle
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
