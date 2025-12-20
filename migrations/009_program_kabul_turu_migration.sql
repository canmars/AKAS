-- Migration 009: Program Kabul Türü Migration
-- kabul_turu sütununu program_kabul_turu olarak değiştir ve program_turleri tablosu ile foreign key ilişkisi kur

-- ============================================
-- 1. PROGRAM TURLERI TABLOSUNA LİSANS EKLE
-- ============================================
INSERT INTO public.program_turleri (program_adi, program_kodu, maksimum_sure_yil, maksimum_sure_yariyil) 
VALUES ('Lisans', 'Lisans', 4, 8)
ON CONFLICT (program_kodu) DO NOTHING;

-- ============================================
-- 2. OGRENCI TABLOSUNA program_kabul_turu SÜTUNU EKLE
-- ============================================
DO $$
BEGIN
  -- program_kabul_turu sütunu yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ogrenci' 
    AND column_name = 'program_kabul_turu'
  ) THEN
    ALTER TABLE public.ogrenci
    ADD COLUMN program_kabul_turu UUID;
  END IF;
END $$;

-- ============================================
-- 3. MEVCUT kabul_turu DEĞERLERİNİ program_kabul_turu'YA MİGRATE ET
-- ============================================
-- Lisans -> Lisans program_turu_id
UPDATE public.ogrenci
SET program_kabul_turu = (
  SELECT program_turu_id 
  FROM public.program_turleri 
  WHERE program_kodu = 'Lisans'
)
WHERE kabul_turu = 'Lisans' 
  AND program_kabul_turu IS NULL;

-- Yuksek_Lisans -> Tezli_YL program_turu_id (en mantıklı seçim)
UPDATE public.ogrenci
SET program_kabul_turu = (
  SELECT program_turu_id 
  FROM public.program_turleri 
  WHERE program_kodu = 'Tezli_YL'
)
WHERE kabul_turu = 'Yuksek_Lisans' 
  AND program_kabul_turu IS NULL;

-- ============================================
-- 4. FOREIGN KEY CONSTRAINT EKLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_ogrenci_program_kabul_turu'
  ) THEN
    ALTER TABLE public.ogrenci
    ADD CONSTRAINT fk_ogrenci_program_kabul_turu
    FOREIGN KEY (program_kabul_turu) REFERENCES public.program_turleri(program_turu_id);
  END IF;
END $$;

-- ============================================
-- 5. INDEX EKLE (PERFORMANS İÇİN)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ogrenci_program_kabul_turu 
ON public.ogrenci(program_kabul_turu);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.ogrenci.program_kabul_turu IS 'Öğrencinin hangi programdan mezun olarak bu programa kabul edildiğini gösterir (program_turleri tablosuna foreign key)';
