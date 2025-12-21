/**
 * TİK Toplantı Takvimi Page - Tableau Style
 * Yaklaşan toplantılar, takvim görünümü, toplantı listesi
 */

import ApiService from '../../services/ApiService.js';
import { ActionableList } from '../components/ActionableList.js';
import { ContextualFilters } from '../components/ContextualFilters.js';
import formatters from '../../utils/formatters.js';

export class TikToplantiTakvimiPage {
  constructor(container) {
    this.container = container;
    this.data = null;
    this.filters = {};
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      
      // URL'den filtreleri al
      const urlParams = new URLSearchParams(window.location.search);
      const ogrenciId = urlParams.get('ogrenci_id');
      if (ogrenciId) {
        this.filters.ogrenci_id = ogrenciId;
      }

      await this.loadData();
      this.render();
    } catch (error) {
      console.error('TİK toplantı takvimi yükleme hatası:', error);
      this.showError('TİK toplantı takvimi yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [yaklasanResponse, tumToplantilarResponse] = await Promise.all([
      ApiService.getYaklasanTikToplantilari().catch(() => ({ success: false, data: { data: [] } })),
      ApiService.getTikToplantilari(this.filters).catch(() => ({ success: false, data: [] }))
    ]);

    const yaklasan = Array.isArray(yaklasanResponse?.data) ? yaklasanResponse.data : (yaklasanResponse?.data?.data || []);
    const tumToplantilar = Array.isArray(tumToplantilarResponse?.data) ? tumToplantilarResponse.data : (tumToplantilarResponse?.data?.data || []);

