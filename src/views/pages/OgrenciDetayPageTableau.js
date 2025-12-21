/**
 * Öğrenci Detay Page - Tableau Style
 * Risk skoru card, risk faktörleri drill-down, akademik durum timeline, TİK geçmişi, prescriptive actions
 */

import ApiService from '../../services/ApiService.js';
import { ActionableKPICard } from '../components/ActionableKPICard.js';
import { PrescriptivePanel } from '../components/PrescriptivePanel.js';
import { DrillDownModal } from '../components/DrillDownModal.js';
import formatters from '../../utils/formatters.js';

export class OgrenciDetayPageTableau {
  constructor(container, ogrenciId) {
    this.container = container;
    this.ogrenciId = ogrenciId;
    this.data = null;
    this.drillDownModal = null;
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Öğrenci detay yükleme hatası:', error);
      this.showError('Öğrenci detayları yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [ogrenciResponse, riskAnaliziResponse, riskDrillDownResponse, tikToplantilariResponse, milestoneResponse] = await Promise.all([
      ApiService.getOgrenciById(this.ogrenciId).catch(() => ({ success: false, data: {} })),
      ApiService.getRiskAnaliziByOgrenciId(this.ogrenciId).catch(() => ({ success: false, data: null })),
      ApiService.getRiskDrillDown(this.ogrenciId).catch(() => ({ success: false, data: {} })),
      ApiService.getTikToplantilari(this.ogrenciId).catch(() => ({ success: false, data: [] })),
      ApiService.getMilestoneListesi({ ogrenci_id: this.ogrenciId }).catch(() => ({ success: false, data: [] }))
    ]);

