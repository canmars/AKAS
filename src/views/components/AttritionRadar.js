/**
 * Attrition Radar Component
 * Sessiz Ölüm Radarı - Chart.js Scatter Plot
 * X Ekseni: Son giriş gün sayısı, Y Ekseni: Risk skoru
 * Annotations ile 4 bölge, risk skoruna göre renk gradient
 */

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// CDN'den yüklenen annotation plugin'i global olarak erişilebilir
// Plugin CDN'den yüklendiğinde otomatik olarak Chart.js'e eklenir

export class AttritionRadar {
  constructor(container, data, onPointClick) {
    this.container = container;
    this.data = data || [];
    this.onPointClick = onPointClick || (() => {});
    this.chart = null;
    this.summaryContainer = null;
    this.render();
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-64">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Summary container'ı bul
    this.summaryContainer = document.getElementById('attrition-summary');

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    // Veriyi Chart.js formatına çevir (risk skoruna göre renk gradient)
    const datasets = this.prepareData();

    // Kritik bölge sayısını hesapla (180+ gün VE 70+ risk)
    const kritikSayisi = this.data.filter(o => {
      const gun = o.gun_sayisi || 999;
      const risk = o.risk_skoru || 0;
      return gun > 180 && risk >= 70;
    }).length;

    // Dinamik özet güncelle
    if (this.summaryContainer) {
      this.summaryContainer.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="text-red-600">⚠️</span>
          <span>Şu an <strong class="text-red-600">${kritikSayisi}</strong> öğrenci kritik bölgede.</span>
        </div>
      `;
    }

    // Chart oluştur
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: datasets
      },
      options: {
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
                const point = context.raw;
                const gunText = point.gun_sayisi === 999 ? 'Hiç giriş yapmamış' : `${point.gun_sayisi} Gündür Girmiyor`;
                return `${point.label} - ${gunText} - Risk: %${point.risk_skoru}`;
              }
            }
          },
          annotation: {
            annotations: {
              // Sağ Üst (Kırmızı) - Müdahale Et: 180+ gün, 70+ risk
              müdahaleEt: {
                type: 'box',
                xMin: 180,
                xMax: 365,
                yMin: 70,
                yMax: 100,
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderColor: 'rgba(220, 38, 38, 0.5)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Müdahale Et',
                  position: 'end',
                  backgroundColor: 'rgba(220, 38, 38, 0.8)',
                  color: 'white',
                  font: {
                    size: 11,
                    weight: 'bold'
                  },
                  padding: 4
                }
              },
              // Sağ Alt (Sarı) - İzle: 180+ gün, <70 risk
              izle: {
                type: 'box',
                xMin: 180,
                xMax: 365,
                yMin: 0,
                yMax: 70,
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                borderColor: 'rgba(234, 179, 8, 0.5)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'İzle',
                  position: 'end',
                  backgroundColor: 'rgba(234, 179, 8, 0.8)',
                  color: 'white',
                  font: {
                    size: 11,
                    weight: 'bold'
                  },
                  padding: 4
                }
              },
              // Sol Üst (Turuncu) - Dikkat: <180 gün, 70+ risk
              dikkat: {
                type: 'box',
                xMin: 0,
                xMax: 180,
                yMin: 70,
                yMax: 100,
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderColor: 'rgba(249, 115, 22, 0.5)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Dikkat',
                  position: 'start',
                  backgroundColor: 'rgba(249, 115, 22, 0.8)',
                  color: 'white',
                  font: {
                    size: 11,
                    weight: 'bold'
                  },
                  padding: 4
                }
              },
              // Sol Alt (Yeşil) - Güvenli: <180 gün, <70 risk
              güvenli: {
                type: 'box',
                xMin: 0,
                xMax: 180,
                yMin: 0,
                yMax: 70,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Güvenli',
                  position: 'start',
                  backgroundColor: 'rgba(34, 197, 94, 0.8)',
                  color: 'white',
                  font: {
                    size: 11,
                    weight: 'bold'
                  },
                  padding: 4
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Son Girişten Geçen Gün Sayısı',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            min: 0,
            max: 365,
            ticks: {
              stepSize: 50,
              callback: function(value) {
                if (value === 365) return '365+';
                return value;
              }
            },
            grid: {
              color: (context) => {
                if (context.tick.value === 180) {
                  return 'rgba(231, 76, 60, 0.5)';
                }
                return 'rgba(0, 0, 0, 0.1)';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Risk Skoru',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20
            },
            grid: {
              color: (context) => {
                if (context.tick.value === 70) {
                  return 'rgba(231, 76, 60, 0.5)';
                }
                return 'rgba(0, 0, 0, 0.1)';
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const point = this.chart.data.datasets[datasetIndex].data[index];
            
            // Tıklanan noktaya ait tüm öğrencileri bul (aynı bölgedeki)
            const clickedData = this.getClickedRegionData(point);
            this.onPointClick(clickedData, 'attrition', 'Sessiz Ölüm Radarı - Detaylar');
          }
        }
      }
    });
  }

  /**
   * Veriyi Chart.js formatına çevir ve risk skoruna göre renk gradient uygula
   * Her nokta risk skoruna göre farklı renkte olacak
   */
  prepareData() {
    // Risk skoruna göre grupla
    const riskGruplari = {
      dusuk: [],    // 0-30: Yeşil
      orta: [],     // 31-50: Sarı
      yuksek: [],   // 51-70: Turuncu
      kritik: []    // 71-100: Kırmızı
    };

    this.data.forEach(ogrenci => {
      const gun_sayisi = ogrenci.gun_sayisi || 999;
      const risk_skoru = ogrenci.risk_skoru || 0;
      
      // 999 değerini 365+ (en sağ uç) olarak sabitle
      const xValue = gun_sayisi === 999 ? 365 : Math.min(gun_sayisi, 365);
      
      const point = {
        x: xValue,
        y: risk_skoru,
        label: `${ogrenci.ad || ''} ${ogrenci.soyad || ''}`,
        ogrenci_id: ogrenci.ogrenci_id,
        gun_sayisi: gun_sayisi,
        risk_skoru: risk_skoru,
        ogrenci: ogrenci
      };

      // Risk skoruna göre grupla
      if (risk_skoru <= 30) {
        riskGruplari.dusuk.push(point);
      } else if (risk_skoru <= 50) {
        riskGruplari.orta.push(point);
      } else if (risk_skoru <= 70) {
        riskGruplari.yuksek.push(point);
      } else {
        riskGruplari.kritik.push(point);
      }
    });

    return [
      {
        label: 'Düşük Risk (0-30)',
        data: riskGruplari.dusuk,
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Yeşil
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Orta Risk (31-50)',
        data: riskGruplari.orta,
        backgroundColor: 'rgba(234, 179, 8, 0.8)', // Sarı
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        label: 'Yüksek Risk (51-70)',
        data: riskGruplari.yuksek,
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // Turuncu
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Kritik Risk (71-100)',
        data: riskGruplari.kritik,
        backgroundColor: 'rgba(220, 38, 38, 0.9)', // Kırmızı
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10
      }
    ];
  }

  /**
   * Tıklanan bölgedeki öğrencileri getir
   */
  getClickedRegionData(clickedPoint) {
    const gun_sayisi = clickedPoint.gun_sayisi;
    const risk_skoru = clickedPoint.risk_skoru;
    
    // Aynı bölgedeki öğrencileri filtrele
    return this.data.filter(ogrenci => {
      const ogun = ogrenci.gun_sayisi || 999;
      const orisk = ogrenci.risk_skoru || 0;
      
      // Kritik bölge (180+ gün VE 70+ risk)
      if (gun_sayisi > 180 && risk_skoru >= 70) {
        return ogun > 180 && orisk >= 70;
      }
      // İzle bölgesi (180+ gün, <70 risk)
      else if (gun_sayisi > 180 && risk_skoru < 70) {
        return ogun > 180 && orisk < 70;
      }
      // Dikkat bölgesi (<180 gün, 70+ risk)
      else if (gun_sayisi <= 180 && risk_skoru >= 70) {
        return ogun <= 180 && orisk >= 70;
      }
      // Güvenli bölge (<180 gün, <70 risk)
      else {
        return ogun <= 180 && orisk < 70;
      }
    });
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
