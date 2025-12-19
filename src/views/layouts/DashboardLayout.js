/**
 * Dashboard Layout
 * Dashboard layout yapısı
 */

export class DashboardLayout {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1>Karar Destek Sistemi Dashboard</h1>
          <p>Bölüm Başkanı Görünümü</p>
        </div>
        
        <div id="kpi-container" class="kpi-grid"></div>
        
        <div class="charts-grid">
          <div id="risk-chart-container" class="chart-card">
            <h2 class="chart-card-title">Risk Skoru Dağılımı</h2>
            <div class="chart-container"></div>
          </div>
          <div id="program-chart-container" class="chart-card">
            <h2 class="chart-card-title">Program Bazında Dağılım</h2>
            <div class="chart-container"></div>
          </div>
        </div>
        
        <div class="tables-grid">
          <div id="ogrenci-list-container" class="table-card">
            <h2 class="table-card-title">Kritik Risk Altındaki Öğrenciler</h2>
            <div class="table-content"></div>
          </div>
          <div id="yuk-chart-container" class="table-card">
            <h2 class="table-card-title">Danışman Yük Dağılımı</h2>
            <div class="table-content"></div>
          </div>
        </div>
        
        <div id="bildirim-container" class="table-card">
          <h2 class="table-card-title">Bildirimler</h2>
          <div class="table-content"></div>
        </div>
      </div>
    `;
  }

  getKPIContainer() {
    return document.getElementById('kpi-container');
  }

  getRiskChartContainer() {
    return document.querySelector('#risk-chart-container .chart-container');
  }

  getProgramChartContainer() {
    return document.querySelector('#program-chart-container .chart-container');
  }

  getOgrenciListContainer() {
    return document.querySelector('#ogrenci-list-container .table-content');
  }

  getYukChartContainer() {
    return document.querySelector('#yuk-chart-container .table-content');
  }

  getBildirimContainer() {
    return document.querySelector('#bildirim-container .table-content');
  }
}

