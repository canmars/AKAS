/**
 * Danışman Yük Grafik Component
 * Danışman yük dağılımı (Bar Chart veya Tablo)
 */

import formatters from '../../utils/formatters.js';

export class DanismanYukGrafik {
  constructor(container, yukDagilimi) {
    this.container = container;
    this.yukDagilimi = yukDagilimi;
    this.render();
  }

  render() {
    if (!this.yukDagilimi || this.yukDagilimi.length === 0) {
      this.container.innerHTML = '<p>Danışman yük bilgisi bulunmamaktadır.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';

    table.innerHTML = `
      <thead>
        <tr>
          <th>Hoca</th>
          <th>Unvan</th>
          <th>Mevcut Yük</th>
          <th>Maksimum Kapasite</th>
          <th>Kullanım %</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${this.yukDagilimi.map(personel => {
          const kullanimYuzdesi = personel.kapasiteKullanimYuzdesi || 0;
          const durumClass = kullanimYuzdesi >= 90 ? 'kritik' : kullanimYuzdesi >= 70 ? 'yuksek' : 'dusuk';
          
          return `
            <tr>
              <td>${personel.ad} ${personel.soyad}</td>
              <td>${personel.unvan}</td>
              <td>${personel.mevcut_yuk}</td>
              <td>${personel.maksimum_kapasite}</td>
              <td>${formatters.formatPercent(kullanimYuzdesi)}</td>
              <td><span class="badge ${durumClass}">${durumClass === 'kritik' ? 'Dolu' : durumClass === 'yuksek' ? 'Yüksek' : 'Normal'}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    this.container.appendChild(table);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

