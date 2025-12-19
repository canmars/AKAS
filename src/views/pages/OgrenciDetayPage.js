/**
 * Öğrenci Detay Page
 * Öğrenci detay sayfası
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class OgrenciDetayPage {
  constructor(container, ogrenciId) {
    this.container = container;
    this.ogrenciId = ogrenciId;
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      
      const [ogrenciResponse, riskAnaliziResponse] = await Promise.all([
        ApiService.getOgrenciById(this.ogrenciId),
        ApiService.getOgrenciRiskAnalizi(this.ogrenciId)
      ]);

      this.render({
        ogrenci: ogrenciResponse.data,
        riskAnalizi: riskAnaliziResponse.data
      });
    } catch (error) {
      console.error('Öğrenci detay yükleme hatası:', error);
      this.showError('Öğrenci detayları yüklenirken bir hata oluştu.');
    }
  }

  render(data) {
    const { ogrenci, riskAnalizi } = data;
    
    this.container.innerHTML = `
      <div class="ogrenci-detay">
        <div class="page-header">
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
          <h1>Öğrenci Detayı</h1>
        </div>
        
        <div class="detail-grid">
          <div class="detail-card">
            <h2>Genel Bilgiler</h2>
            <div class="detail-item">
              <span class="detail-label">Öğrenci ID:</span>
              <span class="detail-value">${ogrenci.ogrenci_id || '-'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Program:</span>
              <span class="detail-value">${ogrenci.program_turleri?.program_adi || '-'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Durum:</span>
              <span class="detail-value">${ogrenci.durum_turleri?.durum_adi || '-'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Kayıt Tarihi:</span>
              <span class="detail-value">${formatters.formatDate(ogrenci.kayit_tarihi)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mevcut Yarıyıl:</span>
              <span class="detail-value">${ogrenci.mevcut_yariyil || '-'}</span>
            </div>
          </div>
          
          <div class="detail-card">
            <h2>Risk Analizi</h2>
            ${riskAnalizi ? `
              <div class="detail-item">
                <span class="detail-label">Risk Skoru:</span>
                <span class="detail-value">${formatters.formatRiskSkoru(riskAnalizi.risk_skoru)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Risk Seviyesi:</span>
                <span class="detail-value">
                  <span class="badge ${riskAnalizi.risk_seviyesi.toLowerCase()}">${riskAnalizi.risk_seviyesi}</span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tehlike Türü:</span>
                <span class="detail-value">${riskAnalizi.tehlike_turu || '-'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hesaplama Tarihi:</span>
                <span class="detail-value">${formatters.formatDate(riskAnalizi.hesaplama_tarihi)}</span>
              </div>
            ` : '<p>Risk analizi bulunamadı.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Yükleniyor</div>';
  }

  showError(message) {
    this.container.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

