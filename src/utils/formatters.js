/**
 * Formatters
 * Veri formatlama fonksiyonları
 */

import { format, formatDistanceToNow } from 'date-fns';

export const formatters = {
  /**
   * Tarih formatla
   */
  formatDate(date, formatStr = 'dd.MM.yyyy') {
    if (!date) return '-';
    try {
      return format(new Date(date), formatStr);
    } catch (error) {
      return '-';
    }
  },

  /**
   * Tarih aralığı formatla (örn: "2 gün önce")
   */
  formatDateDistance(date) {
    if (!date) return '-';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return '-';
    }
  },

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
  },

  /**
   * Sayı formatla (binlik ayırıcı ile)
   */
  formatNumber(value) {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('tr-TR').format(value);
  },
};

export default formatters;

