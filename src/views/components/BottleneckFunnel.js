/**
 * Bottleneck Funnel Component
 * Darboğaz Hunisi - Horizontal Bar Chart
 * Kategoriler: Ders Aşamasında | Seminer Bekleyen | Yeterlik Bekleyen | Tez Aşamasında
 * Multi-color categories, etiketleme, dinamik özet
 */

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// CDN'den yüklenen datalabels plugin'i global olarak erişilebilir
// Plugin CDN'den yüklendiğinde otomatik olarak Chart.js'e eklenir

export class BottleneckFunnel {
  constructor(container, data, onChartClick) {
    this.container = container;
    this.data = data || [];
    this.onChartClick = onChartClick || (() => {});
    this.chart = null;
    this.summaryContainer = null;
    this.render();
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Summary container'ı bul
    this.summaryContainer = document.getElementById('bottleneck-summary');

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Veriyi Chart.js formatına çevir
    const chartData = this.prepareData();

    // Dinamik özet hesapla
    const toplamAcil = chartData.datasets[1].data.reduce((sum, val) => sum + val, 0);
    const kategoriSayilari = chartData.labels.map((label, index) => {
      const normal = chartData.datasets[0].data[index];
      const acil = chartData.datasets[1].data[index];
      return { label, toplam: normal + acil, acil };
    });

    // Dinamik özet güncelle
    if (this.summaryContainer) {
      const kategoriMetinleri = kategoriSayilari
        .filter(k => k.toplam > 0)
        .map(k => `${k.label}: ${k.toplam}${k.acil > 0 ? ` (${k.acil} ACİL)` : ''}`)
        .join(' • ');
      
      this.summaryContainer.innerHTML = `
        <div class="flex items-center space-x-2 flex-wrap">
          <span class="text-slate-600">${kategoriMetinleri}</span>
          ${toplamAcil > 0 ? `<span class="text-red-600 font-semibold">⚠️ ${toplamAcil} ACİL_EYLEM</span>` : ''}
        </div>
      `;
    }

    // Chart oluştur
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y', // Yatay bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || '';
                return `${datasetLabel}: ${context.parsed.x} öğrenci`;
              }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'right',
            color: 'white',
            font: {
              weight: 'bold',
              size: 11
            },
            formatter: (value, context) => {
              // Sadece toplam değeri göster (stacked bar için)
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              if (datasetIndex === 1) {
                // ACİL_EYLEM dataset'inde, toplam değeri göster
                const normalValue = chartData.datasets[0].data[dataIndex];
                const acilValue = chartData.datasets[1].data[dataIndex];
                const total = normalValue + acilValue;
                return total > 0 ? total : '';
              }
              return '';
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Öğrenci Sayısı',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Aşama',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const category = chartData.labels[index];
            
            // Stacked bar'da: datasetIndex 0 = Normal (ilk dataset), 1 = ACİL_EYLEM (son dataset)
            // Ama bizim yapımızda: 0-3 = Normal kategoriler, 4 = ACİL_EYLEM
            // Chart.js stacked bar'da her kategori için ayrı dataset varsa, datasetIndex kategori index'i olur
            // Son dataset ACİL_EYLEM ise, datasetIndex === labels.length olur
            const isAcil = datasetIndex === chartData.datasets.length - 1;
            
            // Tıklanan kategoriye ait öğrencileri bul
            const clickedData = this.getCategoryStudents(category, isAcil);
            this.onChartClick(clickedData, 'bottleneck', `Darboğaz - ${category}`);
          }
        }
      }
    });
  }

  /**
   * Veriyi kategorilere göre grupla ve multi-color stacked bar için hazırla
   * Her kategori farklı renkte olacak
   */
  prepareData() {
    const categories = {
      'Ders Aşamasında': { normal: 0, acil: 0, students: [] },
      'Seminer Bekleyen': { normal: 0, acil: 0, students: [] },
      'Yeterlik Bekleyen': { normal: 0, acil: 0, students: [] },
      'Tez Aşamasında': { normal: 0, acil: 0, students: [] }
    };

    // Öğrencileri kategorilere göre grupla
    this.data.forEach(ogrenci => {
      let category = 'Ders Aşamasında'; // Varsayılan
      
      // Seminer durumuna göre kategori belirle
      // View'dan gelen alan isimlerini kontrol et (hem snake_case hem camelCase)
      const seminerDurum = ogrenci.seminer_durumu || ogrenci.seminer_durum || ogrenci.seminerDurumu || '';
      const durumStatus = ogrenci.durum_statüsü || ogrenci.durum_statusu || ogrenci.durumStatusu || '';
      const mevcutYariyil = ogrenci.mevcut_yariyil || ogrenci.mevcutYariyil || 0;
      
      // Kategori belirleme mantığı
      // Önce seminer durumunu kontrol et
      if (seminerDurum === 'seminer_yok' || seminerDurum === 'seminer_eksik' || seminerDurum === 'B') {
        category = 'Seminer Bekleyen';
      } else if (seminerDurum === 'seminer_basarisiz' || seminerDurum === 'C' || seminerDurum === 'D' || seminerDurum === 'F') {
        category = 'Yeterlik Bekleyen';
      } else if (seminerDurum === 'seminer_tamam' || seminerDurum === 'A' || durumStatus === 'TEZ_ASAMASINDA' || durumStatus === 'TEZ_ASAMASINDA') {
        category = 'Tez Aşamasında';
      } else if (mevcutYariyil < 4) {
        // 4. yarıyıldan önceki öğrenciler ders aşamasında
        category = 'Ders Aşamasında';
      } else {
        // Varsayılan: Ders aşamasında (seminer durumu bilinmiyor veya başka bir durum)
        category = 'Ders Aşamasında';
      }

      const isAcil = durumStatus === 'ACİL_EYLEM' || ogrenci.acil_eylem_mi === true || ogrenci.acilEylemMi === true;
      
      if (isAcil) {
        categories[category].acil++;
      } else {
        categories[category].normal++;
      }
      
      categories[category].students.push(ogrenci);
    });

    // Debug: Kategori dağılımını ve örnek verileri console'a yazdır
    const seminerDurumDagilimi = {};
    this.data.forEach(o => {
      const durum = o.seminer_durumu || o.seminer_durum || 'bilinmiyor';
      seminerDurumDagilimi[durum] = (seminerDurumDagilimi[durum] || 0) + 1;
    });
    
    console.log('BottleneckFunnel Kategori Dağılımı:', {
      'Ders Aşamasında': categories['Ders Aşamasında'].normal + categories['Ders Aşamasında'].acil,
      'Seminer Bekleyen': categories['Seminer Bekleyen'].normal + categories['Seminer Bekleyen'].acil,
      'Yeterlik Bekleyen': categories['Yeterlik Bekleyen'].normal + categories['Yeterlik Bekleyen'].acil,
      'Tez Aşamasında': categories['Tez Aşamasında'].normal + categories['Tez Aşamasında'].acil,
      'Toplam': this.data.length
    });
    
    console.log('Seminer Durumu Dağılımı (View\'dan gelen):', seminerDurumDagilimi);
    
    // İlk 3 öğrencinin detaylarını göster
    if (this.data.length > 0) {
      console.log('Örnek Öğrenci Verileri (İlk 3):', this.data.slice(0, 3).map(o => ({
        ad: o.ad,
        soyad: o.soyad,
        seminer_durumu: o.seminer_durumu || o.seminer_durum,
        durum_statüsü: o.durum_statüsü || o.durum_statusu,
        mevcut_yariyil: o.mevcut_yariyil || o.mevcutYariyil
      })));
    }

    const labels = Object.keys(categories);
    
    // Her kategori için farklı renkler
    const categoryColors = {
      'Ders Aşamasında': { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' }, // Mavi
      'Seminer Bekleyen': { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' }, // Amber/Turuncu
      'Yeterlik Bekleyen': { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' }, // Mor
      'Tez Aşamasında': { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' } // Emerald/Yeşil
    };

    // Normal dataset (her kategori için kendi rengi)
    const normalData = labels.map(label => categories[label].normal);
    const normalBackgroundColors = labels.map(label => categoryColors[label].bg);
    const normalBorderColors = labels.map(label => categoryColors[label].border);

    // ACİL_EYLEM dataset'i (kırmızı, tüm kategoriler için)
    const acilData = labels.map(label => categories[label].acil);

    // Tüm öğrencileri sakla (tıklama için)
    this.categoriesData = categories;

    return {
      labels: labels,
      datasets: [
        {
          label: 'Normal',
          data: normalData,
          backgroundColor: normalBackgroundColors,
          borderColor: normalBorderColors,
          borderWidth: 1
        },
        {
          label: 'ACİL_EYLEM',
          data: acilData,
          backgroundColor: 'rgba(220, 38, 38, 0.9)', // Kırmızı
          borderColor: 'rgba(220, 38, 38, 1)',
          borderWidth: 2
        }
      ]
    };
  }

  /**
   * Kategoriye ait öğrencileri getir
   */
  getCategoryStudents(category, isAcil) {
    if (!this.categoriesData || !this.categoriesData[category]) {
      return [];
    }

    if (isAcil) {
      return this.categoriesData[category].students.filter(s => 
        (s.durum_statüsü === 'ACİL_EYLEM' || s.durum_statusu === 'ACİL_EYLEM')
      );
    } else {
      return this.categoriesData[category].students.filter(s => 
        (s.durum_statüsü !== 'ACİL_EYLEM' && s.durum_statusu !== 'ACİL_EYLEM')
      );
    }
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
