-- Migration 027: Update Ogrenci Durum Gecmisi
-- degistiren_kullanici_id kolonu kaldırılacak
-- degistiren_admin_id ve degistiren_personel_id kolonları eklenecek
-- ============================================

-- ============================================
-- KOLON GÜNCELLEMELERİ
-- ============================================

-- degistiren_kullanici_id kolonunu kaldır (kullanicilar tablosu kaldırıldı)
ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi
    DROP COLUMN IF EXISTS degistiren_kullanici_id;

-- degistiren_admin_id kolonu ekle (adminler tablosuna FK)
ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi
    ADD COLUMN IF NOT EXISTS degistiren_admin_id UUID REFERENCES public.adminler(admin_id);

-- degistiren_personel_id kolonu ekle (akademik_personel tablosuna FK)
ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi
    ADD COLUMN IF NOT EXISTS degistiren_personel_id UUID REFERENCES public.akademik_personel(personel_id);

-- ============================================
-- CONSTRAINT
-- ============================================

-- En az biri (admin veya personel) dolu olmalı
ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi
    DROP CONSTRAINT IF EXISTS check_degistiren_admin_or_personel;

ALTER TABLE IF EXISTS public.ogrenci_durum_gecmisi
    ADD CONSTRAINT check_degistiren_admin_or_personel 
    CHECK (
        (degistiren_admin_id IS NOT NULL AND degistiren_personel_id IS NULL) OR
        (degistiren_admin_id IS NULL AND degistiren_personel_id IS NOT NULL) OR
        (degistiren_admin_id IS NOT NULL AND degistiren_personel_id IS NOT NULL)
    );

-- ============================================
-- İNDEKSLER
-- ============================================

-- Admin bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_durum_gecmisi_admin ON public.ogrenci_durum_gecmisi(degistiren_admin_id) WHERE degistiren_admin_id IS NOT NULL;

-- Personel bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_durum_gecmisi_personel ON public.ogrenci_durum_gecmisi(degistiren_personel_id) WHERE degistiren_personel_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.ogrenci_durum_gecmisi.degistiren_admin_id IS 'Durumu değiştiren admin (adminler tablosuna FK) - NULL olabilir';
COMMENT ON COLUMN public.ogrenci_durum_gecmisi.degistiren_personel_id IS 'Durumu değiştiren akademik personel (akademik_personel tablosuna FK) - NULL olabilir';
COMMENT ON CONSTRAINT check_degistiren_admin_or_personel ON public.ogrenci_durum_gecmisi IS 'En az biri (admin veya personel) dolu olmalı - İkisi de dolu olabilir';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Kaldırılan kolon:
-- - degistiren_kullanici_id (kullanicilar tablosu kaldırıldı)

-- Eklenen kolonlar:
-- - degistiren_admin_id (UUID, adminler tablosuna FK, NULL olabilir)
-- - degistiren_personel_id (UUID, akademik_personel tablosuna FK, NULL olabilir)

-- Constraint:
-- - check_degistiren_admin_or_personel: En az biri dolu olmalı

