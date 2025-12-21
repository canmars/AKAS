-- Migration 022: Risk Score Functions (Plan Faz 2.2)
-- Risk skoru hesaplama alt fonksiyonları (01_RISK_SKORU_ALGORITMASI.md'ye göre)

-- ============================================
-- DOKTORA RİSK FAKTÖRÜ FONKSİYONLARI
-- ============================================

-- TİK Risk Hesaplama (Ağırlık: 0.35)
CREATE OR REPLACE FUNCTION hesapla_tik_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_katilmama_sayisi INT;
  v_rapor_verilmemis_sayisi INT;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Son 12 ayda katılmama/raporlu sayısı
  SELECT COUNT(*) INTO v_katilmama_sayisi
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
    AND katilim_durumu IN ('Katilmadi', 'Raporlu')
    AND toplanti_tarihi >= CURRENT_DATE - INTERVAL '12 months';
  
  -- Üst üste 2 kez katılmama: Kritik (1.0)
  IF v_katilmama_sayisi >= 2 THEN
    v_risk_puani := 1.0;
  -- 1 kez katılmama: Yüksek (0.75)
  ELSIF v_katilmama_sayisi = 1 THEN
    v_risk_puani := 0.75;
  -- Rapor verilmemiş katılım: Orta (0.50)
  ELSIF EXISTS (
    SELECT 1 FROM public.tik_toplantilari
    WHERE ogrenci_id = p_ogrenci_id
      AND katilim_durumu = 'Katildi'
      AND rapor_verildi_mi = false
      AND toplanti_tarihi = (
        SELECT MAX(toplanti_tarihi) 
        FROM public.tik_toplantilari 
        WHERE ogrenci_id = p_ogrenci_id
      )
  ) THEN
    v_risk_puani := 0.50;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Yeterlik Risk Hesaplama (Ağırlık: 0.25)
CREATE OR REPLACE FUNCTION hesapla_yeterlik_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_risk_puani NUMERIC := 0;
  v_kayit_tarihi DATE;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Gecikmiş yeterlik sınavı: Kritik (1.0)
  IF EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
      AND milestone_turu = 'Yeterlik_Sinavi'
      AND durum = 'Gecikmis'
  ) THEN
    v_risk_puani := 1.0;
  -- 4. yarıyıl geçmiş ve yeterlik yok: Yüksek (0.75)
  ELSIF v_mevcut_yariyil >= 4 AND NOT EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
      AND milestone_turu = 'Yeterlik_Sinavi'
      AND durum = 'Tamamlandi'
  ) THEN
    v_risk_puani := 0.75;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Tez Önerisi Risk Hesaplama (Ağırlık: 0.20)
CREATE OR REPLACE FUNCTION hesapla_tez_onersi_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Gecikmiş tez önerisi: Kritik (1.0)
  IF EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
      AND milestone_turu = 'Tez_Onersi'
      AND durum = 'Gecikmis'
  ) THEN
    v_risk_puani := 1.0;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Maksimum Süre Risk Hesaplama (Ağırlık: 0.15) - Tüm programlar için
CREATE OR REPLACE FUNCTION hesapla_maksimum_sure_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_maksimum_yariyil INT;
  v_kayit_tarihi DATE;
  v_program_kodu TEXT;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT o.kayit_tarihi, pt.program_kodu, pt.maksimum_sure_yariyil
  INTO v_kayit_tarihi, v_program_kodu, v_maksimum_yariyil
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Program türüne göre risk hesapla
  IF v_program_kodu = 'Doktora' THEN
    -- Doktora: 10 yarıyıl maksimum
    IF v_mevcut_yariyil >= 10 THEN
      v_risk_puani := 0.75;
    ELSIF v_mevcut_yariyil >= 8 THEN
      v_risk_puani := 0.50;
    END IF;
  ELSIF v_program_kodu = 'Tezli_YL' THEN
    -- Tezli YL: 6 yarıyıl maksimum
    IF v_mevcut_yariyil >= 6 THEN
      v_risk_puani := 1.0;
    ELSIF v_mevcut_yariyil >= 5 THEN
      v_risk_puani := 0.75;
    ELSIF v_mevcut_yariyil >= 4 THEN
      v_risk_puani := 0.50;
    ELSIF v_mevcut_yariyil >= 3 THEN
      v_risk_puani := 0.25;
    END IF;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Tez İlerleme Risk Hesaplama (Ağırlık: 0.05)
