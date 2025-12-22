-- Migration 019: Remove Auth and Cleanup
-- Login mantığı kaldırılacak, mevcut veriler silinecek, gereksiz tablolar ve kolonlar kaldırılacak
-- 
-- UYARI: Bu script tüm mevcut verileri siler ve yeni yapıya hazırlar!
-- ============================================

-- ============================================
-- 1. VERİ SİLME (Foreign Key Bağımlılıklarına Göre)
-- ============================================

-- Önce child tablolardaki verileri sil (Foreign Key bağımlılıklarına göre)
-- NOT: PostgreSQL'de TRUNCATE IF EXISTS yok, DO bloğu ile kontrol ediyoruz

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Öğrenci ile ilişkili tablolar
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'ogrenci_dersleri', 'ogrenci_akademik_durum', 'ogrenci_durum_gecmisi',
        'danisman_gecmisi', 'tik_toplantilari', 'tez_donem_kayitlari',
        'akademik_milestone', 'yeterlik_sinavlari', 'tez_onerileri', 
        'tez_savunmalari', 'ogrenci_asamalari', 'ogrenci_risk_skorlari'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Akademik personel ile ilişkili tablolar
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'akademik_personel_uzmanlik'
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Kullanıcı ile ilişkili tablolar (kaldırılacak tablolar)
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'kullanici_aktiviteleri', 'ogrenci_son_login', 'bildirimler',
        'veri_degisiklik_logu', 'veri_yukleme_gecmisi', 'simulasyon_senaryolari'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Analitik tablolar (kaldırılacak)
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'ogrenci_basari_trendi', 'danisman_performans_metrikleri',
        'surec_darbogaz_analizi', 'ogrenci_risk_analizi'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Sonra parent tablolardaki verileri sil
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('ogrenci', 'akademik_personel', 'kullanicilar')
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Referans tablolar (yeni yapıya göre yeniden eklenecek)
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'program_turleri', 'anabilim_dallari', 'durum_turleri', 'dersler'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Diğer tablolar
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'akademik_takvim'
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;

  -- Adminler tablosu (varsa)
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'adminler'
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;
END $$;

-- ============================================
-- 2. KALDIRILACAK TABLOLAR
-- ============================================

-- Login/Aktivite Tabloları
DROP TABLE IF EXISTS public.kullanicilar CASCADE;
DROP TABLE IF EXISTS public.kullanici_aktiviteleri CASCADE;
DROP TABLE IF EXISTS public.ogrenci_son_login CASCADE;

-- Eski Aşama Tabloları
DROP TABLE IF EXISTS public.akademik_milestone CASCADE;

-- Eski Risk Tablosu
DROP TABLE IF EXISTS public.ogrenci_risk_analizi CASCADE;

-- Analitik Tablolar (View'ler ile hesaplanacak)
DROP TABLE IF EXISTS public.ogrenci_basari_trendi CASCADE;
DROP TABLE IF EXISTS public.danisman_performans_metrikleri CASCADE;
DROP TABLE IF EXISTS public.surec_darbogaz_analizi CASCADE;

-- Sistem Tabloları (MVP için gerekli değil)
DROP TABLE IF EXISTS public.sistem_ayarlari CASCADE;
DROP TABLE IF EXISTS public.veri_degisiklik_logu CASCADE;
DROP TABLE IF EXISTS public.veri_yukleme_gecmisi CASCADE;
DROP TABLE IF EXISTS public.simulasyon_senaryolari CASCADE;
DROP TABLE IF EXISTS public.bildirim_turleri CASCADE;
DROP TABLE IF EXISTS public.bildirimler CASCADE;

-- ============================================
-- 3. KALDIRILACAK KOLONLAR
-- ============================================

-- ogrenci tablosundan kaldırılacak kolonlar
ALTER TABLE IF EXISTS public.ogrenci 
    DROP COLUMN IF EXISTS kullanici_id,
    DROP COLUMN IF EXISTS son_login;

-- akademik_personel tablosundan kaldırılacak kolonlar
ALTER TABLE IF EXISTS public.akademik_personel 
    DROP COLUMN IF EXISTS kullanici_id;

-- ============================================
-- 4. FOREIGN KEY CONSTRAINT'LERİNİ KALDIRMA
-- ============================================

-- ogrenci tablosundaki kullanici_id constraint'i zaten kaldırıldı (kolon silindi)

-- akademik_personel tablosundaki kullanici_id constraint'i zaten kaldırıldı (kolon silindi)

-- ogrenci_durum_gecmisi tablosundaki degistiren_kullanici_id constraint'i kaldırılacak
-- (027 migration'da yeniden eklenecek)
ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi 
    DROP CONSTRAINT IF EXISTS ogrenci_durum_gecmisi_degistiren_kullanici_id_fkey;

-- ============================================
-- 5. AUTH.USERS REFERANSLARINI KONTROL ET
-- ============================================

-- NOT: auth.users tablosu Supabase'in kendi tablosu, ona dokunmuyoruz
-- Sadece public schema'daki referansları kaldırdık

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Silinen tablolar (13 tablo):
-- 1. kullanicilar
-- 2. kullanici_aktiviteleri
-- 3. ogrenci_son_login
-- 4. akademik_milestone
-- 5. ogrenci_risk_analizi
-- 6. ogrenci_basari_trendi
-- 7. danisman_performans_metrikleri
-- 8. surec_darbogaz_analizi
-- 9. sistem_ayarlari
-- 10. veri_degisiklik_logu
-- 11. veri_yukleme_gecmisi
-- 12. simulasyon_senaryolari
-- 13. bildirim_turleri
-- 14. bildirimler

-- Kaldırılan kolonlar:
-- - ogrenci.kullanici_id
-- - ogrenci.son_login
-- - akademik_personel.kullanici_id

-- Silinen veriler:
-- - Tüm tablolardaki mevcut veriler (yeni yapıya göre mock veri eklenecek)

-- Korunan tablolar (yapıları korundu, veriler silindi):
-- - akademik_personel (rol kolonu eklenecek)
-- - akademik_personel_uzmanlik
-- - akademik_takvim
-- - anabilim_dallari (veriler silindi, yeniden eklenecek)
-- - dersler (veriler silindi, yeniden eklenecek)
-- - durum_turleri (veriler silindi, yeniden eklenecek)
-- - program_turleri (veriler silindi, yeniden eklenecek)
-- - danisman_gecmisi
-- - ogrenci (kullanici_id ve son_login kolonları kaldırıldı)
-- - ogrenci_akademik_durum (güncellenecek)
-- - ogrenci_dersleri
-- - ogrenci_durum_gecmisi (degistiren_kullanici_id constraint kaldırıldı, güncellenecek)
-- - tez_donem_kayitlari
-- - tik_toplantilari (güncellenecek)

