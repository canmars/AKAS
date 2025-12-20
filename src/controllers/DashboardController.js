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

      // Paralel olarak tüm verileri yükle (sadece grafikler için gerekli olanlar)
      const [
        kpiResponse,
        surecHattiResponse,
        danismanYukResponse,
        riskDagilimiResponse,
        programDagilimiResponse
      ] = await Promise.all([
        ApiService.getKPIMetrics(),
        ApiService.getSurecHatti(),
        ApiService.getDanismanYuk(),
        ApiService.getRiskDagilimi(),
        ApiService.getProgramDagilimi()
      ]);

      // Verileri sayfaya aktar (veri yoksa bile render et)
      this.page.render({
        kpi: kpiResponse?.data || {},
        surecHattiData: surecHattiResponse?.data || [],
        danismanYuk: danismanYukResponse?.data || [],
        riskDagilimi: riskDagilimiResponse?.data || {},
        programDagilimi: programDagilimiResponse?.data || []
      });

      this.page.hideLoading();
    } catch (error) {
      console.error('Dashboard data load error:', error);
      if (this.page) {
        this.page.showError(`Veriler yüklenirken bir hata oluştu: ${error.message}`);
      }
    }
  }

  destroy() {
    if (this.page) {
      this.page.destroy();
    }
  }
}

