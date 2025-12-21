/**
 * Risk Analizi Page - Tableau Style
 * Risk skoru dağılımı, öğrenci listesi, risk trendi
 */

import ApiService from '../../services/ApiService.js';
import { InteractiveChart } from '../components/InteractiveChart.js';
import { DrillDownModal } from '../components/DrillDownModal.js';
import { ContextualFilters } from '../components/ContextualFilters.js';
import { BulkActions } from '../components/BulkActions.js';
import formatters from '../../utils/formatters.js';

export class RiskAnaliziPageTableau {
  constructor(container) {
    this.container = container;
    this.data = null;
    this.filters = {};
    this.drillDownModal = null;
    this.bulkActions = null;
    this.selectedOgrenciler = [];
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      
      // URL'den filtreleri al
      const urlParams = new URLSearchParams(window.location.search);
      this.filters = {
        min_risk_skoru: urlParams.get('min_risk_skoru') ? parseInt(urlParams.get('min_risk_skoru')) : undefined,
        max_risk_skoru: urlParams.get('max_risk_skoru') ? parseInt(urlParams.get('max_risk_skoru')) : undefined,
        program_turu_id: urlParams.get('program_turu_id') || undefined
      };

      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Risk analizi yükleme hatası:', error);
      this.showError('Risk analizleri yüklenirken bir hata oluştu.');
    } finally {
      this.hideLoading();
    }
  }

  async loadData() {
    const [riskDagilimiResponse, ogrencilerResponse] = await Promise.all([
      ApiService.getRiskDagilimi().catch(() => ({ success: false, data: {} })),
      ApiService.getOgrenci(this.filters).catch(() => ({ success: false, data: [] }))
    ]);

    this.data = {
      riskDagilimi: riskDagilimiResponse?.data || {},
      ogrenciler: Array.isArray(ogrencilerResponse?.data) ? ogrencilerResponse.data : []
    };
  }

  render() {
    if (!this.data) return;

    const { riskDagilimi, ogrenciler } = this.data;

    this.container.innerHTML = `
      <div class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-normal text-gray-900">Risk Analizi</h1>
                <p class="text-sm text-gray-500 mt-1">Öğrenci risk skorları ve dağılımı</p>
              </div>
              <button 
                onclick="window.location.hash='/dashboard'"
                class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                ← Dashboard'a Dön
              </button>
            </div>
          </div>
        </div>

        <div class="px-6 py-6 max-w-7xl mx-auto">
          <!-- Filters -->
          <div class="mb-6" id="filters-container">
            <!-- Filters will be rendered here -->
          </div>

          <!-- Bulk Actions -->
          <div class="mb-6 hidden" id="bulk-actions-container">
            <!-- Bulk actions will be rendered here -->
          </div>

          <!-- Risk Skoru Dağılımı -->
          <div class="card mb-6" id="risk-distribution-container">
            <!-- Chart will be rendered here -->
          </div>

          <!-- Öğrenci Listesi -->
          <div class="card mb-6" id="ogrenci-liste-container">
            <!-- Table will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Render components
    this.renderFilters();
    this.renderBulkActions();
    this.renderRiskDistribution();
    this.renderOgrenciListe();
  }

  renderBulkActions() {
    const container = this.container.querySelector('#bulk-actions-container');
    if (!container) return;

    const { ogrenciler } = this.data;

    this.bulkActions = new BulkActions(container, {
      items: ogrenciler.map(o => ({ id: o.ogrenci_id, ...o })),
      actions: [
        {
          label: 'Toplu Risk Analizi',
          primary: true,
          onClick: (selectedIds) => {
            this.handleBulkRiskAnalizi(selectedIds);
          }
        },
        {
          label: 'Toplu Bildirim Gönder',
          onClick: (selectedIds) => {
            this.handleBulkNotification(selectedIds);
          }
        },
        {
          label: 'Excel\'e Aktar',
          onClick: (selectedIds) => {
            this.exportToExcel(selectedIds);
          }
        }
      ],
      onSelectionChange: (selectedIds) => {
        this.selectedOgrenciler = selectedIds;
        const bulkContainer = this.container.querySelector('#bulk-actions-container');
        if (bulkContainer) {
          bulkContainer.classList.toggle('hidden', selectedIds.length === 0);
        }
      }
    });
  }

  renderFilters() {
    const container = this.container.querySelector('#filters-container');
    if (!container) return;

    new ContextualFilters(container, {
      filters: [
        {
          type: 'range',
          key: 'min_risk_skoru',
          label: 'Risk Skoru Aralığı',
          min: 0,
          max: 100,
          default: { min: this.filters.min_risk_skoru || 0, max: this.filters.max_risk_skoru || 100 }
        },
        {
          type: 'select',
          key: 'program_turu_id',
          label: 'Program Türü',
          options: [
            { value: '', label: 'Tümü' },
            { value: '1', label: 'Doktora' },
            { value: '2', label: 'Tezli Yüksek Lisans' },
            { value: '3', label: 'Tezsiz Yüksek Lisans (İÖ)' },
            { value: '4', label: 'Tezsiz Yüksek Lisans (Uzaktan)' }
          ],
          default: this.filters.program_turu_id || ''
        }
      ],
      quickFilters: ['Bugün', 'Bu Hafta', 'Bu Ay'],
      onFilterChange: (filters) => {
        this.filters = { ...this.filters, ...filters };
        this.loadData().then(() => {
          this.renderOgrenciListe();
        });
      }
    });
  }

  renderRiskDistribution() {
    const container = this.container.querySelector('#risk-distribution-container');
    if (!container) return;

    const { riskDagilimi } = this.data;
    
    container.innerHTML = `
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Risk Skoru Dağılımı</h3>
        <p class="text-sm text-gray-500 mt-1">Tıklayarak o risk seviyesindeki öğrencileri görebilirsiniz</p>
      </div>
      <div class="card-body" id="risk-donut-chart"></div>
    `;

    const chartContainer = container.querySelector('#risk-donut-chart');
    if (chartContainer) {
      new InteractiveChart(chartContainer, {
        type: 'donut',
        id: 'risk-distribution',
        data: {
          labels: ['Düşük Risk (0-30)', 'Orta Risk (31-50)', 'Yüksek Risk (51-70)', 'Kritik Risk (71-100)'],
          values: [
            riskDagilimi.dusuk || 0,
            riskDagilimi.orta || 0,
            riskDagilimi.yuksek || 0,
            riskDagilimi.kritik || 0
          ]
        },
        colorScheme: 'traffic-light',
        onClick: (segment) => {
          this.showDrillDown(segment);
        },
        tooltip: (data) => {
          return `${data.label}: ${data.value} öğrenci`;
        }
      });
    }
  }

  renderOgrenciListe() {
    const container = this.container.querySelector('#ogrenci-liste-container');
    if (!container) return;

    const { ogrenciler } = this.data;

    // Risk skoruna göre sırala
    const sortedOgrenciler = [...ogrenciler].sort((a, b) => {
      const riskA = a.mevcut_risk_skoru || 0;
      const riskB = b.mevcut_risk_skoru || 0;
      return riskB - riskA;
    });

    // Global erişim için
    window.riskAnaliziPage = this;
    
    // Bulk actions'ı güncelle
    if (this.bulkActions) {
      this.bulkActions.setItems(sortedOgrenciler.map(o => ({ id: o.ogrenci_id, ...o })));
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Öğrenci Listesi</h3>
            <p class="text-sm text-gray-500 mt-1">Risk skoruna göre sıralı - Tıklayarak detaylarına inebilirsiniz</p>
          </div>
          <button 
            class="btn btn-outline btn-sm"
            onclick="window.riskAnaliziPage?.exportToExcel()"
          >
            Excel'e Aktar
          </button>
        </div>
      </div>
      <div class="card-body">
        ${sortedOgrenciler.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bulk-select-all"
                      onclick="window.riskAnaliziPage?.toggleSelectAll(event)"
                    />
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sortable-header" data-column="risk_skoru">
                    Risk Skoru
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yarıyıl</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedOgrenciler.map(ogrenci => this.renderOgrenciRow(ogrenci)).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="text-center py-8 text-gray-500">
            Filtrelere uygun öğrenci bulunamadı
          </div>
        `}
      </div>
    `;
  }

  renderOgrenciRow(ogrenci) {
    const riskSkoru = ogrenci.mevcut_risk_skoru || 0;
    const riskClass = riskSkoru >= 85 ? 'critical' : riskSkoru >= 70 ? 'high' : riskSkoru >= 50 ? 'medium' : 'low';
    
    const isSelected = this.selectedOgrenciler.includes(ogrenci.ogrenci_id);
    
    return `
      <tr class="hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}" onclick="event.stopPropagation(); window.riskAnaliziPage?.handleRowClick(event, '${ogrenci.ogrenci_id}')">
        <td class="px-4 py-3 whitespace-nowrap" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bulk-select-item"
            data-ogrenci-id="${ogrenci.ogrenci_id}"
            ${isSelected ? 'checked' : ''}
            onclick="event.stopPropagation(); window.riskAnaliziPage?.toggleItem('${ogrenci.ogrenci_id}')"
          />
        </td>
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
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
          ${ogrenci.mevcut_yariyil || '-'}
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

  toggleSelectAll(event) {
    event.stopPropagation();
    if (this.bulkActions) {
      if (event.target.checked) {
        this.bulkActions.selectAll();
      } else {
        this.bulkActions.clearSelection();
      }
      this.renderOgrenciListe();
    }
  }

  toggleItem(ogrenciId) {
    if (this.bulkActions) {
      this.bulkActions.toggleItem(ogrenciId);
      this.selectedOgrenciler = this.bulkActions.getSelectedItems();
      this.renderOgrenciListe();
    }
  }

  handleRowClick(event, ogrenciId) {
    // Checkbox'a tıklanmadıysa öğrenci detayına git
    if (!event.target.closest('.bulk-select-item') && !event.target.closest('.bulk-select-all')) {
      window.location.hash = `/ogrenci/${ogrenciId}`;
    }
  }

  handleBulkRiskAnalizi(selectedIds) {
    // Toplu risk analizi için modal veya sayfa aç
    alert(`${selectedIds.length} öğrenci için toplu risk analizi yapılacak. (Özellik yakında eklenecek)`);
  }

  handleBulkNotification(selectedIds) {
    // Toplu bildirim gönderme modal'ı aç
    alert(`${selectedIds.length} öğrenciye bildirim gönderilecek. (Özellik yakında eklenecek)`);
  }

  exportToExcel(selectedIds = null) {
    const { ogrenciler } = this.data;
    const exportData = selectedIds 
      ? ogrenciler.filter(o => selectedIds.includes(o.ogrenci_id))
      : ogrenciler;

    // CSV formatında export
    const headers = ['Ad', 'Soyad', 'Program', 'Risk Skoru', 'Durum', 'Yarıyıl'];
    const rows = exportData.map(o => [
      o.ad || '',
      o.soyad || '',
      o.program_turleri?.program_adi || '',
      o.mevcut_risk_skoru || 0,
      o.durum_turleri?.durum_adi || '',
      o.mevcut_yariyil || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk_analizi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  showDrillDown(segment) {
    // Segment'e göre risk aralığı belirle
    let minRisk, maxRisk;
    const label = segment.label.toLowerCase();
    
    if (label.includes('düşük')) {
      minRisk = 0;
      maxRisk = 30;
    } else if (label.includes('orta')) {
      minRisk = 31;
      maxRisk = 50;
    } else if (label.includes('yüksek')) {
      minRisk = 51;
      maxRisk = 70;
    } else if (label.includes('kritik')) {
      minRisk = 71;
      maxRisk = 100;
    }

    // Modal container oluştur
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    ApiService.getOgrenci({ min_risk_skoru: minRisk, max_risk_skoru: maxRisk }).then(response => {
      const ogrenciler = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      this.drillDownModal = new DrillDownModal(modalContainer, {
        title: `${segment.label} Öğrencileri`,
        data: ogrenciler,
        columns: [
          { key: 'ad', label: 'Ad' },
          { key: 'soyad', label: 'Soyad' },
          { key: 'program_turleri.program_adi', label: 'Program' },
          { key: 'mevcut_risk_skoru', label: 'Risk Skoru', formatter: (val) => `${val || 0}` },
          { key: 'durum_turleri.durum_adi', label: 'Durum' }
        ],
        onRowClick: (row) => {
          window.location.hash = `/ogrenci/${row.ogrenci_id}`;
          this.drillDownModal.close();
        },
        exportButton: true,
        onClose: () => {
          document.body.removeChild(modalContainer);
        }
      });
    });
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
  }
}

