-- Migration 1000: Drop Unnecessary Tables
-- Gereksiz tabloları sil (analitik, log, simülasyon, bildirim tabloları)
-- Bu script 12 tabloyu siler: bildirim sistemi, analitik tablolar, log tabloları, simülasyon ve tekrar eden tablolar

-- ============================================
-- UYARI: Bu script tabloları ve içindeki tüm verileri siler!
-- ============================================

-- ============================================
-- 1. BİLDİRİM SİSTEMİ TABLOLARI
-- ============================================

-- Önce bildirimler tablosunu sil (bildirim_turleri'ne FK var)
DROP TABLE IF EXISTS public.bildirimler CASCADE;

-- Sonra bildirim_turleri tablosunu sil
DROP TABLE IF EXISTS public.bildirim_turleri CASCADE;

-- ============================================
-- 2. ANALİTİK/PERFORMANS TABLOLARI
-- ============================================

-- Danışman performans metrikleri
DROP TABLE IF EXISTS public.danisman_performans_metrikleri CASCADE;

-- Öğrenci başarı trendi
DROP TABLE IF EXISTS public.ogrenci_basari_trendi CASCADE;

-- Süreç darboğaz analizi
DROP TABLE IF EXISTS public.surec_darbogaz_analizi CASCADE;

-- Öğrenci risk analizi
DROP TABLE IF EXISTS public.ogrenci_risk_analizi CASCADE;

-- ============================================
-- 3. LOG/AUDIT TABLOLARI
-- ============================================

-- Kullanıcı aktiviteleri
DROP TABLE IF EXISTS public.kullanici_aktiviteleri CASCADE;

-- Veri değişiklik logu
DROP TABLE IF EXISTS public.veri_degisiklik_logu CASCADE;

-- Veri yükleme geçmişi
DROP TABLE IF EXISTS public.veri_yukleme_gecmisi CASCADE;

-- ============================================
-- 4. SİSTEM TABLOLARI
-- ============================================

-- Sistem ayarları
DROP TABLE IF EXISTS public.sistem_ayarlari CASCADE;

-- ============================================
-- 5. SİMÜLASYON TABLOLARI
-- ============================================

-- Simülasyon senaryoları
DROP TABLE IF EXISTS public.simulasyon_senaryolari CASCADE;

-- ============================================
-- 6. TEKRAR EDEN TABLOLAR
-- ============================================

-- Öğrenci son login (ogrenci tablosunda zaten son_login kolonu var)
DROP TABLE IF EXISTS public.ogrenci_son_login CASCADE;

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Silinen tablolar:
-- 1. bildirimler
-- 2. bildirim_turleri
-- 3. danisman_performans_metrikleri
-- 4. ogrenci_basari_trendi
-- 5. surec_darbogaz_analizi
-- 6. ogrenci_risk_analizi
-- 7. kullanici_aktiviteleri
-- 8. veri_degisiklik_logu
-- 9. veri_yukleme_gecmisi
-- 10. sistem_ayarlari
-- 11. simulasyon_senaryolari
-- 12. ogrenci_son_login
--
-- Toplam: 12 tablo silindi
-- Korunan tablolar: 16 tablo (temel işlevsellik için gerekli)

