-- Migration 017: Akademik Takvim Seed Data
-- Türkiye üniversiteleri için tipik akademik takvim verileri
-- 2023-2024, 2024-2025, 2025-2026 akademik yılları

-- ============================================
-- 2023-2024 AKADEMİK YILI
-- ============================================

-- 2023-2024 Güz Dönemi (1. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2023,
  'Guz',
  1,
  '2023-10-02',
  '2024-01-26',
  '2023-09-18',
  '2023-09-29',
  '2023-10-02',
  '2023-12-29',
  '2024-01-08',
  '2024-01-26',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2023-2024 Bahar Dönemi (2. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2023,
  'Bahar',
  2,
  '2024-02-05',
  '2024-06-14',
  '2024-01-29',
  '2024-02-02',
  '2024-02-05',
  '2024-05-10',
  '2024-05-20',
  '2024-06-14',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2023-2024 Yaz Okulu (3. Yarıyıl - Opsiyonel)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2023,
  'Yaz',
  3,
  '2024-07-01',
  '2024-08-23',
  '2024-06-24',
  '2024-06-28',
  '2024-07-01',
  '2024-08-09',
  '2024-08-12',
  '2024-08-23',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- ============================================
-- 2024-2025 AKADEMİK YILI
-- ============================================

-- 2024-2025 Güz Dönemi (1. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2024,
  'Guz',
  1,
  '2024-10-01',
  '2025-01-31',
  '2024-09-16',
  '2024-09-27',
  '2024-10-01',
  '2024-12-27',
  '2025-01-06',
  '2025-01-31',
  true
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2024-2025 Bahar Dönemi (2. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2024,
  'Bahar',
  2,
  '2025-02-03',
  '2025-06-13',
  '2025-01-27',
  '2025-01-31',
  '2025-02-03',
  '2025-05-09',
  '2025-05-19',
  '2025-06-13',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2024-2025 Yaz Okulu (3. Yarıyıl - Opsiyonel)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2024,
  'Yaz',
  3,
  '2025-07-01',
  '2025-08-22',
  '2025-06-23',
  '2025-06-27',
  '2025-07-01',
  '2025-08-08',
  '2025-08-11',
  '2025-08-22',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- ============================================
-- 2025-2026 AKADEMİK YILI
-- ============================================

-- 2025-2026 Güz Dönemi (1. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2025,
  'Guz',
  1,
  '2025-09-30',
  '2026-01-30',
  '2025-09-15',
  '2025-09-26',
  '2025-09-30',
  '2025-12-26',
  '2026-01-05',
  '2026-01-30',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2025-2026 Bahar Dönemi (2. Yarıyıl)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2025,
  'Bahar',
  2,
  '2026-02-02',
  '2026-06-12',
  '2026-01-26',
  '2026-01-30',
  '2026-02-02',
  '2026-05-08',
  '2026-05-18',
  '2026-06-12',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- 2025-2026 Yaz Okulu (3. Yarıyıl - Opsiyonel)
INSERT INTO public.akademik_takvim (
  akademik_yil,
  donem,
  yariyil_no,
  baslangic_tarihi,
  bitis_tarihi,
  kayit_baslangic_tarihi,
  kayit_bitis_tarihi,
  ders_baslangic_tarihi,
  ders_bitis_tarihi,
  sinav_baslangic_tarihi,
  sinav_bitis_tarihi,
  aktif_mi
) VALUES (
  2025,
  'Yaz',
  3,
  '2026-07-01',
  '2026-08-21',
  '2026-06-22',
  '2026-06-26',
  '2026-07-01',
  '2026-08-07',
  '2026-08-10',
  '2026-08-21',
  false
) ON CONFLICT (akademik_yil, donem, yariyil_no) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.akademik_takvim IS 'Akademik takvim: Güz/Bahar/Yaz dönemleri, kayıt, ders ve sınav tarihleri';

