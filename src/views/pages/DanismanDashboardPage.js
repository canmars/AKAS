/**
 * Danışman Dashboard Page
 * Danışman paneli - Onay bekleyen milestone'lar, kapasite, riskli öğrenciler
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class DanismanDashboardPage {
  constructor(container) {
    this.container = container;
    this.data = null;
  }

  async init() {
    try {
      this.showLoading();
      const response = await ApiService.get('/dashboard/danisman');
      
      if (response.success) {
        this.data = response.data;
        this.render();
        // Global erişim için
        window.danismanDashboard = this;
      } else {
        this.showError('Veriler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Danışman dashboard yükleme hatası:', error);
      this.showError('Veriler yüklenirken bir hata oluştu');
    }
  }

  render() {
    if (!this.data) return;

    const { danisman, yuk, onayBekleyenMilestones, riskliOgrenciler } = this.data;
    const kapasiteKullanimYuzdesi = yuk?.kapasite_kullanim_yuzdesi || 0;
    const mevcutYuk = yuk?.mevcut_yuk || 0;
    const maksimumKapasite = yuk?.maksimum_kapasite || danisman.maksimum_kapasite || 10;

    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-8">
        <!-- Başlık -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Danışman Paneli</h1>
          <p class="text-slate-600">Öğrencilerinizi yönetin ve onay bekleyen işlemleri görüntüleyin</p>
        </div>

        <!-- Kapasite Göstergesi -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] p-6">
          <h2 class="text-xl font-semibold text-slate-900 mb-4">Kapasite Durumu</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700">Mevcut Yük</span>
              <span class="text-lg font-bold ${this.getKapasiteColorClass(kapasiteKullanimYuzdesi)}">
                ${mevcutYuk} / ${maksimumKapasite}
              </span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-4">
              <div 
                class="h-4 rounded-full transition-all ${this.getKapasiteBarColorClass(kapasiteKullanimYuzdesi)}"
                style="width: ${Math.min(kapasiteKullanimYuzdesi, 100)}%"
              ></div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600">Kullanım Oranı</span>
              <span class="font-semibold ${this.getKapasiteColorClass(kapasiteKullanimYuzdesi)}">
                ${kapasiteKullanimYuzdesi.toFixed(1)}%
              </span>
            </div>
            ${yuk?.sert_limit ? `
              <div class="mt-4 p-3 bg-slate-50 rounded-lg">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600">Sert Limit:</span>
                  <span class="font-semibold text-slate-900">${yuk.sert_limit}</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-2">
                  <span class="text-slate-600">Yumuşak Limit:</span>
                  <span class="font-semibold text-slate-900">${yuk.yumusak_limit || '-'}</span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Onay Bekleyen Milestone'lar -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-slate-900">Onay Bekleyen Milestone'lar</h2>
                <p class="text-sm text-slate-600 mt-1">Öğrencilerinizin onay bekleyen aşamaları</p>
              </div>
              ${onayBekleyenMilestones && onayBekleyenMilestones.length > 0 ? `
                <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                  ${onayBekleyenMilestones.length} Bekleyen
                </span>
              ` : ''}
            </div>
          </div>
          <div class="p-6">
            ${onayBekleyenMilestones && onayBekleyenMilestones.length > 0 ? `
              <div class="space-y-4">
                ${onayBekleyenMilestones.map(milestone => this.renderMilestoneCard(milestone)).join('')}
              </div>
            ` : `
              <div class="text-center py-8 text-slate-500">
                <p>Onay bekleyen milestone bulunmuyor</p>
              </div>
            `}
          </div>
        </div>

        <!-- Riskli Öğrenciler -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-xl font-semibold text-slate-900">Riskli Öğrenciler</h2>
            <p class="text-sm text-slate-600 mt-1">Risk skoru 50 ve üzeri olan öğrencileriniz</p>
          </div>
          <div class="p-6">
            ${riskliOgrenciler && riskliOgrenciler.length > 0 ? `
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Öğrenci</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Program</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Aşama</th>
                      <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Skoru</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">İşlem</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-200">
                    ${riskliOgrenciler.map(ogrenci => this.renderRiskliOgrenciRow(ogrenci)).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="text-center py-8 text-slate-500">
                <p>Riskli öğrenci bulunmuyor</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderMilestoneCard(milestone) {
    const ogrenci = milestone.ogrenci;
    const gecikmeGunu = milestone.hedef_tarih ? 
      Math.floor((new Date() - new Date(milestone.hedef_tarih)) / (1000 * 60 * 60 * 24)) : 0;
    const gecikmeUyari = gecikmeGunu > 0 ? `<span class="text-red-600 text-sm font-medium">(${gecikmeGunu} gün gecikme)</span>` : '';

    return `
      <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h4 class="font-semibold text-slate-900">${this.getMilestoneText(milestone.milestone_turu)}</h4>
            ${gecikmeUyari}
          </div>
          <p class="text-sm text-slate-600">
            <span class="font-medium">${ogrenci.ad} ${ogrenci.soyad}</span> - ${ogrenci.program_turleri?.program_adi || ''}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            Hedef Tarih: ${formatters.formatDate(milestone.hedef_tarih)}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            onclick="window.danismanDashboard?.onaylaMilestone('${milestone.milestone_id}')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Onayla
          </button>
          <button 
            onclick="window.danismanDashboard?.reddetMilestone('${milestone.milestone_id}')"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Reddet
          </button>
        </div>
      </div>
    `;
  }

  renderRiskliOgrenciRow(ogrenci) {
    const riskSkoru = ogrenci.mevcut_risk_skoru || 0;
    const programAdi = ogrenci.ogrenci?.program_turleri?.program_adi || 'N/A';
    const mevcutAsama = ogrenci.mevcut_asinama || 'Bilinmiyor';

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-semibold text-slate-900">
            ${ogrenci.ogrenci?.ad || ''} ${ogrenci.ogrenci?.soyad || ''}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${programAdi}</td>
        <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">${this.getAsamaText(mevcutAsama)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${this.getRiskBadgeClass(riskSkoru)}">
            ${riskSkoru}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button 
            onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci?.ogrenci_id}';"
            class="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Detay →
          </button>
        </td>
      </tr>
    `;
  }

  getKapasiteColorClass(yuzde) {
    if (yuzde >= 100) return 'text-red-600';
    if (yuzde >= 80) return 'text-yellow-600';
    return 'text-green-600';
  }

  getKapasiteBarColorClass(yuzde) {
    if (yuzde >= 100) return 'bg-red-600';
    if (yuzde >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  }

  getRiskBadgeClass(riskSkoru) {
    if (riskSkoru >= 70) return 'bg-red-100 text-red-800';
    if (riskSkoru >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  getAsamaText(asama) {
    const map = {
      'Ders': 'Ders Aşaması',
      'Yeterlik': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'TIK': 'TİK',
      'Tez': 'Tez Yazımı',
      'Tamamlandi': 'Tamamlandı'
    };
    return map[asama] || asama;
  }

  async onaylaMilestone(milestoneId) {
    // TODO: Milestone onay endpoint'i
    console.log('Milestone onaylanıyor:', milestoneId);
    alert('Milestone onaylama özelliği yakında eklenecek');
  }

  async reddetMilestone(milestoneId) {
    // TODO: Milestone reddet endpoint'i
    console.log('Milestone reddediliyor:', milestoneId);
    alert('Milestone reddetme özelliği yakında eklenecek');
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

// Global erişim için
window.danismanDashboard = null;

