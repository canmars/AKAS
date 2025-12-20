-- Migration 011: Kullanicilar Tablosu Foreign Key Constraints
-- akademik_personel_id ve ogrenci_id için foreign key constraint'leri ekler

-- ============================================
-- 1. OGRENCI_ID SÜTUNU EKLE (Eğer yoksa)
-- ============================================
DO $$
BEGIN
  -- ogrenci_id sütunu yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kullanicilar' 
    AND column_name = 'ogrenci_id'
  ) THEN
    ALTER TABLE public.kullanicilar
    ADD COLUMN ogrenci_id UUID;
  END IF;
END $$;

-- ============================================
-- 2. AKADEMIK_PERSONEL_ID FOREIGN KEY EKLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_kullanicilar_akademik_personel'
  ) THEN
    ALTER TABLE public.kullanicilar
    ADD CONSTRAINT fk_kullanicilar_akademik_personel
    FOREIGN KEY (akademik_personel_id) 
    REFERENCES public.akademik_personel(personel_id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 3. OGRENCI_ID FOREIGN KEY EKLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_kullanicilar_ogrenci'
  ) THEN
    ALTER TABLE public.kullanicilar
    ADD CONSTRAINT fk_kullanicilar_ogrenci
    FOREIGN KEY (ogrenci_id) 
    REFERENCES public.ogrenci(ogrenci_id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 4. CHECK CONSTRAINT: Sadece biri dolu olabilir
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_kullanicilar_personel_or_ogrenci'
  ) THEN
    ALTER TABLE public.kullanicilar
    ADD CONSTRAINT check_kullanicilar_personel_or_ogrenci
    CHECK (
      -- Ya akademik_personel_id dolu olmalı ya da ogrenci_id dolu olmalı
      -- Ama ikisi birden dolu olamaz
      (akademik_personel_id IS NOT NULL AND ogrenci_id IS NULL) OR
      (akademik_personel_id IS NULL AND ogrenci_id IS NOT NULL) OR
      -- Admin ve Bolum_Baskani rolleri için ikisi de NULL olabilir
      (akademik_personel_id IS NULL AND ogrenci_id IS NULL AND rol IN ('Admin', 'Bolum_Baskani'))
    );
  END IF;
END $$;

-- ============================================
-- 5. INDEX EKLE (PERFORMANS İÇİN)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_kullanicilar_ogrenci 
ON public.kullanicilar(ogrenci_id) 
WHERE ogrenci_id IS NOT NULL;

-- ============================================
-- 6. ROL CHECK CONSTRAINT GÜNCELLE (Öğrenci rolü ekle)
-- ============================================
-- Not: Mevcut CHECK constraint'i güncellemek için önce silip yeniden eklemek gerekir
DO $$
BEGIN
  -- Mevcut constraint'i kontrol et
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'kullanicilar_rol_check'
  ) THEN
    -- Constraint'i sil
    ALTER TABLE public.kullanicilar
    DROP CONSTRAINT kullanicilar_rol_check;
  END IF;
  
  -- Yeni constraint ekle (Öğrenci rolü dahil)
  ALTER TABLE public.kullanicilar
  ADD CONSTRAINT kullanicilar_rol_check
  CHECK (rol IN ('Admin', 'Bolum_Baskani', 'Danisman', 'Ogrenci'));
END $$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.kullanicilar.akademik_personel_id IS 'Akademik personel ID (akademik_personel tablosuna foreign key) - Sadece Danisman rolü için';
COMMENT ON COLUMN public.kullanicilar.ogrenci_id IS 'Öğrenci ID (ogrenci tablosuna foreign key) - Sadece Ogrenci rolü için';
COMMENT ON CONSTRAINT check_kullanicilar_personel_or_ogrenci ON public.kullanicilar IS 'Kullanıcı ya akademik personel ya da öğrenci olabilir, ikisi birden olamaz. Admin ve Bölüm Başkanı için ikisi de NULL olabilir.';
