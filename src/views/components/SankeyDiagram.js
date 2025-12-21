/**
 * Sankey Diagram Component
 * Öğrenci akışı görselleştirmesi (Ders → Yeterlik → Tez → Mezuniyet)
 * Not: Chart.js'de Sankey yok, D3.js veya basit bir görselleştirme kullanılabilir
 * Şimdilik basit bir flow diagram olarak implement ediyoruz
 */

export class SankeyDiagram {
  constructor(container, data, onStageClick) {
    this.container = container;
    this.data = data || {};
    this.onStageClick = onStageClick || (() => {});
    this.render();
  }

  render() {
    if (!this.data || Object.keys(this.data).length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-slate-500 text-center">Veri bulunamadı.</p>
        </div>
      `;
      return;
    }

    // Aşamalar ve akış verileri
    const stages = [
      { id: 'Ders', label: 'Ders Aşaması', count: this.data.Ders || 0 },
      { id: 'Yeterlik', label: 'Yeterlik', count: this.data.Yeterlik || 0 },
      { id: 'Tez_Onersi', label: 'Tez Önerisi', count: this.data.Tez_Onersi || 0 },
      { id: 'TIK', label: 'TİK', count: this.data.TIK || 0 },
      { id: 'Tez', label: 'Tez Yazımı', count: this.data.Tez || 0 },
      { id: 'Tamamlandi', label: 'Mezuniyet', count: this.data.Tamamlandi || 0 }
    ];

    // Akış verileri (her aşamadan sonrakine geçiş)
    const flows = this.calculateFlows(stages);

    // SVG veya HTML/CSS ile basit bir flow diagram
    this.renderFlowDiagram(stages, flows);
  }

  calculateFlows(stages) {
    const flows = [];
    
    for (let i = 0; i < stages.length - 1; i++) {
      const from = stages[i];
      const to = stages[i + 1];
      
      // Basit hesaplama: %80 geçiş oranı (gerçek implementasyonda veritabanından alınacak)
      const flowValue = Math.floor(from.count * 0.8);
      const lossValue = from.count - flowValue;
      
      flows.push({
        from: from.id,
        to: to.id,
        value: flowValue,
        loss: lossValue
      });
    }
    
    return flows;
  }

  renderFlowDiagram(stages, flows) {
    const totalStudents = stages.reduce((sum, s) => sum + s.count, 0);
    
    let html = `
      <div class="space-y-4">
        <!-- Horizontal Flow Layout -->
        <div class="flex items-center gap-3 overflow-x-auto pb-4">
          ${stages.map((stage, index) => {
            const widthPercent = totalStudents > 0 ? (stage.count / totalStudents) * 100 : 0;
            const flow = flows[index];
            
            return `
              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Aşama Kutusu -->
                <div 
                  class="p-4 rounded-lg border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-400 transition-all min-w-[120px]"
                  onclick="window.sankeyDiagram?.onStageClick('${stage.id}')"
                >
                  <div class="text-center">
                    <p class="text-xs font-semibold text-slate-700 mb-1">${stage.label}</p>
                    <p class="text-2xl font-bold text-indigo-600">${stage.count}</p>
                    <p class="text-xs text-slate-500 mt-1">${widthPercent.toFixed(1)}%</p>
                  </div>
                </div>
                
                ${index < stages.length - 1 && flow ? `
                  <!-- Akış Oku -->
                  <div class="flex items-center gap-1 min-w-[80px]">
                    <div class="flex-1 h-2 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full"></div>
                    <div class="text-xs text-slate-600 font-medium">${flow.value}</div>
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    ${flow.loss > 0 ? `
                      <div class="text-xs text-red-600">-${flow.loss}</div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Özet -->
        <div class="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">Akış Özeti</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
            ${flows.map(flow => {
              const fromStage = stages.find(s => s.id === flow.from);
              const toStage = stages.find(s => s.id === flow.to);
              const geçişOrani = fromStage && fromStage.count > 0 ? ((flow.value / fromStage.count) * 100).toFixed(1) : '0';
              
              return `
                <div class="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                  <span>
                    <span class="font-semibold text-indigo-600">${fromStage?.label || flow.from}</span> → 
                    <span class="font-semibold text-blue-600">${toStage?.label || flow.to}</span>
                  </span>
                  <span class="text-slate-600">
                    ${flow.value} (%${geçişOrani})
                    ${flow.loss > 0 ? `<span class="text-red-600 ml-1">-${flow.loss}</span>` : ''}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Global erişim için
    window.sankeyDiagram = this;
  }

  onStageClick(stageId) {
    if (this.onStageClick) {
      this.onStageClick(stageId);
    }
  }

  destroy() {
    window.sankeyDiagram = null;
  }
}

