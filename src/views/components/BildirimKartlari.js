/**
 * Bildirim Kartları Component
 * Bildirimler listesi
 */

import formatters from '../../utils/formatters.js';

export class BildirimKartlari {
  constructor(container, bildirimler) {
    this.container = container;
    this.bildirimler = bildirimler;
    this.render();
  }

  render() {
    if (!this.bildirimler || this.bildirimler.length === 0) {
      this.container.innerHTML = '<p>Bildirim bulunmamaktadır.</p>';
      return;
    }

    const bildirimList = document.createElement('div');
    bildirimList.className = 'bildirim-list';

    bildirimList.innerHTML = this.bildirimler.map(bildirim => {
      const oncelikClass = bildirim.bildirim_onceligi?.toLowerCase() || 'orta';
      
      return `
        <div class="bildirim-item ${oncelikClass}">
          <div class="bildirim-header">
            <span class="badge ${oncelikClass}">${bildirim.bildirim_onceligi || 'Orta'}</span>
            <span class="bildirim-tarih">${formatters.formatDateDistance(bildirim.olusturma_tarihi)}</span>
          </div>
          <div class="bildirim-mesaj">${bildirim.mesaj || '-'}</div>
          <div class="bildirim-tur">${bildirim.bildirim_turleri?.bildirim_turu_adi || '-'}</div>
        </div>
      `;
    }).join('');

    this.container.appendChild(bildirimList);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