CREATE OR REPLACE FUNCTION hesapla_tez_ilerleme_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_tik_sayisi INT;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Son 12 ayda TİK toplantısı sayısı
  SELECT COUNT(*) INTO v_tik_sayisi
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
    AND toplanti_tarihi >= CURRENT_DATE - INTERVAL '12 months';
  
  -- Beklenen: 2 toplantı (6 ayda bir)
  -- 2'den az ise: Orta (0.50)
  IF v_tik_sayisi < 2 THEN
    v_risk_puani := 0.50;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEZLİ YÜKSEK LİSANS RİSK FAKTÖRÜ FONKSİYONLARI
-- ============================================

-- Ders Tamamlama Risk Hesaplama (Ağırlık: 0.40)
CREATE OR REPLACE FUNCTION hesapla_ders_tamamlama_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_ders_tamamlandi_mi BOOLEAN;
  v_kayit_tarihi DATE;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT o.kayit_tarihi, COALESCE(oad.ders_tamamlandi_mi, false)
  INTO v_kayit_tarihi, v_ders_tamamlandi_mi
  FROM public.ogrenci o
  LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  WHERE o.ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- 4 yarıyıl geçmiş ve dersler tamamlanmamış: Kritik (1.0)
  IF v_mevcut_yariyil > 4 AND v_ders_tamamlandi_mi = false THEN
    v_risk_puani := 1.0;
  -- 4. yarıyılda ve dersler tamamlanmamış: Yüksek (0.75)
  ELSIF v_mevcut_yariyil = 4 AND v_ders_tamamlandi_mi = false THEN
    v_risk_puani := 0.75;
  -- 3. yarıyılda ve dersler tamamlanmamış: Orta (0.50)
  ELSIF v_mevcut_yariyil = 3 AND v_ders_tamamlandi_mi = false THEN
    v_risk_puani := 0.50;
  -- 2. yarıyılda ve dersler tamamlanmamış: Düşük (0.25)
  ELSIF v_mevcut_yariyil = 2 AND v_ders_tamamlandi_mi = false THEN
    v_risk_puani := 0.25;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Tez Dönem Kayıt Risk Hesaplama (Ağırlık: 0.30)
CREATE OR REPLACE FUNCTION hesapla_tez_donem_kayit_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_son_2_yariyil_kayit_sayisi INT;
  v_kayit_tarihi DATE;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Son 2 yarıyılda tez dönem kayıt sayısı
  SELECT COUNT(*) INTO v_son_2_yariyil_kayit_sayisi
  FROM public.tez_donem_kayitlari
  WHERE ogrenci_id = p_ogrenci_id
    AND yariyil >= (v_mevcut_yariyil - 2);
  
  -- Son 2 yarıyılda hiç kayıt yok: Kritik (1.0)
  IF v_son_2_yariyil_kayit_sayisi = 0 THEN
    v_risk_puani := 1.0;
  -- Sadece 1 yarıyıl kayıt var: Yüksek (0.75)
  ELSIF v_son_2_yariyil_kayit_sayisi = 1 THEN
    v_risk_puani := 0.75;
  -- 2 yarıyıl kayıt var ama eksiklikler var: Orta (0.50)
  ELSIF v_son_2_yariyil_kayit_sayisi = 2 THEN
    v_risk_puani := 0.50;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Danışman Değerlendirme Risk Hesaplama (Ağırlık: 0.20)
CREATE OR REPLACE FUNCTION hesapla_danisman_degerlendirme_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_basarisiz_sayisi INT;
  v_kayit_tarihi DATE;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Son 2 yarıyılda başarısız değerlendirme sayısı
  SELECT COUNT(*) INTO v_basarisiz_sayisi
  FROM public.tez_donem_kayitlari
  WHERE ogrenci_id = p_ogrenci_id
    AND danisman_degerlendirmesi IN ('Basarisiz', 'Yetersiz', 'Gelismekte_Olan')
    AND yariyil >= (v_mevcut_yariyil - 2);
  
  -- Üst üste 2 kez başarısız: Kritik (1.0)
  IF v_basarisiz_sayisi >= 2 THEN
    v_risk_puani := 1.0;
  -- 1 kez başarısız: Yüksek (0.75)
  ELSIF v_basarisiz_sayisi = 1 THEN
    v_risk_puani := 0.75;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEZSİZ YÜKSEK LİSANS RİSK FAKTÖRÜ FONKSİYONLARI
-- ============================================

