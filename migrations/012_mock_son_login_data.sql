/**
 * Migration: Mock Son Login Verisi
 * ogrenci_son_login tablosuna mock veri ekler
 * 
 * Mock Veri Dağılımı:
 * - %70 öğrenci: Son 30 gün içinde login
 * - %20 öğrenci: 30-180 gün arası login
 * - %10 öğrenci: 180+ gün veya NULL (hayalet öğrenci)
 */

-- Mevcut kayıtları temizle (opsiyonel - sadece test için)
-- DELETE FROM public.ogrenci_son_login;

-- Mock son_login verisi ekle
-- Her öğrenci için rastgele son_login tarihi oluştur
INSERT INTO public.ogrenci_son_login (ogrenci_id, son_login, son_login_ip, son_login_user_agent, guncelleme_tarihi, created_at, updated_at)
SELECT 
  o.ogrenci_id,
  -- Rastgele tarih oluştur (son 365 gün içinde)
  CASE 
    -- %70: Son 30 gün içinde (aktif öğrenciler)
    WHEN random() < 0.7 THEN 
      CURRENT_DATE - (random() * 30)::INT
    -- %20: 30-180 gün arası (pasif öğrenciler)
    WHEN random() < 0.9 THEN 
      CURRENT_DATE - (30 + random() * 150)::INT
    -- %10: 180+ gün veya NULL (hayalet öğrenciler)
    ELSE 
      CASE 
        WHEN random() < 0.5 THEN 
          CURRENT_DATE - (180 + random() * 185)::INT  -- 180-365 gün arası
        ELSE 
          NULL  -- Hiç login yapmamış
      END
  END as son_login,
  -- Mock IP adresi
  '192.168.' || (random() * 255)::INT || '.' || (random() * 255)::INT as son_login_ip,
  -- Mock user agent
  CASE 
    WHEN random() < 0.5 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    WHEN random() < 0.75 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    ELSE 'Mozilla/5.0 (X11; Linux x86_64)'
  END as son_login_user_agent,
  CURRENT_TIMESTAMP as guncelleme_tarihi,
  CURRENT_TIMESTAMP as created_at,
  CURRENT_TIMESTAMP as updated_at
FROM public.ogrenci o
WHERE o.soft_delete = false
  -- Sadece ogrenci_son_login'de kaydı olmayan öğrenciler için ekle
  AND NOT EXISTS (
    SELECT 1 
    FROM public.ogrenci_son_login osl 
    WHERE osl.ogrenci_id = o.ogrenci_id
  )
ON CONFLICT (ogrenci_id) DO UPDATE SET
  son_login = EXCLUDED.son_login,
  son_login_ip = EXCLUDED.son_login_ip,
  son_login_user_agent = EXCLUDED.son_login_user_agent,
  guncelleme_tarihi = EXCLUDED.guncelleme_tarihi,
  updated_at = CURRENT_TIMESTAMP;

-- ogrenci tablosundaki son_login alanını da güncelle (denormalize edilmiş alan)
UPDATE public.ogrenci o
SET son_login = osl.son_login
FROM public.ogrenci_son_login osl
WHERE o.ogrenci_id = osl.ogrenci_id
  AND (o.son_login IS DISTINCT FROM osl.son_login);

-- İstatistikleri göster
DO $$
DECLARE
  v_toplam INTEGER;
  v_son_30_gun INTEGER;
  v_30_180_gun INTEGER;
  v_180_plus_gun INTEGER;
  v_null_login INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_toplam FROM public.ogrenci_son_login;
  SELECT COUNT(*) INTO v_son_30_gun FROM public.ogrenci_son_login 
    WHERE son_login >= CURRENT_DATE - INTERVAL '30 days';
  SELECT COUNT(*) INTO v_30_180_gun FROM public.ogrenci_son_login 
    WHERE son_login >= CURRENT_DATE - INTERVAL '180 days' 
    AND son_login < CURRENT_DATE - INTERVAL '30 days';
  SELECT COUNT(*) INTO v_180_plus_gun FROM public.ogrenci_son_login 
    WHERE son_login < CURRENT_DATE - INTERVAL '180 days';
  SELECT COUNT(*) INTO v_null_login FROM public.ogrenci_son_login 
    WHERE son_login IS NULL;
  
  RAISE NOTICE 'Mock Son Login Verisi Eklendi:';
  RAISE NOTICE '  Toplam: %', v_toplam;
  RAISE NOTICE '  Son 30 gün: % (%%%)', v_son_30_gun, ROUND(v_son_30_gun::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE '  30-180 gün: % (%%%)', v_30_180_gun, ROUND(v_30_180_gun::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE '  180+ gün: % (%%%)', v_180_plus_gun, ROUND(v_180_plus_gun::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE '  NULL (hiç login yok): % (%%%)', v_null_login, ROUND(v_null_login::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
END $$;

COMMENT ON TABLE public.ogrenci_son_login IS 'Öğrenci son login bilgisi - Mock veri migration ile dolduruldu';

