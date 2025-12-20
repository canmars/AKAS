/**
 * DashboardModal - Unified Modal System
 * Modes: SINGLE_STUDENT (Profile View) | STUDENT_LIST (Table View)
 */
import ApiService from '../../../services/ApiService.js';
import formatters from '../../../utils/formatters.js';

export class DashboardModal {
  constructor(container) {
    this.container = container;
    this.mode = null; // 'SINGLE_STUDENT' | 'STUDENT_LIST'
    this.isVisible = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div id="dashboard-modal-backdrop" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
        <div id="dashboard-modal-content" class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0">
          <!-- Dinamik içerik buraya gelecek -->
        </div>
      </div>
    `;

    const backdrop = document.getElementById('dashboard-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.hide();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show Single Student Profile
   */
  async showStudent(ogrenciId) {
    if (!ogrenciId) {
      console.error('DashboardModal: Öğrenci ID gerekli');
      return;
    }

    this.mode = 'SINGLE_STUDENT';
    this.show();
    
    const content = document.getElementById('dashboard-modal-content');
    if (!content) return;

    content.innerHTML = this.renderLoading();

    try {
      const response = await ApiService.getOgrenciById(ogrenciId);
      const ogrenci = response?.data;
      
      if (!ogrenci) {
        content.innerHTML = this.renderError('Öğrenci bilgileri alınamadı');
        return;
      }

      const riskReasons = this.calculateRiskReasons(ogrenci);
      content.innerHTML = this.renderStudentProfile(ogrenci, riskReasons);
    } catch (error) {
      console.error('DashboardModal: Öğrenci detayı alınamadı', error);
      content.innerHTML = this.renderError('Öğrenci detayları yüklenirken bir hata oluştu');
    }
  }

  /**
   * Show Student List (Table)
   */
  showStudentList(students, title, subtitle) {
    if (!students || students.length === 0) {
      console.warn('DashboardModal: Öğrenci listesi boş');
      return;
    }

    this.mode = 'STUDENT_LIST';
    this.show();
    
    const content = document.getElementById('dashboard-modal-content');
    if (!content) return;

    content.innerHTML = this.renderStudentList(students, title, subtitle);
    this.setupStudentListSearch();
  }

  show() {
    this.isVisible = true;
    const backdrop = document.getElementById('dashboard-modal-backdrop');
    const content = document.getElementById('dashboard-modal-content');
    
    if (backdrop && content) {
      backdrop.classList.remove('hidden');
      // Trigger animation
      setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
      }, 10);
    }
  }

  hide() {
    this.isVisible = false;
    const backdrop = document.getElementById('dashboard-modal-backdrop');
    const content = document.getElementById('dashboard-modal-content');
    
    if (backdrop && content) {
      content.classList.remove('scale-100', 'opacity-100');
      content.classList.add('scale-95', 'opacity-0');
      
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
    }
  }

  // ============================================
  // RENDER METHODS
  // ============================================

  renderLoading() {
    return `
      <div class="p-12 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-slate-600">Yükleniyor...</p>
      </div>
    `;
  }

  renderError(message) {
    return `
      <div class="p-12 flex flex-col items-center justify-center">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-slate-700 font-semibold mb-2">Hata Oluştu</p>
        <p class="text-slate-500 text-sm">${message}</p>
        <button onclick="window.dashboardModal?.hide()" class="mt-6 px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
          Kapat
        </button>
      </div>
    `;
  }

  renderStudentProfile(ogrenci, riskReasons) {
    const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
    const avatarInitials = `${ogrenci.ad?.[0] || ''}${ogrenci.soyad?.[0] || ''}`.toUpperCase();
    const programAdi = ogrenci.program_turleri?.program_adi || ogrenci.program_adi || 'Bilinmiyor';
    const gunSayisi = ogrenci.gun_sayisi || 0;

    return `
      <div class="p-8">
        <!-- Close Button -->
        <button onclick="window.dashboardModal?.hide()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Header: Student Photo & Name -->
        <div class="flex items-center space-x-6 mb-8 pb-6 border-b border-slate-200">
          <div class="w-24 h-24 ${this.getAvatarGradient(ogrenci.ogrenci_id)} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            ${avatarInitials}
          </div>
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-1">${ogrenci.ad} ${ogrenci.soyad}</h2>
            <p class="text-lg text-slate-600">${programAdi}</p>
            ${gunSayisi > 180 ? `
              <div class="mt-2 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                ${gunSayisi} gündür giriş yok
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Body: Risk Score & Reasons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left: Risk Score -->
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl flex flex-col items-center justify-center border border-slate-200">
            <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Risk Skoru</p>
            <div class="text-8xl font-black ${this.getRiskColor(riskSkoru)} mb-4">${riskSkoru}</div>
            ${this.getRiskBadge(riskSkoru)}
          </div>

          <!-- Right: Risk Reasons -->
          <div class="bg-white p-6 rounded-xl border border-slate-200">
            <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.3 2.647-1.3 3.412 0l7.66 13.044c.765 1.3-.143 2.956-1.706 2.956H2.293c-1.563 0-2.471-1.656-1.706-2.956L8.257 3.099zM10 11a1 1 0 100-2 1 1 0 000 2zm-1 4a1 1 0 102 0 1 1 0 00-2 0z" clip-rule="evenodd"></path>
              </svg>
              Risk Nedenleri
            </p>
            <ul class="space-y-3 text-slate-700">
              ${riskReasons.length > 0 ? riskReasons.map(reason => `
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>${reason}</span>
                </li>
              `).join('') : '<li class="text-emerald-600 font-semibold">✓ Tebrikler! Öğrencinin belirgin bir riski bulunmamaktadır.</li>'}
            </ul>
          </div>
        </div>

        <!-- Footer: Action Button -->
        <div class="mt-8 pt-6 border-t border-slate-200 flex justify-end space-x-4">
          <button 
            onclick="window.dashboardModal?.hide()"
            class="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors">
            Kapat
          </button>
          <button 
            onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'; window.dashboardModal?.hide();"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Öğrenci Kartına Git
          </button>
        </div>
      </div>
    `;
  }

  renderStudentList(students, title, subtitle) {
    return `
      <div class="p-8">
        <!-- Close Button -->
        <button onclick="window.dashboardModal?.hide()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Header (Sticky) -->
        <div class="mb-6 pb-6 border-b border-slate-200">
          <div class="flex flex-col gap-3">
            <h2 class="text-2xl font-bold text-slate-900 leading-tight whitespace-normal break-words">${title}</h2>
            ${subtitle ? `<p class="text-slate-600 leading-snug whitespace-normal break-words">${subtitle}</p>` : ''}

            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">Toplam öğrenci:</span>
                <span class="text-2xl font-bold text-blue-700">${students.length}</span>
              </div>

              <div class="w-full md:w-96">
                <label class="sr-only" for="dashboard-student-search">Öğrenci ara</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </span>
                  <input
                    id="dashboard-student-search"
                    type="text"
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-slate-900"
                    placeholder="Ad, soyad, program veya aşama ile ara"
                  />
                </div>
                <p id="dashboard-student-search-meta" class="mt-2 text-sm text-slate-500"></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Table -->
        <div class="overflow-x-auto">
          <table class="w-full table-auto divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Program</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Skoru</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              ${students.map(ogrenci => {
                const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
                const programAdi = ogrenci.program_adi || ogrenci.program_turleri?.program_adi || 'N/A';
                const durumStatus = ogrenci.durum_statüsü || ogrenci.durum_statusu || 'NORMAL';
                const asama = ogrenci.mevcut_asinama || ogrenci.mevcut_asinama || '';
                const searchText = `${ogrenci.ad || ''} ${ogrenci.soyad || ''} ${programAdi} ${asama}`.toLowerCase();
                
                return `
                  <tr class="dashboard-student-row hover:bg-slate-50 transition-colors cursor-pointer" data-search="${searchText.replace(/"/g, '&quot;')}" onclick="window.dashboardModal?.showStudent('${ogrenci.ogrenci_id}')">
                    <td class="px-6 py-4 align-top">
                      <div class="flex items-center">
                        <div class="w-10 h-10 ${this.getAvatarGradient(ogrenci.ogrenci_id)} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          ${`${ogrenci.ad?.[0] || ''}${ogrenci.soyad?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-slate-900 whitespace-normal break-words leading-snug">${ogrenci.ad} ${ogrenci.soyad}</div>
                          ${asama ? `<div class="mt-1 text-xs text-slate-500 whitespace-normal break-words">Aşama: ${asama}</div>` : ''}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 align-top text-sm text-slate-600 whitespace-normal break-words leading-snug">${programAdi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${this.getRiskBadgeClass(riskSkoru)}">
                        ${riskSkoru}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      ${this.getDurumBadge(durumStatus)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onclick="event.stopPropagation(); window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'; window.dashboardModal?.hide();"
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

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-slate-200 flex justify-end">
          <button 
            onclick="window.dashboardModal?.hide()"
            class="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">
            Kapat
          </button>
        </div>
      </div>
    `;
  }

  setupStudentListSearch() {
    const input = document.getElementById('dashboard-student-search');
    const meta = document.getElementById('dashboard-student-search-meta');
    if (!input) return;

    const rows = Array.from(document.querySelectorAll('.dashboard-student-row'));
    const updateMeta = (visibleCount, totalCount) => {
      if (!meta) return;
      meta.textContent = `${visibleCount} / ${totalCount} öğrenci gösteriliyor`;
    };

    updateMeta(rows.length, rows.length);

    const apply = () => {
      const q = (input.value || '').trim().toLowerCase();
      let visible = 0;
      rows.forEach(row => {
        const hay = (row.getAttribute('data-search') || '').toLowerCase();
        const show = q.length === 0 || hay.includes(q);
        row.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      updateMeta(visible, rows.length);
    };

    input.addEventListener('input', apply);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  calculateRiskReasons(ogrenci) {
    const reasons = [];
    const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
    const gunSayisi = ogrenci.gun_sayisi || 0;
    const seminerDurum = ogrenci.seminer_durumu || '';
    const mevcutYariyil = ogrenci.mevcut_yariyil || 0;

    if (gunSayisi > 180) {
      reasons.push(`${gunSayisi} gündür sisteme giriş yapılmamış (Akademik Kopuş Riski)`);
    }

    if (seminerDurum === 'seminer_basarisiz') {
      reasons.push('Seminer dersi başarısız (Yeterlik aşaması gerekli)');
    }

    if (seminerDurum === 'seminer_yok' && mevcutYariyil >= 4) {
      reasons.push('4. yarıyılda seminer dersi eksik (Acil eylem gerekli)');
    }

    if (riskSkoru >= 70) {
      reasons.push('Risk skoru kritik seviyede (70+)');
    }

    return reasons;
  }

  getRiskColor(riskSkoru) {
    if (riskSkoru >= 70) return 'text-red-600';
    if (riskSkoru >= 50) return 'text-orange-500';
    if (riskSkoru >= 30) return 'text-yellow-500';
    return 'text-emerald-500';
  }

  getRiskBadge(riskSkoru) {
    if (riskSkoru >= 70) {
      return '<span class="px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-full">KRİTİK RİSK</span>';
    } else if (riskSkoru >= 50) {
      return '<span class="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">YÜKSEK RİSK</span>';
    } else if (riskSkoru >= 30) {
      return '<span class="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">ORTA RİSK</span>';
    }
    return '<span class="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">DÜŞÜK RİSK</span>';
  }

  getRiskBadgeClass(riskSkoru) {
    if (riskSkoru >= 70) return 'bg-red-100 text-red-700';
    if (riskSkoru >= 50) return 'bg-orange-100 text-orange-700';
    if (riskSkoru >= 30) return 'bg-yellow-100 text-yellow-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  getDurumBadge(durumStatus) {
    if (durumStatus === 'ACİL_EYLEM') {
      return '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">ACİL EYLEM</span>';
    } else if (durumStatus === 'UYARI') {
      return '<span class="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">UYARI</span>';
    }
    return '<span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">NORMAL</span>';
  }

  getAvatarGradient(ogrenciId) {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600'
    ];
    const hash = ogrenciId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return gradients[hash % gradients.length];
  }

  destroy() {
    this.hide();
    this.container.innerHTML = '';
  }
}

