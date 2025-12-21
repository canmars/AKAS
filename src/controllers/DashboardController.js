/**
 * Dashboard Controller
 * Dashboard iş mantığı
 */

import ApiService from '../services/ApiService.js';
import { DashboardPage } from '../views/pages/DashboardPage.js';

export class DashboardController {
  constructor(view) {
    this.view = view;
    this.page = null;
  }

  async init() {
    try {
      // Önceki sayfayı temizle
      if (this.page) {
        this.page.destroy();
      }
      
      // Container'ı temizle
      if (this.view.container) {
        this.view.container.innerHTML = '';
      }
      
      // Dashboard sayfasını oluştur
      this.page = new DashboardPage(this.view.container);
      
      // Verileri yükle
      await this.loadDashboardData();
    } catch (error) {
      console.error('Dashboard init error:', error);
      if (this.view.container) {
        this.view.container.innerHTML = `<div class="error-message">Dashboard yüklenirken bir hata oluştu: ${error.message}</div>`;
      }
    }
  }

  async loadDashboardData() {
    try {
      if (!this.page) {
        console.error('Dashboard page not initialized');
        return;
      }

      this.page.showLoading();

      // Paralel olarak tüm verileri yükle
      const [
        kpiResponse,
        surecHattiResponse,
        danismanYukResponse,
        riskDagilimiResponse,
        programDagilimiResponse,
        attritionResponse
      ] = await Promise.all([
        ApiService.getKPIMetrics(),
        ApiService.getSurecHatti(),
        ApiService.getDanismanYuk(),
        ApiService.getRiskDagilimi(),
        ApiService.getProgramDagilimi(),
        ApiService.getAttritionData().catch(() => ({ success: false, data: [] })) // Opsiyonel
      ]);

      // Engagement verisini hazırla (Attrition verisinden)
      const engagementData = this.prepareEngagementData(attritionResponse?.data || []);

      // Verileri sayfaya aktar
      this.page.render({
        kpi: kpiResponse?.data || {},
        surecHattiData: surecHattiResponse?.data || [],
        danismanYuk: danismanYukResponse?.data || [],
        riskDagilimi: riskDagilimiResponse?.data || {},
        programDagilimi: programDagilimiResponse?.data || [],
        engagementData: engagementData
      });

      this.page.hideLoading();
    } catch (error) {
      console.error('Dashboard data load error:', error);
      if (this.page) {
        this.page.showError(`Veriler yüklenirken bir hata oluştu: ${error.message}`);
      }
    }
  }

  prepareEngagementData(attritionData) {
    // Attrition verisini Engagement Scatter formatına dönüştür
    if (!attritionData || !Array.isArray(attritionData)) {
      return [];
    }

    return attritionData.map(item => ({
      ogrenci_id: item.ogrenci_id,
      ad: item.ad,
      soyad: item.soyad,
      gun_sayisi: item.gun_sayisi || item.login_olmayan_gun_sayisi || 0,
      risk_skoru: item.risk_skoru || 0,
      program_adi: item.program_adi || 'N/A'
    }));
  }

  destroy() {
    if (this.page) {
      this.page.destroy();
    }
  }
}

