/**
 * Date Helpers
 * Tarih yardımcı fonksiyonları
 */

export const dateHelpers = {
  /**
   * Yarıyıl hesapla
   */
  calculateYariyil(kayitTarihi) {
    // Basitleştirilmiş: Kayıt tarihinden itibaren geçen ay sayısı / 6
    const now = new Date();
    const kayit = new Date(kayitTarihi);
    const ayFarki = (now - kayit) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(1, Math.floor(ayFarki / 6) + 1);
  },

  /**
   * Tarih formatla
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
};

