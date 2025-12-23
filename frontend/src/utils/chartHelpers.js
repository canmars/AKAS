/**
 * Chart.js Helpers
 * Chart.js yapılandırma helper'ları
 */

import { CHART_COLORS, RISK_LEVELS, PROGRAM_COLORS } from './constants.js';

// Re-export CHART_COLORS for convenience
export { CHART_COLORS };

/**
 * Temel chart yapılandırması - Modern ve gelişmiş
 */
export function getBaseChartConfig() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y || context.parsed}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          color: '#6B7280',
        },
      },
    },
  };
}

/**
 * Risk seviyesi renkleri
 */
export function getRiskLevelColors() {
  return {
    Dusuk: CHART_COLORS.success,
    Orta: CHART_COLORS.warning,
    Yuksek: '#F97316', // Orange
    Kritik: CHART_COLORS.error,
  };
}

/**
 * Program renkleri
 */
export function getProgramColors() {
  return PROGRAM_COLORS;
}

/**
 * Kapasite kullanım renkleri
 */
export function getCapacityColors(percentage) {
  if (percentage >= 100) return CHART_COLORS.error;
  if (percentage >= 80) return '#F97316'; // Orange
  if (percentage >= 50) return CHART_COLORS.warning;
  return CHART_COLORS.success;
}

/**
 * Pie chart yapılandırması - Modern ve gelişmiş
 */
export function getPieConfig(data, labels, colors) {
  const baseConfig = getBaseChartConfig();
  return {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverOffset: 5,
      }],
    },
    options: {
      ...baseConfig,
      plugins: {
        ...baseConfig.plugins,
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 12,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
              weight: '500',
            },
            color: '#374151',
          },
        },
        tooltip: {
          ...baseConfig.plugins.tooltip,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        ...baseConfig.animation,
        animateRotate: true,
        animateScale: true,
      },
    },
  };
}

/**
 * Doughnut chart yapılandırması - Modern ve gelişmiş
 */
export function getDoughnutConfig(data, labels, colors) {
  const baseConfig = getBaseChartConfig();
  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverOffset: 8,
      }],
    },
    options: {
      ...baseConfig,
      cutout: '65%',
      plugins: {
        ...baseConfig.plugins,
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 12,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
              weight: '500',
            },
            color: '#374151',
          },
        },
        tooltip: {
          ...baseConfig.plugins.tooltip,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        ...baseConfig.animation,
        animateRotate: true,
        animateScale: true,
      },
    },
  };
}

/**
 * Bar chart yapılandırması - Modern ve gelişmiş
 */
export function getBarConfig(data, labels, colors, horizontal = false) {
  const baseConfig = getBaseChartConfig();
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Value',
        data,
        backgroundColor: Array.isArray(colors) ? colors : colors,
        borderColor: Array.isArray(colors) ? colors.map(c => c + 'CC') : colors + 'CC',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      ...baseConfig,
      indexAxis: horizontal ? 'y' : 'x',
      scales: {
        x: {
          ...baseConfig.scales.x,
          beginAtZero: true,
        },
        y: {
          ...baseConfig.scales.y,
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * Line chart yapılandırması - Modern ve gelişmiş
 */
export function getLineConfig(data, labels, color = CHART_COLORS.primary) {
  const baseConfig = getBaseChartConfig();
  
  // Gradient oluştur
  const gradient = (ctx) => {
    const chart = ctx.chart;
    const {ctx: chartCtx, chartArea} = chart;
    if (!chartArea) return null;
    
    const gradientBg = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradientBg.addColorStop(0, color + '40');
    gradientBg.addColorStop(1, color + '05');
    return gradientBg;
  };
  
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Trend',
        data,
        borderColor: color,
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      }],
    },
    options: {
      ...baseConfig,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          ...baseConfig.scales.x,
          beginAtZero: false,
        },
        y: {
          ...baseConfig.scales.y,
          beginAtZero: true,
          ticks: {
            ...baseConfig.scales.y.ticks,
            stepSize: 1,
          },
        },
      },
    },
  };
}

/**
 * Stacked bar chart yapılandırması
 */
export function getStackedBarConfig(datasets, labels) {
  const baseConfig = getBaseChartConfig();
  return {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      ...baseConfig,
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  };
}

