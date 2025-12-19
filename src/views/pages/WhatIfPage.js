/**
 * What-If Page
 * What-If simülasyon sayfası
 */

import ApiService from '../../services/ApiService.js';
import { WhatIfSimulasyon } from '../components/WhatIfSimulasyon.js';

export class WhatIfPage {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="what-if-page">
        <div class="page-header">
          <button class="btn btn-secondary" onclick="window.location.hash='/dashboard'">
            ← Geri
          </button>
          <h1>What-If Simülasyonu</h1>
          <p>Yeni öğrenci ataması simülasyonu</p>
        </div>
        
        <div id="what-if-simulasyon-container"></div>
      </div>
    `;

    const simulasyonContainer = document.getElementById('what-if-simulasyon-container');
    this.simulasyon = new WhatIfSimulasyon(simulasyonContainer);
  }

  destroy() {
    if (this.simulasyon) {
      this.simulasyon.destroy();
    }
  }
}

