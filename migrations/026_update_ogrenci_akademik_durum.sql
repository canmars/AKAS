-- Migration 026: Update Ogrenci Akademik Durum
-- mevcut_asinama kolonu kaldırılacak (artık ogrenci_asamalari tablosunda)
-- mevcut_asama_id, not_ortalamasi, tamamlanan_akts kolonları eklenecek
-- ============================================

-- ============================================
-- KOLON GÜNCELLEMELERİ
-- ============================================

-- mevcut_asinama kolonunu kaldır (artık ogrenci_asamalari tablosunda)
ALTER TABLE IF EXISTS public.ogrenci_akademik_durum
    DROP COLUMN IF EXISTS mevcut_asinama;

-- mevcut_asama_id kolonu ekle (en son aktif aşama - ogrenci_asamalari.asama_id'ye FK)
ALTER TABLE IF EXISTS public.ogrenci_akademik_durum
    ADD COLUMN IF NOT EXISTS mevcut_asama_id UUID REFERENCES public.ogrenci_asamalari(asama_id);

-- not_ortalamasi kolonu ekle (hesaplanan değer)
ALTER TABLE IF EXISTS public.ogrenci_akademik_durum
    ADD COLUMN IF NOT EXISTS not_ortalamasi NUMERIC(5,2); -- 4.00 üzerinden not ortalaması

-- tamamlanan_akts kolonu ekle
ALTER TABLE IF EXISTS public.ogrenci_akademik_durum
    ADD COLUMN IF NOT EXISTS tamamlanan_akts INTEGER DEFAULT 0;

-- ============================================
-- İNDEKSLER
-- ============================================

-- Mevcut aşama bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_mevcut_asama ON public.ogrenci_akademik_durum(mevcut_asama_id) WHERE mevcut_asama_id IS NOT NULL;

-- Not ortalaması bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_not_ortalamasi ON public.ogrenci_akademik_durum(not_ortalamasi) WHERE not_ortalamasi IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.ogrenci_akademik_durum.mevcut_asama_id IS 'En son aktif aşama ID (ogrenci_asamalari tablosuna FK) - NULL ise aşama kaydı yok';
COMMENT ON COLUMN public.ogrenci_akademik_durum.not_ortalamasi IS 'Not ortalaması (4.00 üzerinden) - ogrenci_dersleri tablosundan hesaplanır';
COMMENT ON COLUMN public.ogrenci_akademik_durum.tamamlanan_akts IS 'Tamamlanan AKTS toplamı - ogrenci_dersleri tablosundan hesaplanır';
COMMENT ON COLUMN public.ogrenci_akademik_durum.mevcut_yariyil IS 'Mevcut yarıyıl (view ile hesaplanır, burada cache olarak tutulur)';
COMMENT ON COLUMN public.ogrenci_akademik_durum.ders_tamamlandi_mi IS 'Ders tamamlandı mı? (Tezli YL için)';
COMMENT ON COLUMN public.ogrenci_akademik_durum.tamamlanan_ders_sayisi IS 'Tamamlanan ders sayısı (Tezsiz YL için)';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Kaldırılan kolon:
-- - mevcut_asinama (artık ogrenci_asamalari tablosunda)

-- Eklenen kolonlar:
-- - mevcut_asama_id (UUID, ogrenci_asamalari.asama_id'ye FK)
-- - not_ortalamasi (NUMERIC(5,2))
-- - tamamlanan_akts (INTEGER)

-- Korunan kolonlar:
-- - mevcut_yariyil
-- - ders_tamamlandi_mi
-- - tamamlanan_ders_sayisi

