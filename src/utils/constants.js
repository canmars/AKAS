/**
 * Constants
 * Uygulama sabitleri
 */

export const APP_CONFIG = {
  CONTAINER_ID: '#app',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
};

export const RISK_SEVIYELERI = {
  DUSUK: { min: 0, max: 30, renk: '#10b981', label: 'Düşük' },
  ORTA: { min: 31, max: 50, renk: '#f59e0b', label: 'Orta' },
  YUKSEK: { min: 51, max: 70, renk: '#f97316', label: 'Yüksek' },
  KRITIK: { min: 71, max: 100, renk: '#ef4444', label: 'Kritik' },
};

export const PROGRAM_TURLERI = {
  DOKTORA: 'Doktora',
  TEZLI_YL: 'Tezli Yüksek Lisans',
  TEZSIZ_YL_IO: 'Tezsiz Yüksek Lisans (İÖ)',
  TEZSIZ_YL_UZAKTAN: 'Tezsiz Yüksek Lisans (Uzaktan)',
};

export const BILDIRIM_ONCELIKLERI = {
  DUSUK: { renk: '#6b7280', label: 'Düşük' },
  ORTA: { renk: '#3b82f6', label: 'Orta' },
  YUKSEK: { renk: '#f59e0b', label: 'Yüksek' },
  KRITIK: { renk: '#ef4444', label: 'Kritik' },
};
