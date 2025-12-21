/**
 * Ayarlar Page - Healthcare Dashboard Style
 * Sistem ayarları ve konfigürasyon
 */

export class AyarlarPage {
  constructor(container) {
    this.container = container;
  }

  async init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-50">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Ayarlar</h1>
            <p class="text-sm text-slate-600 mt-1">Sistem ayarları ve konfigürasyon</p>
          </div>

          <!-- Settings Sections -->
          <div class="space-y-6">
            <!-- Genel Ayarlar -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Genel Ayarlar</h3>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Sistem Adı</label>
                  <input 
                    type="text" 
                    value="DEÜ YBS KDS" 
                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    readonly
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Dil</label>
                  <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option>Türkçe</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tema</label>
                  <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option>Açık</option>
                    <option>Koyu</option>
                    <option>Sistem</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Bildirim Ayarları -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Bildirim Ayarları</h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-slate-700">E-posta Bildirimleri</label>
                    <p class="text-xs text-slate-500 mt-1">Kritik durumlar için e-posta bildirimleri</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Sistem İçi Bildirimler</label>
                    <p class="text-xs text-slate-500 mt-1">Dashboard'da bildirim göster</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-slate-700">TİK Uyarıları</label>
                    <p class="text-xs text-slate-500 mt-1">TİK toplantıları için otomatik uyarılar</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Risk Skoru Ayarları -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="px-6 py-4 border-b border-slate-200">
                <h3 class="text-base font-semibold text-slate-900">Risk Skoru Eşikleri</h3>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Düşük Risk (0-30)</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      value="30" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                    <span class="text-sm text-slate-600">ve altı</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Orta Risk (31-50)</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      value="31" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                    <span class="text-sm text-slate-600">-</span>
                    <input 
                      type="number" 
                      value="50" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Yüksek Risk (51-70)</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      value="51" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                    <span class="text-sm text-slate-600">-</span>
                    <input 
                      type="number" 
                      value="70" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Kritik Risk (71-100)</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      value="71" 
                      class="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      readonly
                    />
                    <span class="text-sm text-slate-600">ve üzeri</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kaydet Butonu -->
            <div class="flex justify-end">
              <button 
                class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Ayarları Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

