/**
 * Öğrenci Dashboard Page
 * Öğrenci paneli - Milestone takibi, akademik durum, risk skoru
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class OgrenciDashboardPage {
  constructor(container) {
    this.container = container;
    this.data = null;
  }

  async init() {
    try {
      this.showLoading();
      const response = await ApiService.get('/dashboard/ogrenci');
      
      if (response.success) {
        this.data = response.data;
        this.render();
      } else {
        this.showError('Veriler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Öğrenci dashboard yükleme hatası:', error);
      this.showError('Veriler yüklenirken bir hata oluştu');
    }
  }

  render() {
    if (!this.data) return;

    const { ogrenci, milestones, tikToplantilari } = this.data;
    const riskSkoru = ogrenci.ogrenci_risk_analizi?.[0]?.risk_skoru || 0;
    const riskSeviyesi = ogrenci.ogrenci_risk_analizi?.[0]?.risk_seviyesi || 'Dusuk';
    const mevcutAsama = ogrenci.ogrenci_akademik_durum?.mevcut_asinama || 'Bilinmiyor';
    const mevcutYariyil = ogrenci.ogrenci_akademik_durum?.mevcut_yariyil || 0;

    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-8">
        <!-- Başlık -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Öğrenci Paneli</h1>
          <p class="text-slate-600">Akademik durumunuzu ve milestone'larınızı takip edin</p>
        </div>

        <!-- Risk Skoru ve Akademik Durum Kartları -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Risk Skoru -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] p-6">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Risk Skoru</h3>
            <div class="space-y-4">
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-bold ${this.getRiskColorClass(riskSkoru)}">${riskSkoru}</span>
                <span class="text-slate-500">/100</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full ${this.getRiskBarColorClass(riskSkoru)} transition-all"
                  style="width: ${riskSkoru}%"
                ></div>
              </div>
              <p class="text-sm text-slate-600">
                Seviye: <span class="font-semibold ${this.getRiskColorClass(riskSkoru)}">${this.getRiskSeviyesiText(riskSeviyesi)}</span>
              </p>
            </div>
          </div>

          <!-- Akademik Durum -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] p-6">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Akademik Durum</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-slate-500 mb-1">Mevcut Aşama</p>
                <p class="text-lg font-semibold text-slate-900">${this.getAsamaText(mevcutAsama)}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 mb-1">Mevcut Yarıyıl</p>
                <p class="text-lg font-semibold text-slate-900">${mevcutYariyil}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 mb-1">Program</p>
                <p class="text-lg font-semibold text-slate-900">${ogrenci.program_turleri?.program_adi || '-'}</p>
              </div>
            </div>
          </div>

          <!-- Öz-Denetim -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] p-6">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Son 30 Gün</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-slate-500 mb-1">Son Giriş</p>
                <p class="text-lg font-semibold text-slate-900">
                  ${ogrenci.son_login ? formatters.formatDateDistance(ogrenci.son_login) : 'Henüz giriş yapılmamış'}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-500 mb-1">Kayıt Tarihi</p>
                <p class="text-lg font-semibold text-slate-900">${formatters.formatDate(ogrenci.kayit_tarihi)}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Milestone Takibi -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-xl font-semibold text-slate-900">Milestone Takibi</h2>
            <p class="text-sm text-slate-600 mt-1">Akademik aşamalarınızın durumunu görüntüleyin</p>
          </div>
          <div class="p-6">
            ${milestones && milestones.length > 0 ? `
              <div class="space-y-4">
                ${milestones.map(milestone => this.renderMilestoneCard(milestone)).join('')}
              </div>
            ` : `
              <div class="text-center py-8 text-slate-500">
                <p>Henüz milestone kaydı bulunmuyor</p>
              </div>
            `}
          </div>
        </div>

        <!-- TİK Toplantıları -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-xl font-semibold text-slate-900">TİK Toplantıları</h2>
            <p class="text-sm text-slate-600 mt-1">Son 5 TİK toplantısı</p>
          </div>
          <div class="p-6">
            ${tikToplantilari && tikToplantilari.length > 0 ? `
              <div class="space-y-3">
                ${tikToplantilari.map(tik => this.renderTikCard(tik)).join('')}
              </div>
            ` : `
              <div class="text-center py-8 text-slate-500">
                <p>Henüz TİK toplantısı kaydı bulunmuyor</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderMilestoneCard(milestone) {
    const durumRenk = milestone.durum === 'Tamamlandi' ? 'bg-green-100 text-green-800' :
                     milestone.durum === 'Gecikmis' ? 'bg-red-100 text-red-800' :
                     'bg-yellow-100 text-yellow-800';
    
    return `
      <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div class="flex-1">
          <h4 class="font-semibold text-slate-900">${this.getMilestoneText(milestone.milestone_turu)}</h4>
          <p class="text-sm text-slate-600 mt-1">
            Hedef Tarih: ${formatters.formatDate(milestone.hedef_tarih)}
            ${milestone.gerceklesme_tarihi ? ` | Gerçekleşme: ${formatters.formatDate(milestone.gerceklesme_tarihi)}` : ''}
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-medium ${durumRenk}">
          ${milestone.durum}
        </span>
      </div>
    `;
  }

  renderTikCard(tik) {
    const katilimRenk = tik.katilim_durumu === 'Katildi' ? 'bg-green-100 text-green-800' :
                       tik.katilim_durumu === 'Katilmadi' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800';
    
    return `
      <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
        <div class="flex-1">
          <h4 class="font-semibold text-slate-900">TİK Toplantısı</h4>
          <p class="text-sm text-slate-600 mt-1">
            Tarih: ${formatters.formatDate(tik.toplanti_tarihi)}
            ${tik.rapor_verildi_mi ? ' | Rapor verildi' : ' | Rapor bekleniyor'}
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-medium ${katilimRenk}">
          ${tik.katilim_durumu || 'Beklemede'}
        </span>
      </div>
    `;
  }

  getRiskColorClass(riskSkoru) {
    if (riskSkoru >= 70) return 'text-red-600';
    if (riskSkoru >= 50) return 'text-yellow-600';
    return 'text-green-600';
  }

  getRiskBarColorClass(riskSkoru) {
    if (riskSkoru >= 70) return 'bg-red-600';
    if (riskSkoru >= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  }

  getRiskSeviyesiText(seviye) {
    const map = {
      'Kritik': 'Kritik',
      'Yuksek': 'Yüksek',
      'Orta': 'Orta',
      'Dusuk': 'Düşük'
    };
    return map[seviye] || seviye;
  }

  getAsamaText(asama) {
    const map = {
      'Ders': 'Ders Aşaması',
      'Yeterlik': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'TIK': 'TİK (Tez İzleme Komitesi)',
      'Tez': 'Tez Yazımı',
      'Tamamlandi': 'Tamamlandı'
    };
    return map[asama] || asama;
  }

  getMilestoneText(turu) {
    const map = {
      'Yeterlik_Sinavi': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'Tez_Savunmasi': 'Tez Savunması',
      'Donem_Projesi': 'Dönem Projesi'
    };
    return map[turu] || turu;
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

  showError(message) {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-sm text-red-700 font-medium">${message}</p>
        </div>
      </div>
    `;
  }

  destroy() {
    this.data = null;
  }
}

