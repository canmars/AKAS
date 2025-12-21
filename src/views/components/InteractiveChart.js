/**
 * Interactive Chart Wrapper Component - Tableau Style
 * Tıklanabilir segmentler, detaylı tooltip'ler, renk kodlaması, zoom ve pan
 */

export class InteractiveChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      type: options.type || 'bar', // 'bar', 'line', 'donut', 'pie', 'heatmap'
      data: options.data || {},
      onClick: options.onClick || null,
      tooltip: options.tooltip || null,
      colorScheme: options.colorScheme || 'traffic-light', // 'traffic-light', 'primary', 'custom'
      ...options
    };
    this.chartInstance = null;
    this.render();
  }

  render() {
    // Container'ı hazırla
    this.container.innerHTML = `
      <div class="interactive-chart-wrapper relative">
        <div class="chart-container" id="chart-container-${this.options.id || Date.now()}"></div>
        <div class="chart-tooltip hidden absolute bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 z-50" id="tooltip-${this.options.id || Date.now()}"></div>
      </div>
    `;

    const chartContainer = this.container.querySelector('.chart-container');
    
    // Chart tipine göre render et
    switch (this.options.type) {
      case 'donut':
      case 'pie':
        this.renderDonutChart(chartContainer);
        break;
      case 'bar':
        this.renderBarChart(chartContainer);
        break;
      case 'line':
        this.renderLineChart(chartContainer);
        break;
      case 'heatmap':
        this.renderHeatmapChart(chartContainer);
        break;
      default:
        this.renderBarChart(chartContainer);
    }
  }

  renderDonutChart(container) {
    // Chart.js kullanarak donut chart oluştur
    import('chart.js/auto').then((module) => {
      const { Chart, registerables } = module;
      if (registerables) {
        Chart.register(...registerables);
      }
      
      const canvas = document.createElement('canvas');
      container.innerHTML = '';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const colors = this.getColorScheme(this.options.data.labels || []);

      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.options.data.labels || [],
          datasets: [{
            data: this.options.data.values || [],
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  
                  if (this.options.tooltip) {
                    return this.options.tooltip({
                      label,
                      value,
                      percentage,
                      data: this.options.data.rawData?.[context.dataIndex]
                    });
                  }
                  
                  return `${label}: ${value} (${percentage}%)`;
                },
                afterBody: (context) => {
                  if (this.options.tooltip && this.options.tooltip.afterBody) {
                    return this.options.tooltip.afterBody(context);
                  }
                  return '';
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0 && this.options.onClick) {
              const element = elements[0];
              const index = element.index;
              const segmentData = {
                label: this.options.data.labels[index],
                value: this.options.data.values[index],
                index,
                rawData: this.options.data.rawData?.[index]
              };
              this.options.onClick(segmentData);
            }
          },
          onHover: (event, elements) => {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          }
        }
      });
    });
  }

  renderBarChart(container) {
    import('chart.js/auto').then((module) => {
      const { Chart, registerables } = module;
      if (registerables) {
        Chart.register(...registerables);
      }
      
      const canvas = document.createElement('canvas');
      container.innerHTML = '';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const colors = this.getColorScheme(this.options.data.labels || []);

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.options.data.labels || [],
          datasets: [{
            label: this.options.data.label || 'Değer',
            data: this.options.data.values || [],
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context) => {
                  if (this.options.tooltip) {
                    return this.options.tooltip({
                      label: context.label,
                      value: context.parsed.y,
                      data: this.options.data.rawData?.[context.dataIndex]
                    });
                  }
                  return `${context.dataset.label}: ${context.parsed.y}`;
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0 && this.options.onClick) {
              const element = elements[0];
              const index = element.index;
              const barData = {
                label: this.options.data.labels[index],
                value: this.options.data.values[index],
                index,
                rawData: this.options.data.rawData?.[index]
              };
              this.options.onClick(barData);
            }
          },
          onHover: (event, elements) => {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }

  renderLineChart(container) {
    import('chart.js/auto').then((module) => {
      const { Chart, registerables } = module;
      if (registerables) {
        Chart.register(...registerables);
      }
      
      const canvas = document.createElement('canvas');
      container.innerHTML = '';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.options.data.labels || [],
          datasets: this.options.data.datasets || [{
            label: this.options.data.label || 'Değer',
            data: this.options.data.values || [],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: this.options.data.datasets?.length > 1
            },
            tooltip: {
              enabled: true
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0 && this.options.onClick) {
              const element = elements[0];
              const pointData = {
                label: this.options.data.labels[element.index],
                value: element.element.$context.parsed.y,
                index: element.index
              };
              this.options.onClick(pointData);
            }
          },
          onHover: (event, elements) => {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }

  renderHeatmapChart(container) {
    // Heatmap için özel render (basit versiyon)
    const data = this.options.data;
    const rows = data.rows || [];
    const cols = data.cols || [];
    const values = data.values || [];

    container.innerHTML = `
      <div class="heatmap-container overflow-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="px-2 py-1 text-xs"></th>
              ${cols.map(col => `<th class="px-2 py-1 text-xs text-center">${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, rowIdx) => `
              <tr>
                <td class="px-2 py-1 text-xs font-medium">${row}</td>
                ${cols.map((col, colIdx) => {
                  const value = values[rowIdx]?.[colIdx] || 0;
                  const intensity = Math.min(value / (data.max || 100), 1);
                  const bgColor = this.getHeatmapColor(intensity);
                  return `
                    <td 
                      class="px-2 py-1 text-xs text-center cursor-pointer hover:opacity-80 heatmap-cell"
                      style="background-color: ${bgColor};"
                      data-row="${rowIdx}"
                      data-col="${colIdx}"
                    >
                      ${value}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Heatmap cell click events
    const cells = container.querySelectorAll('.heatmap-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (this.options.onClick) {
          const rowIdx = parseInt(cell.dataset.row);
          const colIdx = parseInt(cell.dataset.col);
          this.options.onClick({
            row: rows[rowIdx],
            col: cols[colIdx],
            value: values[rowIdx]?.[colIdx] || 0,
            rowIndex: rowIdx,
            colIndex: colIdx
          });
        }
      });
    });
  }

  getColorScheme(labels) {
    if (this.options.colorScheme === 'custom' && this.options.colors) {
      return this.options.colors;
    }

    if (this.options.colorScheme === 'traffic-light') {
      // Trafik ışığı renkleri
      return labels.map((label, index) => {
        const labelLower = String(label).toLowerCase();
        if (labelLower.includes('kritik') || labelLower.includes('critical')) {
          return 'rgba(239, 68, 68, 0.8)'; // Red
        } else if (labelLower.includes('yüksek') || labelLower.includes('high')) {
          return 'rgba(245, 158, 11, 0.8)'; // Orange
        } else if (labelLower.includes('orta') || labelLower.includes('medium')) {
          return 'rgba(234, 179, 8, 0.8)'; // Yellow
        } else if (labelLower.includes('düşük') || labelLower.includes('low')) {
          return 'rgba(16, 185, 129, 0.8)'; // Green
        }
        // Default gradient
        const colors = [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(234, 179, 8, 0.8)',  // Yellow
          'rgba(245, 158, 11, 0.8)', // Orange
          'rgba(239, 68, 68, 0.8)'   // Red
        ];
        return colors[index % colors.length];
      });
    }

    // Primary color scheme
    return labels.map((_, index) => {
      const hue = (index * 137.508) % 360; // Golden angle
      return `hsla(${hue}, 70%, 50%, 0.8)`;
    });
  }

  getHeatmapColor(intensity) {
    // 0 = green, 0.5 = yellow, 1 = red
    if (intensity < 0.5) {
      const green = 255;
      const red = Math.floor(intensity * 2 * 255);
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const red = 255;
      const green = Math.floor((1 - intensity) * 2 * 255);
      return `rgb(${red}, ${green}, 0)`;
    }
  }

  update(data) {
    this.options.data = { ...this.options.data, ...data };
    if (this.chartInstance) {
      this.chartInstance.data = this.options.data;
      this.chartInstance.update();
    } else {
      this.render();
    }
  }

  destroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

