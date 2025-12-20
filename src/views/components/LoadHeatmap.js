/**
 * Load Heatmap Component
 * Danışman Yük Isı Haritası - Chart.js Bar Chart
 * Renk kodlaması: Kırmızı (sert_limit aşıldı), Sarı (yumusak_limit aşıldı), Yeşil (normal)
 */

import { Chart, registerables } from 'chart.js';
import ApiService from '../../services/ApiService.js';

Chart.register(...registerables);

// CDN'den yüklenen datalabels plugin'i global olarak erişilebilir
// Plugin CDN'den yüklendiğinde otomatik olarak Chart.js'e eklenir

export class LoadHeatmap {
  constructor(container, data, onBarClick) {
    this.container = container;
    this.data = data || [];
    this.onBarClick = onBarClick || (() => {});
    this.chart = null;
    this.summaryContainer = null;
    this.render();
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-64">
          <p class="text-slate-500 text-center">Danışman yük bilgisi bulunmamaktadır.</p>
        </div>
      `;
      return;
    }

    // Summary container'ı bul
    this.summaryContainer = document.getElementById('load-summary');

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Veriyi Chart.js formatına çevir
    const chartData = this.prepareData();

    // Dinamik özet hesapla
    const limitAsanSayisi = this.data.filter(p => p.limit_asildi_mi).length;
    const uyariSayisi = this.data.filter(p => p.uyari_seviyesi_mi && !p.limit_asildi_mi).length;

    // Dinamik özet güncelle
    if (this.summaryContainer) {
      let summaryParts = [];
      if (limitAsanSayisi > 0) {
        summaryParts.push(`<span class="text-red-600 font-bold">${limitAsanSayisi}</span> danışman limit aştı`);
      }
      if (uyariSayisi > 0) {
        summaryParts.push(`<span class="text-yellow-600 font-bold">${uyariSayisi}</span> danışman uyarı seviyesinde`);
      }
      if (summaryParts.length === 0) {
        summaryParts.push('<span class="text-emerald-600 font-bold">Tüm danışmanlar normal kapasitede</span>');
      }
      this.summaryContainer.innerHTML = `<div class="text-sm text-slate-700 font-medium leading-relaxed">${summaryParts.join(' • ')}</div>`;
    } else {
      // Summary container bulunamadıysa console'a log
      console.warn('LoadHeatmap: Summary container bulunamadı (id: load-summary)');
    }

    // Chart oluştur
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: 'white',
            font: {
              weight: 'bold',
              size: 10
            },
            formatter: (value, context) => {
              const personel = this.data[context.dataIndex];
              const percentage = personel.kapasiteKullanimYuzdesi || 0;
              return `${value} (${percentage.toFixed(0)}%)`;
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const personel = this.data[context.dataIndex];
                const kullanim = personel.kapasiteKullanimYuzdesi || 0;
                const durum = personel.limit_asildi_mi ? 'Kritik (Limit Aşıldı)' : 
                             personel.uyari_seviyesi_mi ? 'Uyarı (Yumuşak Limit)' : 'Normal';
                return `${personel.ad} ${personel.soyad}: ${personel.mevcut_yuk}/${personel.maksimum_kapasite} (${kullanim.toFixed(1)}%) - ${durum}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Danışman',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            title: {
              display: true,
              text: 'Öğrenci Sayısı',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true
          }
        },
        onClick: async (event, elements) => {
          if (elements.length > 0 && this.onBarClick) {
            const element = elements[0];
            const index = element.index;
            const personel = this.data && this.data[index];
            
            if (!personel) {
              console.error('LoadHeatmap: Personel bulunamadı', { index, dataLength: this.data?.length });
              return;
            }
            
            // Seçilen danışmanın öğrenci listesini al
            try {
              console.log('LoadHeatmap: Öğrenci listesi alınıyor', { personel_id: personel.personel_id, ad: personel.ad, soyad: personel.soyad });
              
              // danisman_id ile öğrencileri filtrele
              const response = await ApiService.getOgrenciler({ 
                danisman_id: personel.personel_id 
              });
              
              console.log('LoadHeatmap: API yanıtı', { success: response?.success, dataLength: response?.data?.length });
              
              const ogrenciler = Array.isArray(response?.data) ? response.data : [];
              const title = `${personel.ad || ''} ${personel.soyad || ''} - Öğrenci Listesi`.trim();
              
              // Callback'i çağır (boş liste olsa bile modal açılsın)
              this.onBarClick(ogrenciler, 'load', title);
            } catch (error) {
              console.error('LoadHeatmap: Öğrenci listesi alınamadı', error);
              const title = `${personel.ad || ''} ${personel.soyad || ''} - Öğrenci Listesi`.trim();
              this.onBarClick([], 'load', title);
            }
          } else {
            console.warn('LoadHeatmap: onClick - elements veya onBarClick yok', { 
              hasElements: elements?.length > 0, 
              hasCallback: !!this.onBarClick 
            });
          }
        }
      }
    });
  }

  /**
   * Veriyi Chart.js formatına çevir ve renk kodlaması yap
   */
  prepareData() {
    const labels = this.data.map(p => `${p.ad} ${p.soyad}`);
    const values = this.data.map(p => p.mevcut_yuk || 0);
    
    // Her bar için renk belirle
    // %100'ü (Sert Limit) geçtiyse Kırmızı, %80'i geçtiyse Sarı
    const backgroundColors = this.data.map(p => {
      const percentage = p.kapasiteKullanimYuzdesi || 0;
      if (percentage >= 100) {
        return 'rgba(220, 38, 38, 0.9)'; // Kırmızı - Sert limit aşıldı
      } else if (percentage >= 80) {
        return 'rgba(234, 179, 8, 0.9)'; // Sarı - %80'i geçti
      } else {
        return 'rgba(59, 130, 246, 0.7)'; // Mavi - Normal
      }
    });

    const borderColors = this.data.map(p => {
      const percentage = p.kapasiteKullanimYuzdesi || 0;
      if (percentage >= 100) {
        return 'rgba(220, 38, 38, 1)';
      } else if (percentage >= 80) {
        return 'rgba(234, 179, 8, 1)';
      } else {
        return 'rgba(59, 130, 246, 1)';
      }
    });

    return {
      labels: labels,
      datasets: [{
        label: 'Mevcut Yük',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    };
  }

  updateData(newData) {
    this.data = newData || [];
    if (this.chart) {
      this.chart.destroy();
    }
    this.render();
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.container.innerHTML = '';
  }
}