    this.data = {
      ogrenci: ogrenciResponse?.data || {},
      riskAnalizi: riskAnaliziResponse?.data || null,
      riskDrillDown: riskDrillDownResponse?.data || {},
      tikToplantilari: Array.isArray(tikToplantilariResponse?.data) ? tikToplantilariResponse.data : (tikToplantilariResponse?.data?.data || []),
      milestones: Array.isArray(milestoneResponse?.data) ? milestoneResponse.data : (milestoneResponse?.data?.data || [])
    };
  }

  render() {
    if (!this.data) return;

    const { ogrenci, riskAnalizi, riskDrillDown, tikToplantilari, milestones } = this.data;
    const riskSkoru = riskAnalizi?.risk_skoru || ogrenci.mevcut_risk_skoru || 0;
    const riskSeviyesi = this.getRiskSeviyesi(riskSkoru);

    this.container.innerHTML = `
      <div class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <button 
                  onclick="window.location.hash='/dashboard'"
                  class="text-sm text-gray-600 hover:text-gray-900 mb-2"
                >
                  ← Dashboard'a Dön
                </button>
                <h1 class="text-2xl font-normal text-gray-900">
                  ${ogrenci.ad || ''} ${ogrenci.soyad || ''} - ${ogrenci.program_turleri?.program_adi || 'Öğrenci'}
                </h1>
                <p class="text-sm text-gray-500 mt-1">Öğrenci Detay Sayfası</p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  onclick="window.location.hash='/ogrenci/${this.ogrenciId}/edit'"
                  class="btn btn-outline btn-sm"
                >
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-6 max-w-7xl mx-auto">
          <!-- Risk Skoru Card -->
          <div class="mb-6" id="risk-skoru-card-container">
            <!-- Risk skoru card will be rendered here -->
          </div>

          <!-- Risk Faktörleri -->
          <div class="card mb-6" id="risk-faktorleri-container">
            <!-- Risk faktörleri will be rendered here -->
          </div>

          <!-- Akademik Durum Timeline -->
          <div class="card mb-6" id="akademik-durum-timeline-container">
            <!-- Timeline will be rendered here -->
          </div>

          <!-- TİK Toplantı Geçmişi -->
          <div class="card mb-6" id="tik-toplanti-gecmisi-container">
            <!-- TİK geçmişi will be rendered here -->
          </div>

          <!-- Önerilen Aksiyonlar -->
          <div id="prescriptive-panel-container">
            <!-- Prescriptive panel will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Render components
    this.renderRiskSkoruCard();
    this.renderRiskFaktorleri();
    this.renderAkademikDurumTimeline();
    this.renderTikToplantiGecmisi();
    this.renderPrescriptivePanel();
  }

  renderRiskSkoruCard() {
    const container = this.container.querySelector('#risk-skoru-card-container');
    if (!container) return;

    const { riskAnalizi } = this.data;
    const riskSkoru = riskAnalizi?.risk_skoru || 0;
    const riskSeviyesi = this.getRiskSeviyesi(riskSkoru);
    const riskColor = this.getRiskColor(riskSeviyesi);

    container.innerHTML = `
      <div class="card border-l-4" style="border-left-color: ${riskColor};">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Risk Skoru</h3>
              <div class="flex items-baseline gap-3">
                <div class="text-6xl font-bold" style="color: ${riskColor};">
                  ${riskSkoru}
                </div>
                <div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold badge-${riskSeviyesi.toLowerCase()}">
                    ${riskSeviyesi}
                  </span>
                </div>
              </div>
              ${riskAnalizi?.hesaplama_tarihi ? `
                <p class="text-xs text-gray-500 mt-2">
                  Son güncelleme: ${formatters.formatDate(riskAnalizi.hesaplama_tarihi)}
                </p>
              ` : ''}
            </div>
            <div>
              <button 
                class="btn btn-primary btn-sm"
                onclick="window.ogrenciDetayPage?.showRiskDrillDown()"
              >
                Risk Faktörleri Detayı
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Global erişim için
    window.ogrenciDetayPage = this;
  }

  renderRiskFaktorleri() {
    const container = this.container.querySelector('#risk-faktorleri-container');
    if (!container) return;

    const { riskDrillDown } = this.data;
    const riskFaktorleri = riskDrillDown.risk_faktorleri || {};

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Risk Faktörleri</h3>
        <p class="text-sm text-gray-500 mt-1">Risk skoruna katkıda bulunan faktörler</p>
      </div>
      <div class="card-body">
        ${Object.keys(riskFaktorleri).length > 0 ? `
          <div class="space-y-3">
            ${Object.entries(riskFaktorleri).map(([key, value]) => {
              const puan = value.puan || 0;
              const agirlik = value.agirlik || 0;
              const etki = (puan * agirlik * 100).toFixed(1);
              const isExpanded = puan > 0.5; // Yüksek puanlı faktörler varsayılan olarak açık
              
              return `
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors risk-faktor-header"
                    data-faktor-key="${key}"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-semibold text-gray-900">${this.getFaktorLabel(key)}</span>
                      <span class="text-xs text-gray-500">(Ağırlık: ${(agirlik * 100).toFixed(0)}%)</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold" style="color: ${this.getRiskColorByPuan(puan)};">
                        ${etki}%
                      </span>
                      <svg class="w-5 h-5 text-gray-400 transform transition-transform" data-icon="${key}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div class="risk-faktor-detail hidden px-4 py-3 bg-white border-t border-gray-200" data-detail="${key}">
                    <div class="text-sm text-gray-600 space-y-1">
                      <div><strong>Puan:</strong> ${puan.toFixed(2)}</div>
                      <div><strong>Ağırlık:</strong> ${(agirlik * 100).toFixed(0)}%</div>
                      <div><strong>Toplam Etki:</strong> ${etki}%</div>
                      ${value.aciklama ? `<div class="mt-2">${value.aciklama}</div>` : ''}
                    </div>
                    ${this.getFaktorActions(key)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-8 text-gray-500">
            Risk faktörü detayı bulunamadı
          </div>
        `}
      </div>
    `;

    // Expand/collapse functionality
    const headers = container.querySelectorAll('.risk-faktor-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const key = header.dataset.faktorKey;
        const detail = container.querySelector(`[data-detail="${key}"]`);
        const icon = container.querySelector(`[data-icon="${key}"]`);
        
        if (detail) {
          detail.classList.toggle('hidden');
          if (icon) {
            icon.style.transform = detail.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
          }
        }
      });
    });
  }

  renderAkademikDurumTimeline() {
    const container = this.container.querySelector('#akademik-durum-timeline-container');
    if (!container) return;

    const { milestones, ogrenci } = this.data;
    
    // Milestone'ları sırala
    const sortedMilestones = [...milestones].sort((a, b) => {
      const dateA = new Date(a.hedef_tarih || a.tamamlanma_tarihi || 0);
      const dateB = new Date(b.hedef_tarihi || b.tamamlanma_tarihi || 0);
      return dateA - dateB;
    });

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Akademik Durum Timeline</h3>
        <p class="text-sm text-gray-500 mt-1">Öğrencinin akademik yolculuğu</p>
      </div>
      <div class="card-body">
        <div class="relative">
          ${sortedMilestones.length > 0 ? `
            <div class="space-y-4">
              ${sortedMilestones.map((milestone, index) => {
                const isCompleted = milestone.durum === 'Tamamlandi' || milestone.tamamlanma_tarihi;
                const isOverdue = milestone.hedef_tarih && new Date(milestone.hedef_tarih) < new Date() && !isCompleted;
                const milestoneType = this.getMilestoneType(milestone.milestone_turu);
                
                return `
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' : 
                        isOverdue ? 'bg-red-100 text-red-600' : 
                        'bg-blue-100 text-blue-600'
                      }">
                        ${isCompleted ? '✓' : index + 1}
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-semibold text-gray-900">${milestoneType.label}</h4>
                        ${isOverdue ? `
                          <span class="text-xs text-red-600 font-medium">
                            ${this.calculateDaysOverdue(milestone.hedef_tarih)} gün gecikme
                          </span>
                        ` : ''}
                      </div>
                      <p class="text-xs text-gray-500 mb-2">
                        ${milestone.hedef_tarih ? `Hedef: ${formatters.formatDate(milestone.hedef_tarih)}` : ''}
                        ${milestone.tamamlanma_tarihi ? ` | Tamamlandı: ${formatters.formatDate(milestone.tamamlanma_tarihi)}` : ''}
                      </p>
                      ${milestone.durum ? `
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          milestone.durum === 'Tamamlandi' ? 'bg-green-100 text-green-800' :
                          milestone.durum === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }">
                          ${milestone.durum}
                        </span>
                      ` : ''}
                    </div>
                    <div>
                      <button 
                        class="btn btn-outline btn-sm"
                        onclick="window.ogrenciDetayPage?.showMilestoneDetail('${milestone.milestone_id}')"
                      >
                        Detay
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="text-center py-8 text-gray-500">
              Milestone bulunamadı
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderTikToplantiGecmisi() {
    const container = this.container.querySelector('#tik-toplanti-gecmisi-container');
    if (!container) return;

    const { tikToplantilari } = this.data;

    container.innerHTML = `
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">TİK Toplantı Geçmişi</h3>
            <p class="text-sm text-gray-500 mt-1">Tez İzleme Komitesi toplantı kayıtları</p>
          </div>
          <button 
            class="btn btn-primary btn-sm"
            onclick="window.ogrenciDetayPage?.openTikForm()"
          >
            Yeni TİK Kaydı
          </button>
        </div>
      </div>
      <div class="card-body">
        ${tikToplantilari.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılım</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rapor</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${tikToplantilari.map(tik => this.renderTikRow(tik)).join('')}
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

  renderTikRow(tik) {
    const katilimDurumu = tik.katilim_durumu || 'Bilinmiyor';
    const katilimClass = katilimDurumu === 'Katildi' ? 'text-green-600' : katilimDurumu === 'Katilmadi' ? 'text-red-600' : 'text-gray-600';
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          ${formatters.formatDate(tik.toplanti_tarihi)}
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
          <button 
            class="text-blue-600 hover:text-blue-800 font-medium"
            onclick="window.ogrenciDetayPage?.editTik('${tik.topanti_id}')"
          >
            Düzenle
          </button>
        </td>
      </tr>
    `;
  }

  renderPrescriptivePanel() {
    const container = this.container.querySelector('#prescriptive-panel-container');
    if (!container) return;

    const recommendations = this.generateRecommendations();

    if (recommendations.length > 0) {
      new PrescriptivePanel(container, {
        insight: this.generateInsight(),
        recommendations,
        onActionClick: (rec, actionType) => {
          if (rec.onClick) {
            rec.onClick();
          }
        }
      });
    }
  }

  generateInsight() {
    const { riskAnalizi, tikToplantilari, milestones } = this.data;
    const riskSkoru = riskAnalizi?.risk_skoru || 0;
    
    if (riskSkoru >= 85) {
      return 'Öğrenci kritik risk seviyesinde. Acil müdahale gerekiyor.';
    } else if (riskSkoru >= 70) {
      return 'Öğrenci yüksek risk seviyesinde. Dikkatli takip edilmeli.';
    }
    
    return 'Öğrenci genel olarak iyi durumda.';
  }

  generateRecommendations() {
    const recommendations = [];
    const { riskAnalizi, tikToplantilari, milestones } = this.data;
    const riskSkoru = riskAnalizi?.risk_skoru || 0;

    // TİK toplantısı önerisi
    const sonTik = tikToplantilari.length > 0 ? tikToplantilari[0] : null;
    if (!sonTik || this.calculateDaysUntil(sonTik.toplanti_tarihi) > 180) {
      recommendations.push({
        action: 'TİK Kaydı Girişi',
        description: 'Son TİK toplantısı üzerinden 6 ay geçmiş veya hiç TİK kaydı yok',
        priority: riskSkoru >= 70 ? 'high' : 'medium',
        onClick: () => {
          this.openTikForm();
        },
        actionButtonLabel: 'TİK Kaydı Girişi'
      });
    }

    // Risk skoru yüksekse detaylı analiz önerisi
    if (riskSkoru >= 70) {
      recommendations.push({
        action: 'Detaylı Risk Analizi',
        description: 'Yüksek risk skoru nedeniyle detaylı analiz yapılmalı',
        priority: 'high',
        onClick: () => {
          this.showRiskDrillDown();
        },
        actionButtonLabel: 'Risk Analizini Gör'
      });
    }

    // Gecikmiş milestone önerisi
    const gecikmisMilestones = milestones.filter(m => 
      m.hedef_tarih && new Date(m.hedef_tarih) < new Date() && m.durum !== 'Tamamlandi'
    );
    if (gecikmisMilestones.length > 0) {
      recommendations.push({
        action: 'Gecikmiş Milestone Takibi',
        description: `${gecikmisMilestones.length} milestone gecikmiş durumda`,
        priority: 'high',
        onClick: () => {
          window.location.hash = `/milestone?ogrenci_id=${this.ogrenciId}`;
        },
        actionButtonLabel: 'Milestone\'ları Gör'
      });
    }

    return recommendations;
  }

  showRiskDrillDown() {
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    const { riskDrillDown } = this.data;
    const riskFaktorleri = riskDrillDown.risk_faktorleri || {};

    const drillDownData = Object.entries(riskFaktorleri).map(([key, value]) => ({
      faktor: this.getFaktorLabel(key),
      puan: value.puan || 0,
      agirlik: value.agirlik || 0,
      etki: ((value.puan || 0) * (value.agirlik || 0) * 100).toFixed(1) + '%',
      aciklama: value.aciklama || ''
    }));

    this.drillDownModal = new DrillDownModal(modalContainer, {
      title: 'Risk Faktörleri Detayı',
      data: drillDownData,
      columns: [
        { key: 'faktor', label: 'Risk Faktörü' },
        { key: 'puan', label: 'Puan', formatter: (val) => val.toFixed(2) },
        { key: 'agirlik', label: 'Ağırlık', formatter: (val) => (val * 100).toFixed(0) + '%' },
        { key: 'etki', label: 'Toplam Etki' },
        { key: 'aciklama', label: 'Açıklama' }
      ],
      exportButton: true,
      onClose: () => {
        document.body.removeChild(modalContainer);
      }
    });
  }

  showMilestoneDetail(milestoneId) {
    window.location.hash = `/milestone/${milestoneId}`;
  }

  openTikForm() {
    window.location.hash = `/milestone/tik?ogrenci_id=${this.ogrenciId}`;
  }

  editTik(toplantiId) {
    window.location.hash = `/milestone/tik?toplanti_id=${toplantiId}`;
  }

  // Helper methods
  getRiskSeviyesi(riskSkoru) {
    if (riskSkoru >= 85) return 'Kritik';
    if (riskSkoru >= 70) return 'Yüksek';
    if (riskSkoru >= 40) return 'Orta';
    return 'Düşük';
  }

  getRiskColor(riskSeviyesi) {
    const colorMap = {
      'Kritik': '#EF4444',
      'Yüksek': '#F59E0B',
      'Orta': '#EAB308',
      'Düşük': '#10B981'
    };
    return colorMap[riskSeviyesi] || '#6B7280';
  }

  getRiskColorByPuan(puan) {
    if (puan >= 0.7) return '#EF4444';
    if (puan >= 0.5) return '#F59E0B';
    if (puan >= 0.3) return '#EAB308';
    return '#10B981';
  }

  getFaktorLabel(key) {
    const labelMap = {
      'tik_katilim': 'TİK Toplantısına Katılmama',
      'yeterlik_suresi': 'Yeterlik Sınavı Süresi Aşımı',
      'tez_onersi_suresi': 'Tez Önerisi Süresi Aşımı',
      'ders_tamamlama': 'Ders Tamamlama Süresi',
      'hayalet_ogrenci': 'Hayalet Öğrenci (180+ gün giriş yok)',
      'maksimum_sure_asimi': 'Maksimum Süre Aşımı'
    };
    return labelMap[key] || key;
  }

  getFaktorActions(key) {
    if (key === 'tik_katilim') {
      return `
        <div class="mt-3 flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="window.ogrenciDetayPage?.openTikForm()">
            TİK Kaydı Girişi
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.location.hash='/milestone/tik?ogrenci_id=${this.ogrenciId}'">
            TİK Geçmişi
          </button>
        </div>
      `;
    }
    return '';
  }

  getMilestoneType(turu) {
    const typeMap = {
      'Yeterlik_Sinavi': { label: 'Yeterlik Sınavı', icon: '📝' },
      'Tez_Onersi': { label: 'Tez Önerisi', icon: '📄' },
      'Tez_Savunmasi': { label: 'Tez Savunması', icon: '🎓' },
      'Donem_Projesi': { label: 'Dönem Projesi', icon: '📊' }
    };
    return typeMap[turu] || { label: turu, icon: '📌' };
  }

  calculateDaysOverdue(date) {
    const today = new Date();
    const target = new Date(date);
    const diffTime = today - target;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateDaysUntil(date) {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    if (this.drillDownModal) {
      this.drillDownModal.destroy();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
    window.ogrenciDetayPage = null;
  }
}

