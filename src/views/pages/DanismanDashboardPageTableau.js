/**
 * Danışman Dashboard Page - Tableau Style
 * Taktik görünüm: "Kendi öğrencilerimin durumu nasıl? Hangi öğrencilere odaklanmalıyım?"
 */

import ApiService from '../../services/ApiService.js';
import { ActionableKPICard } from '../components/ActionableKPICard.js';
import { ActionableList } from '../components/ActionableList.js';
import { InteractiveChart } from '../components/InteractiveChart.js';
import formatters from '../../utils/formatters.js';

export class DanismanDashboardPageTableau {
  constructor(container) {
    this.container = container;
    this.data = null;
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Danışman dashboard yükleme hatası:', error);
      this.showError('Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [dashboardResponse, tikYaklasanResponse, ogrencilerResponse] = await Promise.all([
      ApiService.getDanismanDashboard().catch(() => ({ success: false, data: {} })),
      ApiService.getYaklasanTikToplantilari().catch(() => ({ success: false, data: [] })),
      ApiService.getOgrenciler({ danisman_id: 'current' }).catch(() => ({ success: false, data: [] }))
    ]);

    const dashboardData = dashboardResponse?.data || {};
    const tikYaklasan = tikYaklasanResponse?.data?.data || [];
    const ogrenciler = ogrencilerResponse?.data?.data || [];

    // Risk skorlarına göre sırala
    const riskliOgrenciler = ogrenciler
      .filter(o => (o.mevcut_risk_skoru || 0) >= 50)
      .sort((a, b) => (b.mevcut_risk_skoru || 0) - (a.mevcut_risk_skoru || 0));

