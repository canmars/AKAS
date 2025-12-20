/**
 * Critical Students List Component
 * Acil İlgilenilmesi Gereken Öğrenciler Listesi
 * Tailwind CSS ile modern tasarım
 */

import formatters from '../../utils/formatters.js';

export class CriticalStudentsList {
  constructor(container, studentsData = []) {
    this.container = container;
    this.studentsData = studentsData;
    this.render();
  }

  render() {
    if (!this.studentsData || this.studentsData.length === 0) {
      this.container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Acil İlgilenilmesi Gereken Öğrenciler</h2>
          <p class="text-slate-500 text-center py-8">Acil durumda öğrenci bulunmuyor</p>
        </div>
      `;
      return;
    }

    // İlk 5 öğrenciyi al
    const topStudents = this.studentsData.slice(0, 5);

    this.container.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">Acil İlgilenilmesi Gereken Öğrenciler</h2>
          <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            ${this.studentsData.length} Öğrenci
          </span>
        </div>
        <div class="space-y-3">
          ${topStudents.map((student, index) => {
            const riskColor = this.getRiskColor(student.risk_skoru);
            const riskBadge = this.getRiskBadge(student.risk_skoru);
            
            return `
              <div class="flex items-center justify-between p-4 rounded-lg border-l-4 ${riskColor} bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group" 
                   onclick="window.location.hash = '#/ogrenci/${student.ogrenci_id}'">
                <div class="flex items-center space-x-4 flex-1">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                    ${index + 1}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <p class="font-semibold text-slate-900 truncate">
                        ${student.ad && student.soyad ? `${student.ad} ${student.soyad}` : `Öğrenci #${student.ogrenci_id}`}
                      </p>
                      ${riskBadge}
                    </div>
                    <div class="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <span>${student.program_adi || 'Program bilgisi yok'}</span>
                      <span class="text-slate-400">•</span>
                      <span>${student.durum_adi || 'Durum bilgisi yok'}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <div class="text-2xl font-bold ${this.getRiskTextColor(student.risk_skoru)}">
                      ${formatters.formatRiskSkoru(student.risk_skoru)}
                    </div>
                    <div class="text-xs text-slate-500">Risk Skoru</div>
                  </div>
                  <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${this.studentsData.length > 5 ? `
          <div class="mt-4 text-center">
            <button onclick="window.location.hash = '#/ogrenciler?risk=high'" 
                    class="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Tümünü Gör (${this.studentsData.length} öğrenci) →
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  getRiskColor(riskSkoru) {
    if (riskSkoru >= 90) return 'border-red-600';
    if (riskSkoru >= 80) return 'border-red-500';
    if (riskSkoru >= 70) return 'border-orange-500';
    return 'border-yellow-500';
  }

  getRiskTextColor(riskSkoru) {
    if (riskSkoru >= 90) return 'text-red-600';
    if (riskSkoru >= 80) return 'text-red-500';
    if (riskSkoru >= 70) return 'text-orange-500';
    return 'text-yellow-500';
  }

  getRiskBadge(riskSkoru) {
    if (riskSkoru >= 90) {
      return '<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">KRİTİK</span>';
    }
    if (riskSkoru >= 80) {
      return '<span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">YÜKSEK</span>';
    }
    return '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">RİSKLİ</span>';
  }

  updateData(studentsData) {
    this.studentsData = studentsData;
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

