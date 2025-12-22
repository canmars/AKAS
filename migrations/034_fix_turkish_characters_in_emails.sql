-- Migration 034: Fix Turkish Characters in Emails
-- Email adreslerindeki Türkçe karakterleri İngilizce karakterlere çevir
-- ============================================

-- ============================================
-- EMAIL DÜZELTME FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION public.turkce_karakterleri_duzelt(text_value TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Önce tüm Türkçe karakterleri İngilizce karakterlere çevir
  result := text_value;
  result := REPLACE(result, 'ı', 'i');
  result := REPLACE(result, 'İ', 'I');
  result := REPLACE(result, 'ş', 's');
  result := REPLACE(result, 'Ş', 'S');
  result := REPLACE(result, 'ğ', 'g');
  result := REPLACE(result, 'Ğ', 'G');
  result := REPLACE(result, 'ü', 'u');
  result := REPLACE(result, 'Ü', 'U');
  result := REPLACE(result, 'ö', 'o');
  result := REPLACE(result, 'Ö', 'O');
  result := REPLACE(result, 'ç', 'c');
  result := REPLACE(result, 'Ç', 'C');
  
  -- Son olarak küçük harfe çevir
  RETURN LOWER(result);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- OGRENCI EMAIL'LERİNİ DÜZELT
-- ============================================

UPDATE public.ogrenci
SET email = public.turkce_karakterleri_duzelt(email)
WHERE email IS NOT NULL
  AND (
    email LIKE '%ı%' OR email LIKE '%İ%' OR 
    email LIKE '%ş%' OR email LIKE '%Ş%' OR 
    email LIKE '%ğ%' OR email LIKE '%Ğ%' OR 
    email LIKE '%ü%' OR email LIKE '%Ü%' OR 
    email LIKE '%ö%' OR email LIKE '%Ö%' OR 
    email LIKE '%ç%' OR email LIKE '%Ç%'
  );

-- ============================================
-- AKADEMİK PERSONEL EMAIL'LERİNİ DÜZELT
-- ============================================

UPDATE public.akademik_personel
SET email = public.turkce_karakterleri_duzelt(email)
WHERE email IS NOT NULL
  AND (
    email LIKE '%ı%' OR email LIKE '%İ%' OR 
    email LIKE '%ş%' OR email LIKE '%Ş%' OR 
    email LIKE '%ğ%' OR email LIKE '%Ğ%' OR 
    email LIKE '%ü%' OR email LIKE '%Ü%' OR 
    email LIKE '%ö%' OR email LIKE '%Ö%' OR 
    email LIKE '%ç%' OR email LIKE '%Ç%'
  );

-- ============================================
-- ADMIN EMAIL'LERİNİ DÜZELT
-- ============================================

UPDATE public.adminler
SET email = public.turkce_karakterleri_duzelt(email)
WHERE email IS NOT NULL
  AND (
    email LIKE '%ı%' OR email LIKE '%İ%' OR 
    email LIKE '%ş%' OR email LIKE '%Ş%' OR 
    email LIKE '%ğ%' OR email LIKE '%Ğ%' OR 
    email LIKE '%ü%' OR email LIKE '%Ü%' OR 
    email LIKE '%ö%' OR email LIKE '%Ö%' OR 
    email LIKE '%ç%' OR email LIKE '%Ç%'
  );

-- ============================================
-- FONKSİYONU TEMİZLE (İsteğe bağlı)
-- ============================================

-- NOT: Fonksiyonu bırakabiliriz, gelecekte de kullanılabilir
-- Veya kaldırmak isterseniz:
-- DROP FUNCTION IF EXISTS public.turkce_karakterleri_duzelt(TEXT);

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Düzeltilen email'ler:
-- - ogrenci.email
-- - akademik_personel.email
-- - adminler.email
--
-- Türkçe karakterler -> İngilizce karakterler:
-- ı -> i, İ -> I
-- ş -> s, Ş -> S
-- ğ -> g, Ğ -> G
-- ü -> u, Ü -> U
-- ö -> o, Ö -> O
-- ç -> c, Ç -> C

