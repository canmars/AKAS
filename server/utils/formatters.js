/**
 * Formatters
 * Veri formatlama fonksiyonları
 */

export const formatters = {
  /**
   * Risk skoru formatla
   */
  formatRiskSkoru(skor) {
    if (skor === null || skor === undefined) return '-';
    return `${skor}/100`;
  },

  /**
   * Yüzde formatla
   */
  formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(decimals)}%`;
  }
};

