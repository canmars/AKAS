/**
 * Milestone Yönetimi Page
 * Milestone takibi ve TİK yönetimi
 */

import ApiService from '../../services/ApiService.js';
import Chart from 'chart.js/auto';

export class MilestoneYonetimPage {
  constructor(container) {
    this.container = container;
    this.charts = {};
  }

  async init() {
    this.showLoading();
    try {
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Milestone yönetimi yükleme hatası:', error);
      this.showError('Milestone verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [milestonelar, gecikmisMilestonelar, tikToplantilari] = await Promise.all([
      ApiService.getMilestoneListesi(),
      ApiService.getGecikmisMilestonelar(),
      ApiService.getTikToplantilari()
    ]);

    this.data = {
      milestonelar: milestonelar.data || [],
      gecikmisMilestonelar: gecikmisMilestonelar.data || [],
      tikToplantilari: tikToplantilari.data || []
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Tez Süreçleri</h1>
            <p class="text-sm text-slate-600 mt-1">Milestone takibi ve TİK toplantı yönetimi</p>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Toplam Milestone - Purple -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${this.data.milestonelar.length}</div>
                <div class="text-sm text-slate-600">Toplam Milestone</div>
              </div>
            </div>

            <!-- Gecikmiş - Red -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${this.data.gecikmisMilestonelar.length}</div>
                <div class="text-sm text-slate-600">Gecikmiş</div>
              </div>
            </div>

            <!-- TİK Toplantıları - Blue -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${this.data.tikToplantilari.length}</div>
                <div class="text-sm text-slate-600">TİK Toplantıları</div>
              </div>
            </div>
          </div>

          <!-- Gecikmiş Milestone'lar -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
            <div class="px-6 py-4 border-b border-slate-200">
              <h3 class="text-base font-semibold text-slate-900">Gecikmiş Milestone'lar</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Milestone Türü</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Hedef Tarih</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Gecikme (Gün)</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody id="gecikmis-milestone-body" class="bg-white divide-y divide-slate-200">
                </tbody>
              </table>
            </div>
          </div>

          <!-- TİK Toplantıları -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-6 py-4 border-b border-slate-200">
              <h3 class="text-base font-semibold text-slate-900">TİK Toplantıları</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Toplantı Tarihi</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Katılım Durumu</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rapor Verildi</th>
                  </tr>
                </thead>
                <tbody id="tik-tablo-body" class="bg-white divide-y divide-slate-200">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderTables();
  }

  renderTables() {
    // Gecikmiş Milestone Tablosu
    const gecikmisBody = document.getElementById('gecikmis-milestone-body');
    if (gecikmisBody) {
      gecikmisBody.innerHTML = this.data.gecikmisMilestonelar.map(item => {
        const hedefTarih = new Date(item.hedef_tarih);
        const bugun = new Date();
        const gecikmeGun = Math.floor((bugun - hedefTarih) / (1000 * 60 * 60 * 24));

        return `
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-3 text-sm text-slate-900">
              ${item.ogrenci?.ad || ''} ${item.ogrenci?.soyad || ''}
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">${item.milestone_turu || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-slate-600">${hedefTarih.toLocaleDateString('tr-TR')}</td>
            <td class="px-4 py-3 text-sm text-red-600 font-medium">${gecikmeGun} gün</td>
            <td class="px-4 py-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ${item.durum || 'Gecikmis'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    // TİK Toplantıları Tablosu
    const tikBody = document.getElementById('tik-tablo-body');
    if (tikBody) {
      tikBody.innerHTML = this.data.tikToplantilari.map(item => {
        return `
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-3 text-sm text-slate-900">
              ${item.ogrenci?.ad || ''} ${item.ogrenci?.soyad || ''}
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">
              ${item.toplanti_tarihi ? new Date(item.toplanti_tarihi).toLocaleDateString('tr-TR') : 'N/A'}
            </td>
            <td class="px-4 py-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium ${
                item.katilim_durumu === 'Katildi' ? 'bg-green-100 text-green-800' :
                item.katilim_durumu === 'Katilmadi' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }">
                ${item.katilim_durumu || 'N/A'}
              </span>
            </td>
            <td class="px-4 py-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium ${item.rapor_verildi_mi ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
                ${item.rapor_verildi_mi ? 'Evet' : 'Hayır'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
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

