/**
 * Veri Kalitesi Page
 * Excel yükleme geçmişi, değişiklik logu ve veri doğrulama dashboard
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';
import Chart from 'chart.js/auto';

export class VeriKalitesiPage {
  constructor(container) {
    this.container = container;
    this.charts = {};
  }

  async init() {
    this.showLoading();
    try {
      await this.loadData();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Veri kalitesi yükleme hatası:', error);
      this.showError('Veri kalitesi verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [yuklemeGecmisi, degisiklikLogu, yuklemeIstatistikleri, degisiklikIstatistikleri, veriDogrulama] = await Promise.all([
      ApiService.getExcelYuklemeGecmisi({ limit: 20 }),
      ApiService.getDegisiklikLogu({ limit: 50 }),
      ApiService.getYuklemeIstatistikleri(),
      ApiService.getDegisiklikIstatistikleri(),
      ApiService.getVeriDogrulamaKontrolu()
    ]);

    this.data = {
      yuklemeGecmisi: yuklemeGecmisi.data || [],
      degisiklikLogu: degisiklikLogu.data || [],
      yuklemeIstatistikleri: yuklemeIstatistikleri.data || {},
      degisiklikIstatistikleri: degisiklikIstatistikleri.data || {},
      veriDogrulama: veriDogrulama.data || {}
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Sayfa Başlığı -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Veri Kalitesi ve Audit Merkezi</h1>
            <p class="text-sm text-slate-600 mt-1">Excel yükleme geçmişi, değişiklik logu ve veri doğrulama</p>
          </div>
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
        </div>

        <!-- KPI Kartları -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div class="text-sm text-slate-600 mb-1">Toplam Yükleme</div>
            <div class="text-2xl font-bold text-slate-900">${this.data.yuklemeIstatistikleri.toplam_yukleme || 0}</div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div class="text-sm text-slate-600 mb-1">Başarı Oranı</div>
            <div class="text-2xl font-bold text-green-600">${(this.data.yuklemeIstatistikleri.basari_orani || 0).toFixed(1)}%</div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div class="text-sm text-slate-600 mb-1">Toplam Değişiklik</div>
            <div class="text-2xl font-bold text-slate-900">${this.data.degisiklikIstatistikleri.toplam_degisiklik || 0}</div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div class="text-sm text-slate-600 mb-1">Veri Sorunları</div>
            <div class="text-2xl font-bold text-red-600">${this.data.veriDogrulama.toplam_sorun || 0}</div>
          </div>
        </div>

        <!-- Excel Yükleme Geçmişi -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Excel Yükleme Geçmişi</h3>
                <p class="text-xs text-slate-600">Yükleme başarı/başarısızlık oranları ve hata detayları</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Yükleme Durumu Dağılımı</h4>
              <canvas id="yukleme-durum-chart" style="height: 250px;"></canvas>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Yükleme Geçmişi Tablosu</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Dosya Adı</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Yükleyen</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Tarih</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Durum</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Başarılı Satır</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Hatalı Satır</th>
                    </tr>
                  </thead>
                  <tbody id="yukleme-tablo-body" class="bg-white divide-y divide-slate-200">
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Değişiklik Logu -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Değişiklik Logu</h3>
                <p class="text-xs text-slate-600">Tüm veri değişikliklerinin audit trail kaydı</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="mb-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Tablo Bazlı Değişiklik İstatistikleri</h4>
              <canvas id="tablo-degisiklik-chart" style="height: 250px;"></canvas>
            </div>
            <div class="mt-6">
              <h4 class="text-sm font-medium text-slate-700 mb-3">Son Değişiklikler</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Tablo</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Değişiklik Türü</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Değiştiren</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Tarih</th>
                    </tr>
                  </thead>
                  <tbody id="degisiklik-tablo-body" class="bg-white divide-y divide-slate-200">
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Veri Doğrulama Dashboard -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Veri Doğrulama Dashboard</h3>
                <p class="text-xs text-slate-600">Geçersiz veri tespiti ve eksik veri analizi</p>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div id="veri-dogrulama-list" class="space-y-3"></div>
          </div>
        </div>
      </div>
    `;

    this.renderCharts();
    this.renderTables();
    this.renderVeriDogrulama();
  }

  renderCharts() {
    // Yükleme Durum Chart
    this.renderYuklemeDurumChart();
    
    // Tablo Değişiklik Chart
    this.renderTabloDegisiklikChart();
  }

  renderYuklemeDurumChart() {
    const ctx = document.getElementById('yukleme-durum-chart');
    if (!ctx) return;

    const stats = this.data.yuklemeIstatistikleri;
    const labels = ['Başarılı', 'Kısmi Başarılı', 'Başarısız'];
    const data = [
      stats.basarili_yukleme || 0,
      stats.kismi_basarili || 0,
      stats.basarisiz_yukleme || 0
    ];

    this.charts.yuklemeDurum = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.5)',
            'rgba(249, 115, 22, 0.5)',
            'rgba(239, 68, 68, 0.5)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(249, 115, 22)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });
  }

  renderTabloDegisiklikChart() {
    const ctx = document.getElementById('tablo-degisiklik-chart');
    if (!ctx) return;

    const tabloBazli = this.data.degisiklikIstatistikleri.tablo_bazli || [];
    const labels = tabloBazli.map(t => t.tablo_adi);
    const insertData = tabloBazli.map(t => t.insert);
    const updateData = tabloBazli.map(t => t.update);
    const deleteData = tabloBazli.map(t => t.delete);

    this.charts.tabloDegisiklik = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'INSERT',
            data: insertData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)'
          },
          {
            label: 'UPDATE',
            data: updateData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'DELETE',
            data: deleteData,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)'
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
            beginAtZero: true
          }
        }
      }
    });
  }

  renderTables() {
    // Yükleme Tablosu
    const yuklemeTabloBody = document.getElementById('yukleme-tablo-body');
    if (yuklemeTabloBody) {
      yuklemeTabloBody.innerHTML = this.data.yuklemeGecmisi.map(item => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 text-sm text-slate-900">${item.dosya_adi || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${item.kullanicilar?.ad || ''} ${item.kullanicilar?.soyad || ''}
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${item.yukleme_tarihi ? new Date(item.yukleme_tarihi).toLocaleDateString('tr-TR') : 'N/A'}
          </td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
              item.yukleme_durumu === 'Basarili' ? 'bg-green-100 text-green-800' :
              item.yukleme_durumu === 'Kismi_Basarili' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }">
              ${item.yukleme_durumu || 'N/A'}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">${item.basarili_satir_sayisi || 0}</td>
          <td class="px-4 py-3 text-sm text-slate-600">${item.hatali_satir_sayisi || 0}</td>
        </tr>
      `).join('');
    }

    // Değişiklik Tablosu
    const degisiklikTabloBody = document.getElementById('degisiklik-tablo-body');
    if (degisiklikTabloBody) {
      degisiklikTabloBody.innerHTML = this.data.degisiklikLogu.slice(0, 20).map(item => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3 text-sm text-slate-900">${item.tablo_adi || 'N/A'}</td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
              item.degisiklik_turu === 'INSERT' ? 'bg-green-100 text-green-800' :
              item.degisiklik_turu === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }">
              ${item.degisiklik_turu || 'N/A'}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${item.kullanicilar?.ad || ''} ${item.kullanicilar?.soyad || ''}
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${item.degisiklik_tarihi ? new Date(item.degisiklik_tarihi).toLocaleDateString('tr-TR') : 'N/A'}
          </td>
        </tr>
      `).join('');
    }
  }

  renderVeriDogrulama() {
    const container = document.getElementById('veri-dogrulama-list');
    if (!container) return;

    const kontroller = this.data.veriDogrulama.kontroller || [];
    if (kontroller.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-500">Veri doğrulama sorunu bulunamadı.</p>';
      return;
    }

    container.innerHTML = kontroller.map(item => `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <h5 class="font-medium text-red-900">${item.kategori || 'Bilinmeyen'}</h5>
            <p class="text-sm text-red-700">${item.sorun || 'Sorun tespit edildi'}</p>
            <p class="text-xs text-red-600 mt-1">${item.sayi || 0} kayıt etkilendi</p>
          </div>
          <div class="px-3 py-1 bg-red-200 rounded-full">
            <span class="text-xs font-semibold text-red-900">${item.sayi || 0}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Event listener'lar gerekirse buraya eklenebilir
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

