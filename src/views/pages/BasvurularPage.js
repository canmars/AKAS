/**
 * Başvurular Page - Healthcare Dashboard Style
 * Yeni başvurular ve başvuru yönetimi
 */

import ApiService from '../../services/ApiService.js';

export class BasvurularPage {
  constructor(container) {
    this.container = container;
    this.data = null;
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Başvurular yükleme hatası:', error);
      this.showError('Başvuru verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    // Başvurular API'si henüz yok, örnek veri kullanıyoruz
    this.data = {
      basvurular: [],
      bekleyen: 0,
      onaylanan: 0,
      reddedilen: 0
    };
  }

  render() {
    if (!this.data) return;

    const { basvurular, bekleyen, onaylanan, reddedilen } = this.data;
    const toplamBasvuru = basvurular.length;

    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Başvurular</h1>
            <p class="text-sm text-slate-600 mt-1">Yeni başvurular ve başvuru yönetimi</p>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <!-- Toplam Başvuru - Purple -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${toplamBasvuru}</div>
                <div class="text-sm text-slate-600">Toplam Başvuru</div>
              </div>
            </div>

            <!-- Bekleyen - Orange -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${bekleyen}</div>
                <div class="text-sm text-slate-600">Bekleyen</div>
              </div>
            </div>

            <!-- Onaylanan - Green -->
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
                <div class="text-3xl font-bold text-slate-900 mb-1">${onaylanan}</div>
                <div class="text-sm text-slate-600">Onaylanan</div>
              </div>
            </div>

            <!-- Reddedilen - Red -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-1">${reddedilen}</div>
                <div class="text-sm text-slate-600">Reddedilen</div>
              </div>
            </div>
          </div>

          <!-- Başvuru Listesi -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Başvuru Listesi</h3>
              <div class="flex items-center gap-3">
                <select id="filter-durum" class="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Tüm Durumlar</option>
                  <option value="Bekleyen">Bekleyen</option>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
                <input 
                  type="text" 
                  id="search-input"
                  placeholder="Ara..." 
                  class="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64"
                />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Başvuran</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Program</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Başvuru Tarihi</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Aksiyon</th>
                  </tr>
                </thead>
                <tbody id="basvuru-liste-body" class="bg-white divide-y divide-slate-200">
                  ${basvurular.length > 0 ? basvurular.map(basvuru => `
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">${basvuru.ad || ''} ${basvuru.soyad || ''}</div>
                        <div class="text-sm text-slate-500">${basvuru.email || 'N/A'}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-900">${basvuru.program_adi || 'N/A'}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-900">${new Date(basvuru.basvuru_tarihi || new Date()).toLocaleDateString('tr-TR')}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full ${this.getDurumBadgeClass(basvuru.durum)}">
                          ${basvuru.durum || 'Bekleyen'}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onclick="window.basvurularInstance?.showBasvuruDetay('${basvuru.basvuru_id}')"
                          class="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Detay →
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-500">
                        Henüz başvuru bulunmuyor.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    window.basvurularInstance = this;
  }

  getDurumBadgeClass(durum) {
    if (durum === 'Onaylandı') return 'bg-green-100 text-green-800';
    if (durum === 'Reddedildi') return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
  }

  showBasvuruDetay(basvuruId) {
    alert(`Başvuru detayı: ${basvuruId}`);
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
    if (window.basvurularInstance === this) {
      delete window.basvurularInstance;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

