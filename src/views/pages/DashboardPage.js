/**
 * Dashboard Page
 * Bölüm Başkanı Dashboard sayfası
 */

import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { KPICard } from '../components/KPICard.js';
import { RiskSkoruGrafik } from '../components/RiskSkoruGrafik.js';
import { ProgramDagilimGrafik } from '../components/ProgramDagilimGrafik.js';
import { OgrenciListesi } from '../components/OgrenciListesi.js';
import { DanismanYukGrafik } from '../components/DanismanYukGrafik.js';
import { BildirimKartlari } from '../components/BildirimKartlari.js';

export class DashboardPage {
  constructor(container) {
    this.container = container;
    this.layout = null;
    this.components = {};
  }

  render(data) {
    this.container.innerHTML = '';
    
    // Layout oluştur
    this.layout = new DashboardLayout(this.container);
    
    // KPI Cards
    if (data.kpi) {
      const kpiContainer = this.layout.getKPIContainer();
      this.components.kpi = new KPICard(kpiContainer, data.kpi);
    }
    
    // Risk Skoru Dağılımı Grafiği
    if (data.riskDagilimi) {
      const riskContainer = this.layout.getRiskChartContainer();
      this.components.riskGrafik = new RiskSkoruGrafik(riskContainer, data.riskDagilimi);
    }
    
    // Program Bazında Dağılım Grafiği
    if (data.programDagilimi) {
      const programContainer = this.layout.getProgramChartContainer();
      this.components.programGrafik = new ProgramDagilimGrafik(programContainer, data.programDagilimi);
    }
    
    // Kritik Öğrenciler Listesi
    if (data.kritikOgrenciler) {
      const ogrenciContainer = this.layout.getOgrenciListContainer();
      this.components.ogrenciListesi = new OgrenciListesi(ogrenciContainer, data.kritikOgrenciler);
    }
    
    // Danışman Yük Dağılımı
    if (data.danismanYuk) {
      const yukContainer = this.layout.getYukChartContainer();
      this.components.yukGrafik = new DanismanYukGrafik(yukContainer, data.danismanYuk);
    }
    
    // Bildirimler
    if (data.bildirimler) {
      const bildirimContainer = this.layout.getBildirimContainer();
      this.components.bildirimler = new BildirimKartlari(bildirimContainer, data.bildirimler);
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Yükleniyor</div>';
  }

  hideLoading() {
    // Loading zaten render() ile değiştirilecek
  }

  showError(message) {
    this.container.innerHTML = `<div class="error-message">${message}</div>`;
  }

  destroy() {
    // Component'leri temizle
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = {};
  }
}

