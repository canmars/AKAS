/**
 * Action Table Component
 * Dinamik aksiyon tablosu - Grafik tıklama event'lerinden gelen veriyi gösterir
 * Tailwind CSS ile modern tasarım
 */

import formatters from '../../utils/formatters.js';

export class ActionTable {
  constructor(container) {
    this.container = container;
    this.currentData = null;
    this.currentType = null;
    this.render();
  }

  /**
   * Veriyi güncelle ve tabloyu render et
   * @param {Array} data - Gösterilecek veri
   * @param {String} type - Veri tipi ('attrition', 'bottleneck', 'load')
   * @param {String} title - Tablo başlığı
   */
  updateData(data, type, title) {
    this.currentData = data;
    this.currentType = type;
    
    // Container'ı görünür yap
    if (this.container) {
      this.container.classList.remove('hidden');
    }
    
    this.render(title);
    
    // Smooth scroll to action table
    setTimeout(() => {
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  render(title = 'Detay Verileri') {
    if (!this.currentData || this.currentData.length === 0) {
      // Başlangıçta boş bırak (gizli kalacak)
      this.container.innerHTML = '';
      return;
    }

    let tableContent = '';

    switch (this.currentType) {
      case 'attrition':
        tableContent = this.renderOgrenciTable(this.currentData, 'Sessiz Ölüm Radarı - Yüksek Riskli Öğrenciler');
        break;
      
      case 'bottleneck':
        tableContent = this.renderBottleneckTable(this.currentData, 'Kritik Darboğaz - ACİL_EYLEM Öğrencileri');
        break;
      
      case 'load':
        tableContent = this.renderDanismanOgrenciTable(this.currentData);
        break;
      
      default:
        tableContent = this.renderGenericTable(this.currentData, title);
    }

    // "Neden Buradayım?" bilgisini hazırla
    const nedenBuradayim = this.getNedenBuradayim();

    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">${title}</h3>
        ${nedenBuradayim ? `
          <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-semibold text-blue-900 mb-1">Neden Buradayım?</h4>
                <p class="text-sm text-blue-700">${nedenBuradayim}</p>
              </div>
            </div>
          </div>
        ` : ''}
        ${tableContent}
      </div>
    `;
  }

  /**
   * Öğrenci tablosu render et
   */
  renderOgrenciTable(data, title) {
    const table = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Öğrenci</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gün Sayısı</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Skoru</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${data.map(ogrenci => {
              const gun_sayisi = ogrenci.gun_sayisi || 999;
              const risk_skoru = ogrenci.risk_skoru || 0;
              const kritik_mi = gun_sayisi >= 180 && risk_skoru >= 70;
              
              const gunBadgeColor = gun_sayisi >= 180 ? 'bg-red-100 text-red-700' : 
                                    gun_sayisi >= 90 ? 'bg-orange-100 text-orange-700' : 
                                    'bg-green-100 text-green-700';
              
              const riskBadgeColor = risk_skoru >= 70 ? 'bg-red-100 text-red-700' : 
                                     risk_skoru >= 50 ? 'bg-orange-100 text-orange-700' : 
                                     'bg-green-100 text-green-700';
              
              return `
                <tr class="${kritik_mi ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'} transition-colors cursor-pointer"
                    onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${ogrenci.ad || ''} ${ogrenci.soyad || ''}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${gunBadgeColor}">
                      ${gun_sayisi === 999 ? 'Hiç giriş yapmamış' : `${gun_sayisi} gün`}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskBadgeColor}">
                      ${formatters.formatRiskSkoru(risk_skoru)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${kritik_mi ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                      ${kritik_mi ? 'Kritik' : 'Normal'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    return table;
  }

  /**
   * Darboğaz tablosu render et
   */
  renderBottleneckTable(data, title) {
    const table = `
      <div class="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p class="text-sm font-semibold text-yellow-800">
          ⚠️ <strong>Uyarı:</strong> ${data.length} öğrenci mezuniyet yolunda tıkandı. Acil müdahale gerekiyor!
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Öğrenci</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Yarıyıl</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seminer Durumu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${data.map(ogrenci => {
              const seminerDurum = ogrenci.seminer_durumu === 'seminer_yok' ? 'Seminer Yok' : 
                                   ogrenci.seminer_durumu === 'seminer_basarisiz' ? 'Başarısız' : 
                                   ogrenci.seminer_durumu === 'seminer_eksik' ? 'Eksik' : 'Tamam';
              
              return `
                <tr class="bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${ogrenci.ad || ''} ${ogrenci.soyad || ''}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${ogrenci.program_kodu || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${ogrenci.mevcut_yariyil || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">
                      ${seminerDurum}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-600 text-white">
                      ACİL_EYLEM
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    return table;
  }

  /**
   * Danışman öğrenci listesi render et
   */
  renderDanismanOgrenciTable(data) {
    if (!data.personel || !data.ogrenciler) {
      return '<p class="text-slate-500">Danışman öğrenci bilgisi bulunamadı.</p>';
    }

    const table = `
      <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h4 class="text-lg font-semibold text-slate-900 mb-2">${data.personel.ad || ''} ${data.personel.soyad || ''} - ${data.personel.unvan || ''}</h4>
        <p class="text-sm text-slate-600">
          Mevcut Yük: <span class="font-semibold">${formatters.formatNumber(data.personel.mevcut_yuk || 0)}</span> / 
          <span class="font-semibold">${formatters.formatNumber(data.personel.maksimum_kapasite || 0)}</span> 
          (${formatters.formatPercent(data.personel.kapasiteKullanimYuzdesi || 0)})
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Öğrenci</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Skoru</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${data.ogrenciler.map(ogrenci => {
              const risk_skoru = ogrenci.risk_skoru || 
                                (Array.isArray(ogrenci.ogrenci_risk_analizi) && ogrenci.ogrenci_risk_analizi.length > 0 
                                  ? ogrenci.ogrenci_risk_analizi[0].risk_skoru : 0) || 0;
              
              const riskBadgeColor = risk_skoru >= 70 ? 'bg-red-100 text-red-700' : 
                                     risk_skoru >= 50 ? 'bg-orange-100 text-orange-700' : 
                                     'bg-green-100 text-green-700';
              
              return `
                <tr class="hover:bg-slate-50 transition-colors cursor-pointer"
                    onclick="window.location.hash = '#/ogrenci/${ogrenci.ogrenci_id}'">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${ogrenci.ad || ''} ${ogrenci.soyad || ''}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${ogrenci.program_adi || ogrenci.program_turleri?.program_adi || 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskBadgeColor}">
                      ${formatters.formatRiskSkoru(risk_skoru)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${ogrenci.durum_adi || ogrenci.durum_turleri?.durum_adi || 'Aktif'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    return table;
  }

  /**
   * Generic tablo render et
   */
  renderGenericTable(data, title) {
    if (!data || data.length === 0) {
      return '<p class="text-slate-500">Veri bulunamadı.</p>';
    }

    const keys = Object.keys(data[0]);
    const table = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              ${keys.map(key => `
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">${key}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${data.map(row => `
              <tr class="hover:bg-slate-50 transition-colors">
                ${keys.map(key => `
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${row[key] || 'N/A'}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    return table;
  }

  /**
   * "Neden Buradayım?" bilgisini getir
   */
  getNedenBuradayim() {
    if (!this.currentData || this.currentData.length === 0) {
      return null;
    }

    switch (this.currentType) {
      case 'attrition':
        // İlk öğrencinin durumuna göre
        const firstOgrenci = this.currentData[0];
        const gun = firstOgrenci.gun_sayisi || 999;
        const risk = firstOgrenci.risk_skoru || 0;
        
        if (gun > 180 && risk >= 70) {
          return `Bu öğrenciler 180+ gündür sisteme giriş yapmamış ve risk skorları 70'in üzerinde. Acil müdahale gerekiyor.`;
        } else if (gun > 180) {
          return `Bu öğrenciler 180+ gündür sisteme giriş yapmamış. İletişim kurulması önerilir.`;
        } else if (risk >= 70) {
          return `Bu öğrencilerin risk skorları 70'in üzerinde. Detaylı inceleme yapılmalı.`;
        }
        return `Bu öğrenciler seçilen bölgede yer alıyor.`;
      
      case 'bottleneck':
        // İlk öğrencinin seminer durumuna göre
        const firstBottleneck = this.currentData[0];
        const seminerDurum = firstBottleneck.seminer_durumu || firstBottleneck.seminer_durum || '';
        const durumStatus = firstBottleneck.durum_statüsü || firstBottleneck.durum_statusu || '';
        
        if (durumStatus === 'ACİL_EYLEM') {
          if (seminerDurum === 'seminer_yok' || seminerDurum === 'seminer_eksik') {
            return `Bu öğrenciler 4. yarıyılda ve seminer dersini tamamlamamış. ACİL_EYLEM statüsünde. Mezuniyet yolunda tıkanmış durumda.`;
          } else if (seminerDurum === 'seminer_basarisiz') {
            return `Bu öğrenciler seminer dersini başarısız olmuş. Yeterlik sınavına hazırlanmalı. ACİL_EYLEM statüsünde.`;
          }
          return `Bu öğrenciler ACİL_EYLEM statüsünde. Mezuniyet yolunda tıkanmış durumda.`;
        } else {
          if (seminerDurum === 'seminer_yok' || seminerDurum === 'seminer_eksik') {
            return `Bu öğrenciler seminer dersini tamamlamamış. Seminer aşamasında bekliyorlar.`;
          } else if (seminerDurum === 'seminer_basarisiz') {
            return `Bu öğrenciler seminer dersini başarısız olmuş. Yeterlik sınavına hazırlanmalı.`;
          } else if (seminerDurum === 'seminer_tamam') {
            return `Bu öğrenciler seminer dersini tamamlamış. Tez aşamasına geçmiş durumda.`;
          }
        }
        return `Bu öğrenciler seçilen aşamada yer alıyor.`;
      
      case 'load':
        // Danışman kapasite durumuna göre
        const personel = this.currentData.personel;
        if (personel) {
          const percentage = personel.kapasiteKullanimYuzdesi || 0;
          if (personel.limit_asildi_mi) {
            return `Bu danışmanın kapasite kullanımı %${percentage.toFixed(1)} ve sert limiti aşmış durumda. Yeni öğrenci ataması yapılmamalı.`;
          } else if (personel.uyari_seviyesi_mi) {
            return `Bu danışmanın kapasite kullanımı %${percentage.toFixed(1)} ve yumuşak limiti aşmış durumda. Dikkatli öğrenci ataması yapılmalı.`;
          }
          return `Bu danışmanın kapasite kullanımı %${percentage.toFixed(1)}. Normal seviyede.`;
        }
        return `Bu danışmanın öğrenci listesi.`;
      
      default:
        return null;
    }
  }

  /**
   * Tabloyu temizle
   */
  clear() {
    this.currentData = null;
    this.currentType = null;
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
