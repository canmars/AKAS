/**
 * What-If Simülasyon Component
 * Yeni öğrenci ataması simülasyonu
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class WhatIfSimulasyon {
  constructor(container) {
    this.container = container;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="what-if-form">
        <div class="form-group">
          <label>Hedef Yeni Öğrenci Sayısı:</label>
          <input type="number" id="yeni-ogrenci-sayisi" min="1" max="100" value="10" class="form-input">
        </div>
        
        <div class="form-group">
          <label>Program Türü Dağılımı:</label>
          <div class="program-distribution">
            <div class="dist-item">
              <label>Doktora:</label>
              <input type="number" id="doktora-sayisi" min="0" value="4" class="form-input">
            </div>
            <div class="dist-item">
              <label>Tezli YL:</label>
              <input type="number" id="tezli-yl-sayisi" min="0" value="3" class="form-input">
            </div>
            <div class="dist-item">
              <label>Tezsiz YL (İÖ):</label>
              <input type="number" id="tezsiz-io-sayisi" min="0" value="2" class="form-input">
            </div>
            <div class="dist-item">
              <label>Tezsiz YL (Uzaktan):</label>
              <input type="number" id="tezsiz-uzaktan-sayisi" min="0" value="1" class="form-input">
            </div>
          </div>
        </div>
        
        <button id="simulasyon-btn" class="btn btn-primary">Simülasyon Çalıştır</button>
        
        <div id="simulasyon-sonucu" class="simulasyon-sonucu" style="display: none;"></div>
      </div>
    `;
  }

  setupEventListeners() {
    const btn = document.getElementById('simulasyon-btn');
    btn.addEventListener('click', () => this.runSimulation());
  }

  async runSimulation() {
    const yeniOgrenciSayisi = parseInt(document.getElementById('yeni-ogrenci-sayisi').value) || 0;
    const programTuruDagilimi = {
      'Doktora': parseInt(document.getElementById('doktora-sayisi').value) || 0,
      'Tezli Yüksek Lisans': parseInt(document.getElementById('tezli-yl-sayisi').value) || 0,
      'Tezsiz Yüksek Lisans (İÖ)': parseInt(document.getElementById('tezsiz-io-sayisi').value) || 0,
      'Tezsiz Yüksek Lisans (Uzaktan)': parseInt(document.getElementById('tezsiz-uzaktan-sayisi').value) || 0
    };

    try {
      const sonucContainer = document.getElementById('simulasyon-sonucu');
      sonucContainer.style.display = 'block';
      sonucContainer.innerHTML = '<div class="loading">Simülasyon çalıştırılıyor...</div>';

      const response = await ApiService.runSimulation({
        hedef_yeni_ogrenci_sayisi: yeniOgrenciSayisi,
        program_turu_dagilimi: programTuruDagilimi
      });

      this.renderSimulasyonSonucu(response.data);
    } catch (error) {
      console.error('Simülasyon hatası:', error);
      const sonucContainer = document.getElementById('simulasyon-sonucu');
      sonucContainer.innerHTML = `<div class="error-message">Simülasyon çalıştırılırken bir hata oluştu: ${error.message}</div>`;
    }
  }

  renderSimulasyonSonucu(data) {
    const sonucContainer = document.getElementById('simulasyon-sonucu');
    
    if (!data.onerilenDagilim) {
      sonucContainer.innerHTML = '<p>Simülasyon sonucu bulunamadı.</p>';
      return;
    }

    const { dagilim, kalanOgrenci, uyari } = data.onerilenDagilim;

    sonucContainer.innerHTML = `
      <h3>Simülasyon Sonucu</h3>
      ${uyari ? `<div class="warning-message">⚠️ ${uyari}</div>` : ''}
      ${kalanOgrenci > 0 ? `<div class="warning-message">⚠️ ${kalanOgrenci} öğrenci için yeterli kapasite bulunamadı.</div>` : ''}
      
      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Hoca</th>
              <th>Unvan</th>
              <th>Mevcut Yük</th>
              <th>Önerilen Yeni Öğrenci</th>
              <th>Yeni Toplam Yük</th>
              <th>Kapasite Kullanım %</th>
            </tr>
          </thead>
          <tbody>
            ${dagilim.map(item => {
              const kullanimYuzdesi = (item.yeni_toplam_yuk / item.maksimum_kapasite) * 100;
              const durumClass = kullanimYuzdesi >= 90 ? 'kritik' : kullanimYuzdesi >= 70 ? 'yuksek' : 'dusuk';
              
              return `
                <tr>
                  <td>${item.ad} ${item.soyad}</td>
                  <td>${item.unvan}</td>
                  <td>${item.mevcut_yuk}</td>
                  <td>${item.onerilen_yeni_ogrenci}</td>
                  <td>${item.yeni_toplam_yuk}</td>
                  <td>
                    <span class="badge ${durumClass}">${formatters.formatPercent(kullanimYuzdesi)}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