    this.data = {
      yaklasan: yaklasan,
      tumToplantilar: tumToplantilar
    };
  }

  render() {
    if (!this.data) return;

    const { yaklasan, tumToplantilar } = this.data;

    this.container.innerHTML = `
      <div class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-normal text-gray-900">TİK Toplantı Takvimi</h1>
                <p class="text-sm text-gray-500 mt-1">Tez İzleme Komitesi toplantı takibi</p>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  onclick="window.location.hash='/milestone/tik?action=create'"
                  class="btn btn-primary btn-sm"
                >
                  Yeni Toplantı
                </button>
                <button 
                  onclick="window.location.hash='/dashboard'"
                  class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  ← Dashboard'a Dön
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-6 max-w-7xl mx-auto">
          <!-- Yaklaşan Toplantılar -->
          ${yaklasan.length > 0 ? `
            <div class="mb-6" id="yaklasan-toplantilar-container">
              <!-- Actionable list will be rendered here -->
            </div>
          ` : ''}

          <!-- Takvim Görünümü -->
          <div class="card mb-6" id="takvim-gorunumu-container">
            <!-- Calendar will be rendered here -->
          </div>

          <!-- Toplantı Listesi -->
          <div class="card" id="toplanti-liste-container">
            <!-- Table will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Render components
    this.renderYaklasanToplantilar();
    this.renderTakvimGorunumu();
    this.renderToplantiListe();
  }

  renderYaklasanToplantilar() {
    const container = this.container.querySelector('#yaklasan-toplantilar-container');
    if (!container || !this.data.yaklasan.length) return;

    const yaklasanItems = this.data.yaklasan.map(tik => {
      const kalanGun = this.calculateDaysUntil(tik.toplanti_tarihi);
      const priority = kalanGun <= 15 ? 'high' : kalanGun <= 30 ? 'medium' : 'low';
      
      return {
        id: `tik-${tik.topanti_id}`,
        priority,
        title: `${tik.ogrenci?.ad || ''} ${tik.ogrenci?.soyad || ''} - TİK Toplantısı`,
        description: `Tarih: ${formatters.formatDate(tik.toplanti_tarihi)}`,
        meta: `Kalan Süre: ${kalanGun} gün`,
        badge: { type: priority, label: kalanGun <= 15 ? '1 Ay Uyarı' : 'Yaklaşan' },
        actions: [
          {
            label: 'TİK Kaydı Girişi',
            primary: true,
            onClick: () => {
              window.location.hash = `/milestone/tik?toplanti_id=${tik.topanti_id}`;
            }
          },
          {
            label: 'Öğrenci Detayı',
            onClick: () => {
              window.location.hash = `/ogrenci/${tik.ogrenci_id}`;
            }
          }
        ],
        onClick: () => {
          window.location.hash = `/ogrenci/${tik.ogrenci_id}`;
        }
      };
    });

    new ActionableList(container, {
      title: 'Yaklaşan TİK Toplantıları',
      items: yaklasanItems,
      onItemClick: (item) => {
        if (item.onClick) {
          item.onClick();
        }
      }
    });
  }

  renderTakvimGorunumu() {
    const container = this.container.querySelector('#takvim-gorunumu-container');
    if (!container) return;

    const { tumToplantilar } = this.data;
    
    // Aylık takvim oluştur
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Ayın ilk günü
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Toplantıları tarihe göre grupla
    const toplantilarByDate = {};
    tumToplantilar.forEach(tik => {
      const date = new Date(tik.toplanti_tarihi).toISOString().split('T')[0];
      if (!toplantilarByDate[date]) {
        toplantilarByDate[date] = [];
      }
      toplantilarByDate[date].push(tik);
    });

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Takvim Görünümü</h3>
        <p class="text-sm text-gray-500 mt-1">${today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-7 gap-1">
          <!-- Hafta günleri başlıkları -->
          ${['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => `
            <div class="text-center text-xs font-semibold text-gray-500 py-2">
              ${day}
            </div>
          `).join('')}
          
          <!-- Boş hücreler (ayın ilk gününden önce) -->
          ${Array(startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1).fill(0).map(() => `
            <div class="aspect-square"></div>
          `).join('')}
          
          <!-- Günler -->
          ${Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const toplantilar = toplantilarByDate[dateStr] || [];
            const isToday = dateStr === today.toISOString().split('T')[0];
            const isPast = date < today && !isToday;
            
            return `
              <div 
                class="aspect-square border border-gray-200 rounded p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-blue-50 border-blue-300' : ''
                } ${isPast ? 'opacity-50' : ''}"
                onclick="window.tikTakvimPage?.showDateToplantilari('${dateStr}')"
              >
                <div class="text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}">
                  ${day}
                </div>
                ${toplantilar.length > 0 ? `
                  <div class="mt-1">
                    ${toplantilar.slice(0, 2).map(tik => `
                      <div class="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800 mb-0.5 truncate" title="${tik.ogrenci?.ad || ''} ${tik.ogrenci?.soyad || ''}">
                        ${tik.ogrenci?.ad || 'TİK'} ${tik.ogrenci?.soyad || ''}
                      </div>
                    `).join('')}
                    ${toplantilar.length > 2 ? `
                      <div class="text-xs text-gray-500">
                        +${toplantilar.length - 2} daha
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Global erişim için
    window.tikTakvimPage = this;
  }

  renderToplantiListe() {
    const container = this.container.querySelector('#toplanti-liste-container');
    if (!container) return;

    const { tumToplantilar } = this.data;

    // Tarihe göre sırala (en yeni önce)
    const sortedToplantilar = [...tumToplantilar].sort((a, b) => {
      const dateA = new Date(a.toplanti_tarihi);
      const dateB = new Date(b.toplanti_tarihi);
      return dateB - dateA;
    });

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Toplantı Listesi</h3>
        <p class="text-sm text-gray-500 mt-1">Tüm TİK toplantı kayıtları</p>
      </div>
      <div class="card-body">
        ${sortedToplantilar.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılım</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rapor</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedToplantilar.map(tik => this.renderToplantiRow(tik)).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="text-center py-8 text-gray-500">
            TİK toplantı kaydı bulunamadı
          </div>
        `}
      </div>
    `;
  }

  renderToplantiRow(tik) {
    const katilimDurumu = tik.katilim_durumu || 'Bilinmiyor';
    const katilimClass = katilimDurumu === 'Katildi' ? 'text-green-600' : katilimDurumu === 'Katilmadi' ? 'text-red-600' : 'text-gray-600';
    const isPast = new Date(tik.toplanti_tarihi) < new Date();
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          ${formatters.formatDate(tik.toplanti_tarihi)}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">
            ${tik.ogrenci?.ad || ''} ${tik.ogrenci?.soyad || ''}
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
          ${tik.ogrenci?.program_turleri?.program_adi || 'N/A'}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="text-sm font-medium ${katilimClass}">
            ${katilimDurumu}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">
          ${tik.rapor_ozeti || '-'}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            ${tik.durum || 'Aktif'}
          </span>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
          ${isPast ? `
            <button 
              class="text-blue-600 hover:text-blue-800 font-medium mr-3"
              onclick="window.location.hash='/milestone/tik?toplanti_id=${tik.topanti_id}'"
            >
              Düzenle
            </button>
          ` : `
            <button 
              class="text-blue-600 hover:text-blue-800 font-medium mr-3"
              onclick="window.location.hash='/milestone/tik?toplanti_id=${tik.topanti_id}'"
            >
              Katılım Girişi
            </button>
          `}
          <button 
            class="text-gray-600 hover:text-gray-800 font-medium"
            onclick="window.location.hash='/ogrenci/${tik.ogrenci_id}'"
          >
            Öğrenci Detayı
          </button>
        </td>
      </tr>
    `;
  }

  showDateToplantilari(dateStr) {
    const { tumToplantilar } = this.data;
    const toplantilar = tumToplantilar.filter(tik => {
      const tikDate = new Date(tik.toplanti_tarihi).toISOString().split('T')[0];
      return tikDate === dateStr;
    });

    if (toplantilar.length === 0) {
      alert('Bu tarihte toplantı bulunmuyor.');
      return;
    }

    // Modal veya detay sayfasına yönlendir
    if (toplantilar.length === 1) {
      window.location.hash = `/milestone/tik?toplanti_id=${toplantilar[0].topanti_id}`;
    } else {
      // Birden fazla toplantı varsa listeyi göster
      const toplantilarList = toplantilar.map(t => 
        `${t.ogrenci?.ad || ''} ${t.ogrenci?.soyad || ''} - ${formatters.formatDate(t.toplanti_tarihi)}`
      ).join('\n');
      alert(`Bu tarihte ${toplantilar.length} toplantı var:\n\n${toplantilarList}`);
    }
  }

  calculateDaysUntil(date) {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    `;
  }

  hideLoading() {
    // Loading zaten render() ile değiştirilecek
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="text-red-600 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-900 mb-2">Hata</p>
          <p class="text-gray-600">${message}</p>
          <button 
            class="btn btn-primary mt-4"
            onclick="location.reload()"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    window.tikTakvimPage = null;
  }
}

