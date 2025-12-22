-- Migration 031: Create Functions and Triggers
-- Risk skoru hesaplama, aşama geçişleri, danışman kapasite kontrolü
-- ============================================

-- ============================================
-- 1. RİSK SKORU HESAPLAMA FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION public.hesapla_risk_skoru(p_ogrenci_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_risk_skoru INTEGER := 0;
  v_azami_sureye_yakinlik NUMERIC;
  v_not_ortalamasi NUMERIC;
  v_basarisiz_ders_sayisi INTEGER;
  v_asama_gecikmesi INTEGER;
  v_azami_sure_yariyil INTEGER;
  v_mevcut_yariyil INTEGER;
  v_program_turu_id UUID;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT 
    o.program_turu_id,
    oad.mevcut_yariyil,
    oad.not_ortalamasi,
    pt.azami_sure_yariyil
  INTO 
    v_program_turu_id,
    v_mevcut_yariyil,
    v_not_ortalamasi,
    v_azami_sure_yariyil
  FROM public.ogrenci o
  JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = p_ogrenci_id;

  -- Azami süreye yakınlık hesapla (%)
  IF v_azami_sure_yariyil > 0 THEN
    v_azami_sureye_yakinlik := (v_mevcut_yariyil::NUMERIC / v_azami_sure_yariyil) * 100;
  ELSE
    v_azami_sureye_yakinlik := 0;
  END IF;

  -- Başarısız ders sayısı
  SELECT COUNT(*)
  INTO v_basarisiz_ders_sayisi
  FROM public.ogrenci_dersleri
  WHERE ogrenci_id = p_ogrenci_id
    AND not_kodu IN ('DC', 'DD', 'FD', 'FF');

  -- Aşama gecikmesi (yarıyıl)
  SELECT COALESCE(MAX(gecikme_yariyil), 0)
  INTO v_asama_gecikmesi
  FROM public.ogrenci_asamalari
  WHERE ogrenci_id = p_ogrenci_id
    AND durum = 'Devam_Ediyor';

  -- Risk skoru hesapla (0-100 arası)
  -- Azami süreye yakınlık: %40 ağırlık (0-40 puan)
  v_risk_skoru := v_risk_skoru + LEAST(40, v_azami_sureye_yakinlik * 0.4);

  -- Not ortalaması: %30 ağırlık (0-30 puan)
  IF v_not_ortalamasi IS NOT NULL THEN
    IF v_not_ortalamasi < 2.0 THEN
      v_risk_skoru := v_risk_skoru + 30; -- 2.0 altı = yüksek risk
    ELSIF v_not_ortalamasi < 2.5 THEN
      v_risk_skoru := v_risk_skoru + 20; -- 2.0-2.5 = orta risk
    ELSIF v_not_ortalamasi < 3.0 THEN
      v_risk_skoru := v_risk_skoru + 10; -- 2.5-3.0 = düşük risk
    END IF;
  END IF;

  -- Başarısız ders sayısı: %20 ağırlık (0-20 puan)
  v_risk_skoru := v_risk_skoru + LEAST(20, v_basarisiz_ders_sayisi * 5);

  -- Aşama gecikmesi: %10 ağırlık (0-10 puan)
  v_risk_skoru := v_risk_skoru + LEAST(10, v_asama_gecikmesi * 2);

  -- Risk skorunu 0-100 arasında sınırla
  v_risk_skoru := LEAST(100, GREATEST(0, v_risk_skoru));

  RETURN v_risk_skoru;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. RİSK SEVİYESİ BELİRLEME FONKSİYONU
-- ============================================

CREATE OR REPLACE FUNCTION public.hesapla_risk_seviyesi(p_risk_skoru INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_risk_skoru >= 76 THEN
    RETURN 'Kritik';
  ELSIF p_risk_skoru >= 51 THEN
    RETURN 'Yuksek';
  ELSIF p_risk_skoru >= 26 THEN
    RETURN 'Orta';
  ELSE
    RETURN 'Dusuk';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. ÖĞRENCI AKADEMIK DURUM GÜNCELLEME TRIGGER'I
-- ============================================

CREATE OR REPLACE FUNCTION public.update_ogrenci_akademik_durum()
RETURNS TRIGGER AS $$
BEGIN
  -- Not ortalaması ve tamamlanan AKTS'yi güncelle
  UPDATE public.ogrenci_akademik_durum
  SET 
    not_ortalamasi = (
      SELECT AVG(CASE 
        WHEN not_kodu = 'AA' THEN 4.0
        WHEN not_kodu = 'BA' THEN 3.5
        WHEN not_kodu = 'BB' THEN 3.0
        WHEN not_kodu = 'CB' THEN 2.5
        WHEN not_kodu = 'CC' THEN 2.0
        WHEN not_kodu = 'DC' THEN 1.5
        WHEN not_kodu = 'DD' THEN 1.0
        WHEN not_kodu = 'FD' THEN 0.5
        WHEN not_kodu = 'FF' THEN 0.0
        ELSE NULL
      END)
      FROM public.ogrenci_dersleri
      WHERE ogrenci_id = NEW.ogrenci_id
    ),
    tamamlanan_akts = (
      SELECT COALESCE(SUM(akts), 0)
      FROM public.ogrenci_dersleri
      WHERE ogrenci_id = NEW.ogrenci_id
        AND not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC')
    ),
    updated_at = now()
  WHERE ogrenci_id = NEW.ogrenci_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: ogrenci_dersleri tablosuna INSERT/UPDATE olduğunda
DROP TRIGGER IF EXISTS trigger_update_ogrenci_akademik_durum ON public.ogrenci_dersleri;
CREATE TRIGGER trigger_update_ogrenci_akademik_durum
  AFTER INSERT OR UPDATE ON public.ogrenci_dersleri
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ogrenci_akademik_durum();

-- ============================================
-- 4. AŞAMA GEÇİŞ TRIGGER'I
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_asama_gecisi()
RETURNS TRIGGER AS $$
DECLARE
  v_eski_asama_id UUID;
BEGIN
  -- Eski aktif aşamayı tamamlandı olarak işaretle
  IF NEW.durum = 'Tamamlandi' AND OLD.durum = 'Devam_Ediyor' THEN
    UPDATE public.ogrenci_akademik_durum
    SET mevcut_asama_id = NULL
    WHERE mevcut_asama_id = NEW.asama_id;
  END IF;

  -- Yeni aktif aşama başladığında
  IF NEW.durum = 'Devam_Ediyor' THEN
    UPDATE public.ogrenci_akademik_durum
    SET mevcut_asama_id = NEW.asama_id
    WHERE ogrenci_id = NEW.ogrenci_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: ogrenci_asamalari tablosuna INSERT/UPDATE olduğunda
DROP TRIGGER IF EXISTS trigger_handle_asama_gecisi ON public.ogrenci_asamalari;
CREATE TRIGGER trigger_handle_asama_gecisi
  AFTER INSERT OR UPDATE ON public.ogrenci_asamalari
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_asama_gecisi();

-- ============================================
-- 5. RİSK SKORU GÜNCELLEME TRIGGER'I
-- ============================================

CREATE OR REPLACE FUNCTION public.update_risk_skoru()
RETURNS TRIGGER AS $$
DECLARE
  v_risk_skoru INTEGER;
  v_risk_seviyesi TEXT;
  v_azami_sureye_yakinlik NUMERIC;
BEGIN
  -- Risk skorunu hesapla
  v_risk_skoru := public.hesapla_risk_skoru(NEW.ogrenci_id);
  v_risk_seviyesi := public.hesapla_risk_seviyesi(v_risk_skoru);

  -- Risk skorunu güncelle veya ekle
  INSERT INTO public.ogrenci_risk_skorlari (
    ogrenci_id,
    risk_skoru,
    risk_seviyesi,
    hesaplama_tarihi,
    updated_at
  )
  VALUES (
    NEW.ogrenci_id,
    v_risk_skoru,
    v_risk_seviyesi,
    now(),
    now()
  )
  ON CONFLICT (ogrenci_id) 
  DO UPDATE SET
    risk_skoru = v_risk_skoru,
    risk_seviyesi = v_risk_seviyesi,
    hesaplama_tarihi = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: ogrenci_akademik_durum güncellendiğinde risk skorunu hesapla
DROP TRIGGER IF EXISTS trigger_update_risk_skoru ON public.ogrenci_akademik_durum;
CREATE TRIGGER trigger_update_risk_skoru
  AFTER UPDATE ON public.ogrenci_akademik_durum
  FOR EACH ROW
  EXECUTE FUNCTION public.update_risk_skoru();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.hesapla_risk_skoru IS 'Öğrenci risk skorunu hesaplar (0-100 arası) - Azami süreye yakınlık, not ortalaması, başarısız ders sayısı, aşama gecikmesi';
COMMENT ON FUNCTION public.hesapla_risk_seviyesi IS 'Risk skoruna göre risk seviyesini belirler (Dusuk, Orta, Yuksek, Kritik)';
COMMENT ON FUNCTION public.update_ogrenci_akademik_durum IS 'Öğrenci dersleri güncellendiğinde akademik durumu günceller (not ortalaması, tamamlanan AKTS)';
COMMENT ON FUNCTION public.handle_asama_gecisi IS 'Aşama geçişlerini yönetir - Aktif aşamayı günceller';
COMMENT ON FUNCTION public.update_risk_skoru IS 'Akademik durum güncellendiğinde risk skorunu hesaplar ve günceller';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Oluşturulan fonksiyonlar:
-- 1. hesapla_risk_skoru - Risk skoru hesaplama (0-100)
-- 2. hesapla_risk_seviyesi - Risk seviyesi belirleme
-- 3. update_ogrenci_akademik_durum - Akademik durum güncelleme
-- 4. handle_asama_gecisi - Aşama geçiş yönetimi
-- 5. update_risk_skoru - Risk skoru güncelleme

-- Oluşturulan trigger'lar:
-- 1. trigger_update_ogrenci_akademik_durum - ogrenci_dersleri INSERT/UPDATE
-- 2. trigger_handle_asama_gecisi - ogrenci_asamalari INSERT/UPDATE
-- 3. trigger_update_risk_skoru - ogrenci_akademik_durum UPDATE

