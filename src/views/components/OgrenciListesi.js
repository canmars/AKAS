/**
 * Öğrenci Listesi Component
 * Kritik risk altındaki öğrenciler listesi
 */

import formatters from '../../utils/formatters.js';

export class OgrenciListesi {
  constructor(container, ogrenciler) {
    this.container = container;
    this.ogrenciler = ogrenciler;
    this.render();
  }

  render() {
    if (!this.ogrenciler || this.ogrenciler.length === 0) {
      this.container.innerHTML = '<p>Kritik risk altında öğrenci bulunmamaktadır.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';

    table.innerHTML = `
      <thead>
        <tr>
          <th>Öğrenci</th>
          <th>Program</th>
          <th>Risk Skoru</th>
          <th>Risk Seviyesi</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${this.ogrenciler.map(ogrenci => {
          const riskSeviyesi = this.getRiskSeviyesi(ogrenci.mevcut_risk_skoru);
          const programAdi = ogrenci.program_turleri?.program_adi || '-';
          
          return `
            <tr>
              <td>${ogrenci.ogrenci_id ? 'Öğrenci ' + ogrenci.ogrenci_id.substring(0, 8) : '-'}</td>
              <td>${programAdi}</td>
              <td>${formatters.formatRiskSkoru(ogrenci.mevcut_risk_skoru)}</td>
              <td><span class="badge ${riskSeviyesi.toLowerCase()}">${riskSeviyesi}</span></td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="window.location.hash='/ogrenci/${ogrenci.ogrenci_id}'">
                  Detay
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    this.container.appendChild(table);
  }

  getRiskSeviyesi(skor) {
    if (skor <= 30) return 'Dusuk';
    if (skor <= 50) return 'Orta';
    if (skor <= 70) return 'Yuksek';
    return 'Kritik';
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