    this.data = {
      danisman: dashboardData.danisman || {},
      yuk: dashboardData.yuk || {},
      toplamOgrenci: ogrenciler.length,
      kritikRisk: riskliOgrenciler.filter(o => (o.mevcut_risk_skoru || 0) >= 85).length,
      tikYaklasan: tikYaklasan.slice(0, 5),
      ogrenciler: riskliOgrenciler,
      riskTrendi: this.calculateRiskTrend(ogrenciler)
    };
  }

  calculateRiskTrend(ogrenciler) {
    // Son 6 ay için risk trendi (basitleştirilmiş)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        value: Math.floor(Math.random() * 20) + 40 // Placeholder - gerçek veri API'den gelecek
      });
    }
    return months;
  }

  render() {
    if (!this.data) return;

    const { toplamOgrenci, kritikRisk, tikYaklasan, ogrenciler, riskTrendi } = this.data;

    this.container.innerHTML = `
      <div class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-normal text-gray-900">Benim Öğrencilerim</h1>
                <p class="text-sm text-gray-500 mt-1">Danışman Paneli - ${new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <div class="flex items-center gap-3">
                <button onclick="window.location.hash='/milestone/tik/yaklasan'" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                  TİK Takvimi
                </button>
                <button onclick="window.location.hash='/risk-analizi'" class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                  Risk Analizi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-6 max-w-7xl mx-auto">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" id="kpi-cards-container">
            <!-- KPI cards will be rendered here -->
          </div>

          <!-- Yaklaşan TİK Toplantıları -->
          ${tikYaklasan.length > 0 ? `
            <div class="mb-6" id="tik-yaklasan-container">
              <!-- Actionable list will be rendered here -->
            </div>
          ` : ''}

          <!-- Öğrenci Listesi -->
          <div class="card mb-6" id="ogrenci-liste-container">
            <!-- Student list will be rendered here -->
          </div>

          <!-- Risk Trendi -->
          <div class="card" id="risk-trendi-container">
            <!-- Chart will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Render components
    this.renderKPICards();
    this.renderTikYaklasan();
    this.renderOgrenciListe();
    this.renderRiskTrendi();
  }

  renderKPICards() {
    const container = this.container.querySelector('#kpi-cards-container');
    if (!container) return;

    const { toplamOgrenci, kritikRisk, tikYaklasan } = this.data;

    const kpiCards = [
      {
        id: 'toplam-ogrenci',
        title: 'Toplam Öğrenci',
        value: toplamOgrenci,
        color: 'primary',
        context: 'Danışmanlık yaptığınız öğrenci sayısı',
        actionButton: {
          label: 'Tümünü Gör',
          onClick: () => {
            window.location.hash = '/ogrenci?danisman_id=current';
          }
        }
      },
      {
        id: 'kritik-risk',
        title: 'Kritik Risk',
        value: kritikRisk,
        color: 'critical',
        context: `Risk skoru ≥85 olan öğrenciler`,
        actionButton: {
          label: 'Öğrencileri Gör',
          onClick: () => {
            window.location.hash = '/ogrenci?danisman_id=current&min_risk_skoru=85';
          }
        },
        drillDown: {
          enabled: true,
          onClick: () => {
            window.location.hash = '/ogrenci?danisman_id=current&min_risk_skoru=85';
          }
        }
      },
      {
        id: 'yaklasan-tik',
        title: 'Yaklaşan TİK',
        value: tikYaklasan.length,
        color: tikYaklasan.length > 0 ? 'high' : 'low',
        context: `Önümüzdeki 30 gün içinde TİK toplantısı olan öğrenciler`,
        actionButton: {
          label: 'TİK Takvimine Git',
          onClick: () => {
            window.location.hash = '/milestone/tik/yaklasan';
          }
        }
      }
    ];

    container.innerHTML = '';
    kpiCards.forEach(kpiData => {
      const cardContainer = document.createElement('div');
      container.appendChild(cardContainer);
      new ActionableKPICard(cardContainer, kpiData);
    });
  }

  renderTikYaklasan() {
    const container = this.container.querySelector('#tik-yaklasan-container');
    if (!container || !this.data.tikYaklasan.length) return;

    const tikItems = this.data.tikYaklasan.map(tik => ({
      id: `tik-${tik.topanti_id}`,
      priority: this.calculateDaysUntil(tik.topanti_tarihi) <= 15 ? 'high' : 'medium',
      title: `${tik.ogrenci?.ad || ''} ${tik.ogrenci?.soyad || ''} - TİK Toplantısı`,
      description: `Tarih: ${formatters.formatDate(tik.topanti_tarihi)}`,
      meta: `Kalan Süre: ${this.calculateDaysUntil(tik.topanti_tarihi)} gün`,
      badge: { type: 'high', label: 'TİK' },
      actions: [
        {
          label: 'TİK Kaydı',
          primary: true,
          onClick: () => {
            window.location.hash = `/milestone/tik?toplanti_id=${tik.topanti_id}`;
          }
        },
        {
          label: 'Öğrenci Detayı',
          onClick: () => {
            window.location.hash = `/ogrenci/${tik.ogrenci_id}`;
          }
        }
      ],
      onClick: () => {
        window.location.hash = `/ogrenci/${tik.ogrenci_id}`;
      }
    }));

    new ActionableList(container, {
      title: 'Yaklaşan TİK Toplantıları',
      items: tikItems,
      onItemClick: (item) => {
        if (item.onClick) {
          item.onClick();
        }
      }
    });
  }

  renderOgrenciListe() {
    const container = this.container.querySelector('#ogrenci-liste-container');
    if (!container) return;

    const { ogrenciler } = this.data;

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Öğrenci Listesi</h3>
        <p class="text-sm text-gray-500 mt-1">Risk skoruna göre sıralı - En yüksek riskli öğrenciler üstte</p>
      </div>
      <div class="card-body">
        ${ogrenciler.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Skoru</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${ogrenciler.map(ogrenci => this.renderOgrenciRow(ogrenci)).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="text-center py-8 text-gray-500">
            Riskli öğrenci bulunmuyor
          </div>
        `}
      </div>
    `;
  }

  renderOgrenciRow(ogrenci) {
    const riskSkoru = ogrenci.mevcut_risk_skoru || 0;
    const riskClass = riskSkoru >= 85 ? 'critical' : riskSkoru >= 70 ? 'high' : riskSkoru >= 50 ? 'medium' : 'low';
    
    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="window.location.hash='/ogrenci/${ogrenci.ogrenci_id}'">
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold badge-${riskClass}">
            ${riskSkoru}
          </span>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">
            ${ogrenci.ad || ''} ${ogrenci.soyad || ''}
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
          ${ogrenci.program_turleri?.program_adi || 'N/A'}
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
          ${ogrenci.durum_turleri?.durum_adi || 'Aktif'}
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
          <button 
            class="text-blue-600 hover:text-blue-800 font-medium"
            onclick="event.stopPropagation(); window.location.hash='/ogrenci/${ogrenci.ogrenci_id}'"
          >
            Detay →
          </button>
        </td>
      </tr>
    `;
  }

  renderRiskTrendi() {
    const container = this.container.querySelector('#risk-trendi-container');
    if (!container) return;

    const { riskTrendi } = this.data;

    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Risk Trendi</h3>
        <p class="text-sm text-gray-500 mt-1">Son 6 ay risk skoru trendi</p>
      </div>
      <div class="card-body" id="risk-trendi-chart"></div>
    `;

    const chartContainer = container.querySelector('#risk-trendi-chart');
    if (chartContainer && riskTrendi.length > 0) {
      new InteractiveChart(chartContainer, {
        type: 'line',
        id: 'risk-trendi',
        data: {
          labels: riskTrendi.map(r => r.label),
          values: riskTrendi.map(r => r.value)
        },
        colorScheme: 'primary',
        onClick: (point) => {
          // Tıklayınca o ayın detaylarını göster
          console.log('Risk trendi detay:', point);
        }
      });
    }
  }

  calculateDaysUntil(date) {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