-- Hayalet Öğrenci Risk Hesaplama (Ağırlık: 0.50)
CREATE OR REPLACE FUNCTION hesapla_hayalet_ogrenci_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_son_login TIMESTAMP WITH TIME ZONE;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Son login bilgisini al
  SELECT son_login INTO v_son_login
  FROM public.ogrenci_son_login
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- 6+ ay login yok: Kritik (1.0)
  IF v_son_login IS NULL OR v_son_login < CURRENT_DATE - INTERVAL '6 months' THEN
    v_risk_puani := 1.0;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Ders Tamamlama Tezsiz Risk Hesaplama (Ağırlık: 0.30)
CREATE OR REPLACE FUNCTION hesapla_ders_tamamlama_tezsiz_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_tamamlanan_ders_sayisi INT;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Tamamlanan ders sayısını al
  SELECT COALESCE(tamamlanan_ders_sayisi, 0) INTO v_tamamlanan_ders_sayisi
  FROM public.ogrenci_akademik_durum
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- 10 ders tamamlanmalı
  -- 0-3 ders: Kritik (1.0)
  IF v_tamamlanan_ders_sayisi <= 3 THEN
    v_risk_puani := 1.0;
  -- 4-6 ders: Yüksek (0.75)
  ELSIF v_tamamlanan_ders_sayisi <= 6 THEN
    v_risk_puani := 0.75;
  -- 7-8 ders: Orta (0.50)
  ELSIF v_tamamlanan_ders_sayisi <= 8 THEN
    v_risk_puani := 0.50;
  -- 9 ders: Düşük (0.25)
  ELSIF v_tamamlanan_ders_sayisi = 9 THEN
    v_risk_puani := 0.25;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- Dönem Projesi Risk Hesaplama (Ağırlık: 0.20)
CREATE OR REPLACE FUNCTION hesapla_donem_projesi_risk(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_kayit_tarihi DATE;
  v_risk_puani NUMERIC := 0;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- 3. yarıyıl geçmiş ve dönem projesi yok: Kritik (1.0)
  IF v_mevcut_yariyil >= 3 AND NOT EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
      AND milestone_turu = 'Donem_Projesi'
      AND durum = 'Tamamlandi'
  ) THEN
    v_risk_puani := 1.0;
  -- 2. yarıyılda ve dönem projesi yok: Yüksek (0.75)
  ELSIF v_mevcut_yariyil >= 2 AND NOT EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
      AND milestone_turu = 'Donem_Projesi'
      AND durum = 'Tamamlandi'
  ) THEN
    v_risk_puani := 0.75;
  END IF;
  
  RETURN v_risk_puani;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION hesapla_tik_risk IS 'TİK katılım risk faktörü (Doktora - Ağırlık: 0.35)';
COMMENT ON FUNCTION hesapla_yeterlik_risk IS 'Yeterlik sınavı risk faktörü (Doktora - Ağırlık: 0.25)';
COMMENT ON FUNCTION hesapla_tez_onersi_risk IS 'Tez önerisi risk faktörü (Doktora - Ağırlık: 0.20)';
COMMENT ON FUNCTION hesapla_maksimum_sure_risk IS 'Maksimum süre risk faktörü (Tüm programlar - Ağırlık: 0.15 Doktora, 0.10 Tezli YL)';
COMMENT ON FUNCTION hesapla_tez_ilerleme_risk IS 'Tez ilerleme risk faktörü (Doktora - Ağırlık: 0.05)';
COMMENT ON FUNCTION hesapla_ders_tamamlama_risk IS 'Ders tamamlama risk faktörü (Tezli YL - Ağırlık: 0.40)';
COMMENT ON FUNCTION hesapla_tez_donem_kayit_risk IS 'Tez dönem kayıt risk faktörü (Tezli YL - Ağırlık: 0.30)';
COMMENT ON FUNCTION hesapla_danisman_degerlendirme_risk IS 'Danışman değerlendirme risk faktörü (Tezli YL - Ağırlık: 0.20)';
COMMENT ON FUNCTION hesapla_hayalet_ogrenci_risk IS 'Hayalet öğrenci risk faktörü (Tezsiz YL - Ağırlık: 0.50)';
COMMENT ON FUNCTION hesapla_ders_tamamlama_tezsiz_risk IS 'Ders tamamlama risk faktörü (Tezsiz YL - Ağırlık: 0.30)';
COMMENT ON FUNCTION hesapla_donem_projesi_risk IS 'Dönem projesi risk faktörü (Tezsiz YL - Ağırlık: 0.20)';

