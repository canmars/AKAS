-- Migration 021: Update Akademik Personel
-- Rol kolonu ekleniyor (Danisman veya Bolum_Baskani)
-- kullanici_id kolonu zaten 019 migration'da kaldırıldı
-- ============================================

-- ============================================
-- ROL KOLONU EKLEME
-- ============================================

-- Rol kolonu ekle (Danisman veya Bolum_Baskani)
ALTER TABLE IF EXISTS public.akademik_personel
    ADD COLUMN IF NOT EXISTS rol TEXT CHECK (rol IN ('Danisman', 'Bolum_Baskani'));

-- ============================================
-- MEVCUT KOLONLARI KONTROL ET
-- ============================================

-- kullanici_id kolonu zaten 019 migration'da kaldırıldı
-- aktif_mi, maksimum_kapasite, sert_limit, yumusak_limit kolonları zaten var

-- ============================================
-- İNDEKS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_akademik_personel_rol ON public.akademik_personel(rol);
CREATE INDEX IF NOT EXISTS idx_akademik_personel_aktif_rol ON public.akademik_personel(aktif_mi, rol) WHERE aktif_mi = true;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.akademik_personel.rol IS 'Akademik personel rolü: Danisman veya Bolum_Baskani';
COMMENT ON COLUMN public.akademik_personel.maksimum_kapasite IS 'Maksimum öğrenci kapasitesi (Tezli: 14, Tezsiz: 16)';
COMMENT ON COLUMN public.akademik_personel.sert_limit IS 'Sert limit (aşılamaz) - Unvan bazlı varsayılan değerler';
COMMENT ON COLUMN public.akademik_personel.yumusak_limit IS 'Yumuşak limit (uyarı verilir) - Unvan bazlı varsayılan değerler';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Eklenen kolon:
-- - rol (TEXT, CHECK constraint: 'Danisman' veya 'Bolum_Baskani')

-- Kaldırılan kolon (019 migration'da):
-- - kullanici_id

