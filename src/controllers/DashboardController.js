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
      // Dashboard sayfasını oluştur
      this.page = new DashboardPage(this.view.container);
      
      // Verileri yükle
      await this.loadDashboardData();
    } catch (error) {
      console.error('Dashboard init error:', error);
      this.view.showError('Dashboard yüklenirken bir hata oluştu.');
    }
  }

  async loadDashboardData() {
    try {
      this.page.showLoading();

      // Paralel olarak tüm verileri yükle
      const [
        kpiResponse,
        riskDagilimiResponse,
        programDagilimiResponse,
        kritikOgrencilerResponse,
        danismanYukResponse,
        bildirimlerResponse
      ] = await Promise.all([
        ApiService.getKPIMetrics(),
        ApiService.getRiskDagilimi(),
        ApiService.getProgramDagilimi(),
        ApiService.getKritikOgrenciler(10),
        ApiService.getDanismanYuk(),
        ApiService.getBildirimler(20)
      ]);

      // Verileri sayfaya aktar
      this.page.render({
        kpi: kpiResponse.data,
        riskDagilimi: riskDagilimiResponse.data,
        programDagilimi: programDagilimiResponse.data,
        kritikOgrenciler: kritikOgrencilerResponse.data,
        danismanYuk: danismanYukResponse.data,
        bildirimler: bildirimlerResponse.data
      });

      this.page.hideLoading();
    } catch (error) {
      console.error('Dashboard data load error:', error);
      this.page.showError('Veriler yüklenirken bir hata oluştu.');
      this.page.hideLoading();
    }
  }

  destroy() {
    if (this.page) {
      this.page.destroy();
    }
  }
}

