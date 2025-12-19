/**
 * Risk Analizi Page
 * Risk analizi detay sayfası
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class RiskAnaliziPage {
  constructor(container, filters = {}) {
    this.container = container;
    this.filters = filters;
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      
      const response = await ApiService.get('/risk-analizi', this.filters);
      
      this.render(response.data);
    } catch (error) {
      console.error('Risk analizi yükleme hatası:', error);
      this.showError('Risk analizleri yüklenirken bir hata oluştu.');
    }
  }

  render(riskAnalizleri) {
    if (!riskAnalizleri || riskAnalizleri.length === 0) {
      this.container.innerHTML = '<p>Risk analizi bulunamadı.</p>';
      return;
    }

    this.container.innerHTML = `
      <div class="risk-analizi-page">
        <div class="page-header">
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
          <h1>Risk Analizi</h1>
        </div>
        
        <div class="table-card">
          <table class="table">
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Risk Skoru</th>
                <th>Risk Seviyesi</th>
                <th>Tehlike Türü</th>
                <th>Hesaplama Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              ${riskAnalizleri.map(analiz => {
                const riskSeviyesi = analiz.risk_seviyesi?.toLowerCase() || 'orta';
                return `
                  <tr>
                    <td>Öğrenci ${analiz.ogrenci_id?.substring(0, 8) || '-'}</td>
                    <td>${formatters.formatRiskSkoru(analiz.risk_skoru)}</td>
                    <td><span class="badge ${riskSeviyesi}">${analiz.risk_seviyesi || '-'}</span></td>
                    <td>${analiz.tehlike_turu || '-'}</td>
                    <td>${formatters.formatDate(analiz.hesaplama_tarihi)}</td>
                    <td>
                      <button class="btn btn-primary btn-sm" onclick="window.location.hash='/ogrenci/${analiz.ogrenci_id}'">
                        Detay
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
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

