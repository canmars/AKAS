/**
 * Student Detail Modal Component
 * Öğrenci detay modal'ı - Backdrop blur, şık tasarım
 * Grafik tıklamalarında açılır
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class StudentDetailModal {
  constructor(container) {
    this.container = container;
    this.currentOgrenciId = null;
    this.isVisible = false;
    this.render();
  }

  render() {
    // Modal HTML'i (başlangıçta gizli)
    this.container.innerHTML = `
      <div id="student-modal-backdrop" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div id="student-modal" class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
          <!-- Modal içeriği buraya dinamik olarak eklenecek -->
        </div>
      </div>
    `;

    // Backdrop tıklamasında kapat
    const backdrop = document.getElementById('student-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.hide();
        }
      });
    }

    // ESC tuşu ile kapat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  async show(ogrenciId) {
    if (!ogrenciId) {
      console.error('StudentDetailModal: ogrenciId gerekli');
      return;
    }

    this.currentOgrenciId = ogrenciId;
    this.isVisible = true;

    const backdrop = document.getElementById('student-modal-backdrop');
    const modal = document.getElementById('student-modal');

    if (!backdrop || !modal) {
      console.error('StudentDetailModal: Modal elementleri bulunamadı');
      return;
    }

    // Loading göster
    modal.innerHTML = this.renderLoading();

    // Modal'ı göster
    backdrop.classList.remove('hidden');

    try {
      // Öğrenci detayını çek
      const response = await ApiService.getOgrenciById(ogrenciId);
      const ogrenci = response?.data;

      if (!ogrenci) {
        modal.innerHTML = this.renderError('Öğrenci bilgisi bulunamadı');
        return;
      }

      // Risk nedenlerini hesapla
      const riskNedenleri = this.calculateRiskReasons(ogrenci);

      // Modal içeriğini render et
      modal.innerHTML = this.renderContent(ogrenci, riskNedenleri);
    } catch (error) {
      console.error('StudentDetailModal: Öğrenci detayı alınamadı', error);
      modal.innerHTML = this.renderError('Öğrenci bilgisi yüklenirken bir hata oluştu');
    }
  }

  hide() {
    this.isVisible = false;
    this.currentOgrenciId = null;

    const backdrop = document.getElementById('student-modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
  }

  renderLoading() {
    return `
      <div class="p-8 flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    `;
  }

  renderError(message) {
    return `
      <div class="p-8">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-red-700">${message}</p>
        </div>
        <button onclick="window.studentModal?.hide()" class="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
          Kapat
        </button>
      </div>
    `;
  }

  renderContent(ogrenci, riskNedenleri) {
    const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || 0;
    const riskColor = this.getRiskColor(riskSkoru);
    const riskBadge = this.getRiskBadge(riskSkoru);
    const programAdi = ogrenci.program_adi || ogrenci.program_turleri?.program_adi || 'Program bilgisi yok';
    const durumAdi = ogrenci.durum_adi || ogrenci.durum_turleri?.durum_adi || 'Aktif';

    // Avatar gradient (isim baş harflerine göre)
    const initials = `${ogrenci.ad?.[0] || ''}${ogrenci.soyad?.[0] || ''}`.toUpperCase();
    const avatarGradient = this.getAvatarGradient(ogrenci.ogrenci_id);

    return `
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <h2 class="text-xl font-bold text-slate-900">Öğrenci Detayları</h2>
        <button onclick="window.studentModal?.hide()" class="text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <!-- Üst Bölüm: Fotoğraf, Ad, Program -->
        <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200">
          <div class="flex-shrink-0">
            <div class="w-20 h-20 rounded-full ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              ${initials}
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-slate-900 mb-1">
              ${ogrenci.ad || ''} ${ogrenci.soyad || ''}
            </h3>
            <p class="text-slate-600">${programAdi}</p>
            <p class="text-sm text-slate-500 mt-1">${durumAdi}</p>
          </div>
        </div>

        <!-- Orta Bölüm: Risk Skoru ve Risk Nedenleri -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Sol: Risk Skoru -->
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
            <div class="text-center">
              <p class="text-sm font-medium text-slate-600 mb-2">Risk Skoru</p>
              <div class="text-5xl font-bold ${riskColor} mb-2">
                ${formatters.formatRiskSkoru(riskSkoru)}
              </div>
              ${riskBadge}
            </div>
          </div>

          <!-- Sağ: Risk Nedenleri -->
          <div>
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Risk Nedenleri</h4>
            <div class="space-y-2">
              ${riskNedenleri.length > 0 ? riskNedenleri.map(neden => `
                <div class="flex items-start space-x-2 p-2 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-red-800">${neden}</p>
                </div>
              `).join('') : `
                <div class="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-green-800">Risk faktörü tespit edilmedi</p>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Alt Bölüm: Profili İncele Butonu -->
        <div class="pt-6 border-t border-slate-200">
          <button 
            onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'; window.studentModal?.hide();"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl">
            Profili İncele →
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Risk nedenlerini hesapla (DB'den gelen spesifik nedenler)
   */
  calculateRiskReasons(ogrenci) {
    const nedenler = [];

    // 4. Yarıyıl Seminer Başarısız (Öncelikli)
    const mevcutYariyil = ogrenci.mevcut_yariyil || ogrenci.mevcutYariyil || 0;
    const seminerDurum = ogrenci.seminer_durumu || ogrenci.seminer_durum || '';
    const seminerNotKodu = ogrenci.seminer_not_kodu || ogrenci.seminerNotKodu || '';
    
    if (mevcutYariyil >= 4) {
      if (seminerDurum === 'seminer_basarisiz' || (seminerNotKodu && !['B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD'].includes(seminerNotKodu))) {
        nedenler.push('⚠️ 4. Yarıyıl Seminer Başarısız');
      } else if (seminerDurum === 'seminer_yok' || seminerDurum === 'seminer_eksik') {
        nedenler.push('⚠️ 4. Yarıyıl Seminer Eksik');
      }
    }

    // 180+ gün login yok
    const sonLogin = ogrenci.son_login || ogrenci.sonLogin;
    if (!sonLogin) {
      nedenler.push('⚠️ Hiç giriş yapılmamış');
    } else {
      const gunSayisi = Math.floor((new Date() - new Date(sonLogin)) / (1000 * 60 * 60 * 24));
      if (gunSayisi > 180) {
        nedenler.push(`⚠️ ${gunSayisi} gündür sisteme giriş yapılmamış`);
      }
    }

    // ACİL_EYLEM statüsü
    const durumStatus = ogrenci.durum_statüsü || ogrenci.durumStatusu || '';
    if (durumStatus === 'ACİL_EYLEM' || ogrenci.acil_eylem_mi === true) {
      nedenler.push('⚠️ ACİL_EYLEM Statüsü - Kritik Darboğaz');
    }

    // Kritik darboğaz
    if (ogrenci.kritik_darbogaz_mi === true || ogrenci.kritikDarbogazMi === true) {
      nedenler.push('⚠️ Kritik Darboğaz Tespit Edildi');
    }

    // Risk skoru yüksek
    const riskSkoru = ogrenci.mevcut_risk_skoru || ogrenci.risk_skoru || ogrenci.mevcutRiskSkoru || 0;
    if (riskSkoru >= 70) {
      nedenler.push(`⚠️ Risk Skoru Kritik (${riskSkoru}/100)`);
    } else if (riskSkoru >= 50) {
      nedenler.push(`⚠️ Risk Skoru Yüksek (${riskSkoru}/100)`);
    }

    // Maksimum süre aşımı
    const maksimumSure = ogrenci.maksimum_sure_yil || ogrenci.maksimumSureYil || 3;
    const kayitTarihi = ogrenci.kayit_tarihi || ogrenci.kayitTarihi;
    if (kayitTarihi) {
      const yilSayisi = (new Date() - new Date(kayitTarihi)) / (1000 * 60 * 60 * 24 * 365);
      if (yilSayisi > maksimumSure) {
        nedenler.push(`⚠️ Maksimum Süre Aşıldı (${yilSayisi.toFixed(1)} yıl / ${maksimumSure} yıl)`);
      }
    }

    return nedenler.length > 0 ? nedenler : ['✅ Risk faktörü tespit edilmedi'];
  }

  getRiskColor(riskSkoru) {
    if (riskSkoru >= 70) return 'text-red-600';
    if (riskSkoru >= 50) return 'text-orange-600';
    if (riskSkoru >= 30) return 'text-yellow-600';
    return 'text-emerald-600';
  }

  getRiskBadge(riskSkoru) {
    if (riskSkoru >= 70) {
      return '<span class="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">KRİTİK</span>';
    }
    if (riskSkoru >= 50) {
      return '<span class="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">YÜKSEK</span>';
    }
    if (riskSkoru >= 30) {
      return '<span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">ORTA</span>';
    }
    return '<span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">DÜŞÜK</span>';
  }

  getAvatarGradient(ogrenciId) {
    // ID'ye göre rastgele gradient seç
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600'
    ];
    
    // ID'den hash oluştur
    let hash = 0;
    if (ogrenciId) {
      for (let i = 0; i < ogrenciId.length; i++) {
        hash = ogrenciId.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    
    return gradients[Math.abs(hash) % gradients.length];
  }

  destroy() {
    this.hide();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

