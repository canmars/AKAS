-- Migration 006: Functions
-- Fonksiyonlar: yarıyıl hesaplama, risk skoru hesaplama (basitleştirilmiş)

-- ============================================
-- YARIYIL HESAPLAMA FONKSIYONU
-- ============================================
CREATE OR REPLACE FUNCTION calculate_yariyil(
  p_kayit_tarihi DATE, 
  p_bugun_tarihi DATE DEFAULT CURRENT_DATE
)
RETURNS INT AS $$
DECLARE
  v_kayit_yili INT;
  v_kayit_ayi INT;
  v_bugun_yili INT;
  v_bugun_ayi INT;
  v_yil_farki INT;
  v_yariyil INT;
  v_ekim_ayindan_sonra_mi BOOLEAN;
BEGIN
  -- Kayıt tarihi bilgilerini al
  v_kayit_yili := EXTRACT(YEAR FROM p_kayit_tarihi);
  v_kayit_ayi := EXTRACT(MONTH FROM p_kayit_tarihi);
  
  -- Bugünün tarihi bilgilerini al
  v_bugun_yili := EXTRACT(YEAR FROM p_bugun_tarihi);
  v_bugun_ayi := EXTRACT(MONTH FROM p_bugun_tarihi);
  
  -- Yıl farkını hesapla
  v_yil_farki := v_bugun_yili - v_kayit_yili;
  
  -- İlk yarıyıl hesaplama
  IF v_kayit_ayi >= 10 THEN
    -- Ekim, Kasım, Aralık'ta kayıt: Güz dönemi (1. yarıyıl)
    v_yariyil := 1;
    v_ekim_ayindan_sonra_mi := true;
  ELSIF v_kayit_ayi >= 2 AND v_kayit_ayi <= 6 THEN
    -- Şubat-Haziran arası kayıt: Bahar dönemi (1. yarıyıl)
    v_yariyil := 1;
    v_ekim_ayindan_sonra_mi := false;
  ELSE
    -- Ocak, Temmuz, Ağustos, Eylül'de kayıt
    IF v_kayit_ayi = 1 THEN
      -- Ocak: Şubat'tan itibaren (Bahar dönemi)
      v_yariyil := 1;
      v_ekim_ayindan_sonra_mi := false;
    ELSE
      -- Temmuz-Eylül: Ekim'den itibaren (Güz dönemi)
      v_yariyil := 1;
      v_ekim_ayindan_sonra_mi := true;
    END IF;
  END IF;
  
  -- Geçen yılları hesapla
  IF v_yil_farki > 0 THEN
    -- Her yıl 2 yarıyıl (Güz + Bahar)
    v_yariyil := v_yariyil + (v_yil_farki * 2);
  END IF;
  
  -- Mevcut yıl içindeki yarıyıl artışını hesapla
  IF v_ekim_ayindan_sonra_mi THEN
    -- Güz döneminde başladıysa
    IF v_bugun_ayi >= 2 AND v_bugun_ayi <= 6 THEN
      -- Şubat-Haziran arasındaysa: Bahar dönemi geçiyor (1 yarıyıl daha)
      IF v_bugun_yili > v_kayit_yili THEN
        v_yariyil := v_yariyil + 1;
      END IF;
    END IF;
  ELSE
    -- Bahar döneminde başladıysa
    IF v_bugun_ayi >= 10 THEN
      -- Ekim-Aralık arasındaysa: Güz dönemi geçiyor (1 yarıyıl daha)
      IF v_bugun_yili > v_kayit_yili THEN
        v_yariyil := v_yariyil + 1;
      END IF;
    END IF;
  END IF;
  
  -- Aynı akademik yıl içinde yarıyıl geçişi kontrolü
  IF v_bugun_yili = v_kayit_yili THEN
    IF v_ekim_ayindan_sonra_mi THEN
      -- Güz döneminde başladı
      IF v_bugun_ayi >= 2 AND v_bugun_ayi <= 6 THEN
        -- Şubat-Haziran: Bahar dönemi (2. yarıyıl)
        v_yariyil := 2;
      END IF;
    ELSE
      -- Bahar döneminde başladı
      IF v_bugun_ayi >= 10 THEN
        -- Ekim-Aralık: Güz dönemi (2. yarıyıl)
        v_yariyil := 2;
      END IF;
    END IF;
  END IF;
  
  RETURN v_yariyil;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOT: update_mevcut_yariyil trigger'ı kaldırıldı
-- Normalizasyon: mevcut_yariyil artık view'dan hesaplanıyor (ogrenci_mevcut_durum_view)
-- ============================================

-- ============================================
-- RISK SKORU HESAPLAMA FONKSIYONU (Detaylı - 01_RISK_SKORU_ALGORITMASI.md'ye göre)
-- ============================================
CREATE OR REPLACE FUNCTION hesapla_risk_skoru(p_ogrenci_id UUID)
RETURNS INT AS $$
DECLARE
  v_risk_skoru INT := 0;
  v_toplam_puan NUMERIC := 0;
  v_program_kodu TEXT;
  v_kayit_tarihi DATE;
  v_mevcut_yariyil INT;
  v_maksimum_yariyil INT;
  v_son_login TIMESTAMP WITH TIME ZONE;
  v_ders_tamamlandi_mi BOOLEAN;
  v_tamamlanan_ders_sayisi INT;
  v_risk_faktorleri JSONB := '{}';
  
  -- Doktora Risk Faktörleri
  v_tik_puani DECIMAL := 0;
  v_yeterlik_puani DECIMAL := 0;
  v_tez_onersi_puani DECIMAL := 0;
  v_maksimum_sure_puani DECIMAL := 0;
  v_tez_ilerleme_puani DECIMAL := 0;
  
  -- Tezli YL Risk Faktörleri
  v_ders_tamamlama_puani DECIMAL := 0;
  v_tez_donem_kayit_puani DECIMAL := 0;
  v_danisman_degerlendirme_puani DECIMAL := 0;
  
  -- Tezsiz YL Risk Faktörleri
  v_hayalet_ogrenci_puani DECIMAL := 0;
  v_ders_tamamlama_tezsiz_puani DECIMAL := 0;
  v_donem_projesi_puani DECIMAL := 0;
BEGIN
  -- Öğrenci bilgilerini al (normalizasyon tablolarından)
  SELECT 
    pt.program_kodu,
    o.kayit_tarihi,
    pt.maksimum_sure_yariyil,
    osl.son_login,
    oad.ders_tamamlandi_mi,
    oad.tamamlanan_ders_sayisi
  INTO 
    v_program_kodu,
    v_kayit_tarihi,
    v_maksimum_yariyil,
    v_son_login,
    v_ders_tamamlandi_mi,
    v_tamamlanan_ders_sayisi
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  LEFT JOIN public.ogrenci_son_login osl ON o.ogrenci_id = osl.ogrenci_id
  LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  WHERE o.ogrenci_id = p_ogrenci_id;
  
  IF v_program_kodu IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Program türüne göre risk faktörlerini hesapla
  IF v_program_kodu = 'Doktora' THEN
    -- TİK Katılmama/Rapor Vermeme (Ağırlık: 0.35)
    SELECT COUNT(*) INTO v_tik_puani
    FROM public.tik_toplantilari
    WHERE ogrenci_id = p_ogrenci_id
      AND katilim_durumu IN ('Katilmadi', 'Raporlu')
      AND toplanti_tarihi >= CURRENT_DATE - INTERVAL '12 months';
    
    IF v_tik_puani >= 2 THEN
      v_tik_puani := 1.0;
    ELSIF v_tik_puani = 1 THEN
      v_tik_puani := 0.75;
    ELSIF EXISTS (
      SELECT 1 FROM public.tik_toplantilari
      WHERE ogrenci_id = p_ogrenci_id
        AND katilim_durumu = 'Katildi'
        AND rapor_verildi_mi = false
        AND toplanti_tarihi = (SELECT MAX(toplanti_tarihi) FROM public.tik_toplantilari WHERE ogrenci_id = p_ogrenci_id)
    ) THEN
      v_tik_puani := 0.50;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_tik_puani * 0.35);
    
    -- Yeterlik Süresi Aşımı (Ağırlık: 0.25)
    IF EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Yeterlik_Sinavi'
        AND durum = 'Gecikmis'
    ) THEN
      v_yeterlik_puani := 1.0;
    ELSIF v_mevcut_yariyil >= 4 AND NOT EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Yeterlik_Sinavi'
        AND durum = 'Tamamlandi'
    ) THEN
      v_yeterlik_puani := 0.75;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_yeterlik_puani * 0.25);
    
    -- Tez Önerisi Süresi Aşımı (Ağırlık: 0.20)
    IF EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Tez_Onersi'
        AND durum = 'Gecikmis'
    ) THEN
      v_tez_onersi_puani := 1.0;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_tez_onersi_puani * 0.20);
    
    -- Maksimum Süre Aşımı Yaklaşması (Ağırlık: 0.15)
    IF v_mevcut_yariyil >= 10 THEN
      v_maksimum_sure_puani := 0.75;
    ELSIF v_mevcut_yariyil >= 8 THEN
      v_maksimum_sure_puani := 0.50;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_maksimum_sure_puani * 0.15);
    
    -- Tez İlerleme Yavaşlığı (Ağırlık: 0.05)
    IF (SELECT COUNT(*) FROM public.tik_toplantilari 
        WHERE ogrenci_id = p_ogrenci_id 
        AND toplanti_tarihi >= CURRENT_DATE - INTERVAL '12 months') < 2 THEN
      v_tez_ilerleme_puani := 0.50;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_tez_ilerleme_puani * 0.05);
    
  ELSIF v_program_kodu = 'Tezli_YL' THEN
    -- Ders Tamamlama Süresi Aşımı (Ağırlık: 0.50)
    IF v_mevcut_yariyil >= 4 AND COALESCE(v_ders_tamamlandi_mi, false) = false THEN
      v_ders_tamamlama_puani := 1.0;
    ELSIF v_mevcut_yariyil >= 3 AND COALESCE(v_ders_tamamlandi_mi, false) = false THEN
      v_ders_tamamlama_puani := 0.75;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_ders_tamamlama_puani * 0.50);
    
    -- Tez Savunma Süresi Aşımı (Ağırlık: 0.50)
    IF v_mevcut_yariyil >= 6 AND NOT EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Tez_Savunmasi'
        AND durum = 'Tamamlandi'
    ) THEN
      v_toplam_puan := v_toplam_puan + 0.50;
    ELSIF v_mevcut_yariyil >= 5 AND NOT EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Tez_Savunmasi'
        AND durum = 'Tamamlandi'
    ) THEN
      v_toplam_puan := v_toplam_puan + 0.375;
    END IF;
    
  ELSIF v_program_kodu IN ('Tezsiz_YL_IO', 'Tezsiz_YL_Uzaktan') THEN
    -- Hayalet Öğrenci (Ağırlık: 0.50)
    IF v_son_login IS NULL OR v_son_login < CURRENT_DATE - INTERVAL '6 months' THEN
      v_hayalet_ogrenci_puani := 1.0;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_hayalet_ogrenci_puani * 0.50);
    
    -- Dönem Projesi Süresi Aşımı (Ağırlık: 0.50)
    IF v_mevcut_yariyil >= 3 AND NOT EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Donem_Projesi'
        AND durum = 'Tamamlandi'
    ) THEN
      v_donem_projesi_puani := 1.0;
    ELSIF v_mevcut_yariyil >= 2 AND NOT EXISTS (
      SELECT 1 FROM public.akademik_milestone
      WHERE ogrenci_id = p_ogrenci_id
        AND milestone_turu = 'Donem_Projesi'
        AND durum = 'Tamamlandi'
    ) THEN
      v_donem_projesi_puani := 0.75;
    END IF;
    v_toplam_puan := v_toplam_puan + (v_donem_projesi_puani * 0.50);
  END IF;
  
  -- Risk skorunu 0-100 arasına dönüştür
  v_risk_skoru := ROUND(v_toplam_puan * 100);
  
  IF v_risk_skoru < 0 THEN
    v_risk_skoru := 0;
  ELSIF v_risk_skoru > 100 THEN
    v_risk_skoru := 100;
  END IF;
  
  RETURN v_risk_skoru;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW'LAR (Performans için)
-- ============================================

-- Öğrenci Mevcut Durum View
CREATE OR REPLACE VIEW public.ogrenci_mevcut_durum_view AS
SELECT 
  o.ogrenci_id,
  o.kayit_tarihi,
  public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) as mevcut_yariyil,
  oad.mevcut_asinama,
  oad.ders_tamamlandi_mi,
  oad.tamamlanan_ders_sayisi,
  osl.son_login,
  COALESCE(ora.risk_skoru, 0) as mevcut_risk_skoru,
  ora.risk_seviyesi,
  ora.hesaplama_tarihi as risk_skoru_hesaplama_tarihi
FROM public.ogrenci o
LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
LEFT JOIN public.ogrenci_son_login osl ON o.ogrenci_id = osl.ogrenci_id
LEFT JOIN LATERAL (
  SELECT risk_skoru, risk_seviyesi, hesaplama_tarihi
  FROM public.ogrenci_risk_analizi
  WHERE ogrenci_id = o.ogrenci_id
  ORDER BY hesaplama_tarihi DESC
  LIMIT 1
) ora ON true
WHERE o.soft_delete = false;

-- Akademik Personel Yük View
CREATE OR REPLACE VIEW public.akademik_personel_yuk_view AS
SELECT 
  ap.personel_id,
  ap.ad,
  ap.soyad,
  ap.unvan,
  ap.maksimum_kapasite,
  COUNT(DISTINCT dg.ogrenci_id) FILTER (
    WHERE dg.aktif_mi = true 
    AND o.durum_id IN (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu'))
    AND o.soft_delete = false
  ) as mevcut_yuk,
  ap.maksimum_kapasite - COUNT(DISTINCT dg.ogrenci_id) FILTER (
    WHERE dg.aktif_mi = true 
    AND o.durum_id IN (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu'))
    AND o.soft_delete = false
  ) as kalan_kapasite,
  ROUND(
    (COUNT(DISTINCT dg.ogrenci_id) FILTER (
      WHERE dg.aktif_mi = true 
      AND o.durum_id IN (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu'))
      AND o.soft_delete = false
    )::NUMERIC / NULLIF(ap.maksimum_kapasite, 0)) * 100,
    2
  ) as kapasite_kullanim_yuzdesi
FROM public.akademik_personel ap
LEFT JOIN public.danisman_gecmisi dg ON ap.personel_id = dg.danisman_id
LEFT JOIN public.ogrenci o ON dg.ogrenci_id = o.ogrenci_id
WHERE ap.aktif_mi = true
GROUP BY ap.personel_id, ap.ad, ap.soyad, ap.unvan, ap.maksimum_kapasite;

-- Öğrenci Risk Özet View
CREATE OR REPLACE VIEW public.ogrenci_risk_ozet_view AS
SELECT 
  o.ogrenci_id,
  o.kayit_tarihi,
  pt.program_adi,
  pt.program_kodu,
  dt.durum_adi,
  public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) as mevcut_yariyil,
  pt.maksimum_sure_yariyil,
  COALESCE(ora.risk_skoru, 0) as risk_skoru,
  ora.risk_seviyesi,
  ora.hayalet_ogrenci_mi,
  ora.hesaplama_tarihi
FROM public.ogrenci o
JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
LEFT JOIN LATERAL (
  SELECT risk_skoru, risk_seviyesi, hayalet_ogrenci_mi, hesaplama_tarihi
  FROM public.ogrenci_risk_analizi
  WHERE ogrenci_id = o.ogrenci_id
  ORDER BY hesaplama_tarihi DESC
  LIMIT 1
) ora ON true
WHERE o.soft_delete = false;

-- Danışman Yük Detay View
CREATE OR REPLACE VIEW public.danisman_yuk_detay_view AS
SELECT 
  ap.personel_id,
  ap.ad || ' ' || ap.soyad as danisman_adi,
  ap.unvan,
  ap.maksimum_kapasite,
  COUNT(DISTINCT dg.ogrenci_id) FILTER (
    WHERE dg.aktif_mi = true 
    AND o.durum_id = (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu = 'Aktif')
    AND o.soft_delete = false
  ) as aktif_ogrenci_sayisi,
  COUNT(DISTINCT dg.ogrenci_id) FILTER (
    WHERE dg.aktif_mi = true 
    AND o.durum_id = (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu = 'Dondurdu')
    AND o.soft_delete = false
  ) as dondurulmus_ogrenci_sayisi,
  COUNT(DISTINCT dg.ogrenci_id) FILTER (
    WHERE dg.aktif_mi = true 
    AND o.soft_delete = false
  ) as toplam_ogrenci_sayisi,
  ROUND(
    (COUNT(DISTINCT dg.ogrenci_id) FILTER (
      WHERE dg.aktif_mi = true 
      AND o.soft_delete = false
    )::NUMERIC / NULLIF(ap.maksimum_kapasite, 0)) * 100, 
    2
  ) as kapasite_kullanim_yuzdesi
FROM public.akademik_personel ap
LEFT JOIN public.danisman_gecmisi dg ON ap.personel_id = dg.danisman_id
LEFT JOIN public.ogrenci o ON dg.ogrenci_id = o.ogrenci_id
WHERE ap.aktif_mi = true
GROUP BY ap.personel_id, ap.ad, ap.soyad, ap.unvan, ap.maksimum_kapasite;

-- ============================================
-- EK FUNCTION'LAR
-- ============================================

-- Akademik personel yük hesaplama
CREATE OR REPLACE FUNCTION calculate_akademik_personel_yuk(p_personel_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.danisman_gecmisi dg
    JOIN public.ogrenci o ON dg.ogrenci_id = o.ogrenci_id
    WHERE dg.danisman_id = p_personel_id
    AND dg.aktif_mi = true
    AND o.durum_id IN (SELECT durum_id FROM public.durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu'))
    AND o.soft_delete = false
  );
END;
$$ LANGUAGE plpgsql;

-- Mevcut yarıyılı hesapla ve güncelle
CREATE OR REPLACE FUNCTION calculate_mevcut_yariyil(p_ogrenci_id UUID)
RETURNS INT AS $$
DECLARE
  v_kayit_tarihi DATE;
  v_mevcut_yariyil INT;
BEGIN
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- ogrenci_akademik_durum tablosunu güncelle (eğer varsa)
  UPDATE public.ogrenci_akademik_durum
  SET guncelleme_tarihi = CURRENT_TIMESTAMP
  WHERE ogrenci_id = p_ogrenci_id;
  
  RETURN v_mevcut_yariyil;
END;
$$ LANGUAGE plpgsql;

-- Toplu risk skoru hesaplama (periyodik)
CREATE OR REPLACE FUNCTION batch_calculate_risk_skoru()
RETURNS TABLE(ogrenci_id UUID, risk_skoru INT, risk_seviyesi TEXT) AS $$
DECLARE
  v_ogrenci_record RECORD;
  v_hesaplanan_risk_skoru INT;
  v_risk_seviyesi TEXT;
BEGIN
  FOR v_ogrenci_record IN
    SELECT o.ogrenci_id
    FROM public.ogrenci o
    WHERE o.soft_delete = false
  LOOP
    v_hesaplanan_risk_skoru := hesapla_risk_skoru(v_ogrenci_record.ogrenci_id);
    
    v_risk_seviyesi := CASE 
      WHEN v_hesaplanan_risk_skoru >= 85 THEN 'Kritik'
      WHEN v_hesaplanan_risk_skoru >= 70 THEN 'Yuksek'
      WHEN v_hesaplanan_risk_skoru >= 40 THEN 'Orta'
      ELSE 'Dusuk'
    END;
    
    -- Risk analizi tablosuna kaydet
    INSERT INTO public.ogrenci_risk_analizi (
      ogrenci_id,
      risk_skoru,
      risk_seviyesi,
      tehlike_turu,
      hayalet_ogrenci_mi,
      hesaplama_tarihi
    )
    VALUES (
      v_ogrenci_record.ogrenci_id,
      v_hesaplanan_risk_skoru,
      v_risk_seviyesi,
      'Genel',
      COALESCE(
        (SELECT son_login < CURRENT_DATE - INTERVAL '6 months' 
         FROM public.ogrenci_son_login 
         WHERE ogrenci_id = v_ogrenci_record.ogrenci_id),
        false
      ),
      CURRENT_TIMESTAMP
    )
    ON CONFLICT DO NOTHING;
    
    -- Sonuç döndür
    ogrenci_id := v_ogrenci_record.ogrenci_id;
    risk_skoru := v_hesaplanan_risk_skoru;
    risk_seviyesi := v_risk_seviyesi;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. DARBOĞAZ SİMÜLASYONU (WHAT-IF ANALYSIS) FUNCTION'LARI
-- ============================================

-- Gelecek yıl X kadar öğrenci alırsam ne olur? - Simülasyon hesaplama
CREATE OR REPLACE FUNCTION simulate_future_capacity(
  p_yeni_ogrenci_sayisi INT,
  p_program_turu_dagilimi JSONB DEFAULT NULL
)
RETURNS TABLE (
  personel_id UUID,
  ad_soyad TEXT,
  unvan TEXT,
  mevcut_yuk INT,
  simulasyon_yuk INT,
  maksimum_kapasite INT,
  mevcut_kapasite_kullanim_yuzdesi NUMERIC,
  simulasyon_kapasite_kullanim_yuzdesi NUMERIC,
  darboğaz_riski TEXT,
  oneriler TEXT
) AS $$
DECLARE
  v_personel_record RECORD;
  v_ogrenci_atandi INT := 0;
  v_kalan_kapasite INT;
  v_simulasyon_yuk INT;
  v_simulasyon_yuzde NUMERIC;
BEGIN
  -- Tüm aktif akademik personeli mevcut yüklerine göre sırala (en az yüklüden başla)
  FOR v_personel_record IN
    SELECT 
      ap.personel_id,
      ap.ad || ' ' || ap.soyad as ad_soyad,
      ap.unvan,
      ap.maksimum_kapasite,
      calculate_akademik_personel_yuk(ap.personel_id) as mevcut_yuk
    FROM public.akademik_personel ap
    WHERE ap.aktif_mi = true
    ORDER BY calculate_akademik_personel_yuk(ap.personel_id) ASC, ap.maksimum_kapasite DESC
  LOOP
    -- Her hocaya öğrenci ataması yap (kapasiteye göre)
    v_kalan_kapasite := v_personel_record.maksimum_kapasite - v_personel_record.mevcut_yuk;
    
    -- Eğer hoca doluysa, simulasyon yükü mevcut yük ile aynı
    IF v_kalan_kapasite <= 0 THEN
      v_simulasyon_yuk := v_personel_record.mevcut_yuk;
    ELSIF v_ogrenci_atandi < p_yeni_ogrenci_sayisi THEN
      -- Hocaya atanacak öğrenci sayısı (kalan kapasite kadar veya kalan öğrenci sayısı kadar)
      DECLARE
        v_atanacak_ogrenci INT := LEAST(v_kalan_kapasite, p_yeni_ogrenci_sayisi - v_ogrenci_atandi);
      BEGIN
        v_simulasyon_yuk := v_personel_record.mevcut_yuk + v_atanacak_ogrenci;
        v_ogrenci_atandi := v_ogrenci_atandi + v_atanacak_ogrenci;
      END;
    ELSE
      v_simulasyon_yuk := v_personel_record.mevcut_yuk;
    END IF;
    
    -- Simülasyon kapasite kullanım yüzdesi
    v_simulasyon_yuzde := ROUND((v_simulasyon_yuk::NUMERIC / NULLIF(v_personel_record.maksimum_kapasite, 0)) * 100, 2);
    
    -- Darboğaz riski ve öneriler
    DECLARE
      v_darboğaz_riski TEXT;
      v_oneriler TEXT;
    BEGIN
      IF v_simulasyon_yuzde >= 100 THEN
        v_darboğaz_riski := 'Kritik - Kapasite Aşıldı';
        v_oneriler := 'Yeni öğrenci ataması yapılamaz. Kapasite artırılmalı veya öğrenci başka danışmana atanmalı.';
      ELSIF v_simulasyon_yuzde >= 90 THEN
        v_darboğaz_riski := 'Yüksek - Kapasiteye Çok Yakın';
        v_oneriler := 'Dikkatli atama yapılmalı. Kapasite artırılması değerlendirilmeli.';
      ELSIF v_simulasyon_yuzde >= 80 THEN
        v_darboğaz_riski := 'Orta - Kapasiteye Yakın';
        v_oneriler := 'Normal atama yapılabilir.';
      ELSE
        v_darboğaz_riski := 'Düşük - Yeterli Kapasite';
        v_oneriler := 'Rahatça atama yapılabilir.';
      END IF;
      
      RETURN QUERY
      SELECT 
        v_personel_record.personel_id,
        v_personel_record.ad_soyad,
        v_personel_record.unvan,
        v_personel_record.mevcut_yuk,
        v_simulasyon_yuk,
        v_personel_record.maksimum_kapasite,
        ROUND((v_personel_record.mevcut_yuk::NUMERIC / NULLIF(v_personel_record.maksimum_kapasite, 0)) * 100, 2),
        v_simulasyon_yuzde,
        v_darboğaz_riski,
        v_oneriler;
    END;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Simülasyon senaryosu oluştur ve kaydet
CREATE OR REPLACE FUNCTION create_simulation_scenario(
  p_senaryo_adi TEXT,
  p_yeni_ogrenci_sayisi INT,
  p_program_turu_dagilimi JSONB DEFAULT NULL,
  p_olusturan_kullanici_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_senaryo_id UUID;
  v_simulasyon_sonucu JSONB;
BEGIN
  -- Simülasyon sonuçlarını hesapla
  SELECT json_agg(row_to_json(t)) INTO v_simulasyon_sonucu
  FROM (
    SELECT * FROM simulate_future_capacity(p_yeni_ogrenci_sayisi, p_program_turu_dagilimi)
  ) t;
  
  -- Senaryoyu kaydet
  INSERT INTO public.simulasyon_senaryolari (
    senaryo_adi,
    hedef_yeni_ogrenci_sayisi,
    program_turu_dagilimi,
    simulasyon_sonucu,
    olusturan_kullanici_id
  ) VALUES (
    p_senaryo_adi,
    p_yeni_ogrenci_sayisi,
    p_program_turu_dagilimi,
    v_simulasyon_sonucu,
    p_olusturan_kullanici_id
  )
  RETURNING senaryo_id INTO v_senaryo_id;
  
  RETURN v_senaryo_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. AKADEMIK YUK DENGESI (LOAD BALANCING) FUNCTION'LARI
-- ============================================

-- Yeni öğrenci ataması için en uygun danışmanı öner
CREATE OR REPLACE FUNCTION suggest_danisman(
  p_ogrenci_id UUID,
  p_tez_konusu TEXT DEFAULT NULL
)
RETURNS TABLE (
  personel_id UUID,
  ad_soyad TEXT,
  unvan TEXT,
  mevcut_yuk INT,
  maksimum_kapasite INT,
  kalan_kapasite INT,
  kapasite_kullanim_yuzdesi NUMERIC,
  uzmanlik_uyumu_puani NUMERIC,
  oncelik_puani NUMERIC,
  oneriler TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH personel_verileri AS (
    SELECT 
      ap.personel_id,
      ap.ad || ' ' || ap.soyad as ad_soyad,
      ap.unvan,
      ap.maksimum_kapasite,
      calculate_akademik_personel_yuk(ap.personel_id) as mevcut_yuk
    FROM public.akademik_personel ap
    WHERE ap.aktif_mi = true
    AND calculate_akademik_personel_yuk(ap.personel_id) < ap.maksimum_kapasite
  ),
  uzmanlik_uyumlari AS (
    SELECT 
      pv.personel_id,
      pv.ad_soyad,
      pv.unvan,
      pv.mevcut_yuk,
      pv.maksimum_kapasite,
      CASE 
        WHEN p_tez_konusu IS NOT NULL THEN
          COALESCE(
            (SELECT COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM public.akademik_personel_uzmanlik WHERE personel_id = pv.personel_id), 0)
             FROM public.akademik_personel_uzmanlik
             WHERE personel_id = pv.personel_id
             AND LOWER(uzmanlik_alani) LIKE '%' || LOWER(p_tez_konusu) || '%'),
            0
          )
        ELSE 0
      END as uzmanlik_uyumu
    FROM personel_verileri pv
  )
  SELECT 
    uu.personel_id,
    uu.ad_soyad,
    uu.unvan,
    uu.mevcut_yuk,
    uu.maksimum_kapasite,
    (uu.maksimum_kapasite - uu.mevcut_yuk) as kalan_kapasite,
    ROUND((uu.mevcut_yuk::NUMERIC / NULLIF(uu.maksimum_kapasite, 0)) * 100, 2) as kapasite_kullanim_yuzdesi,
    ROUND(uu.uzmanlik_uyumu * 100, 2) as uzmanlik_uyumu_puani,
    ROUND(
      (((uu.maksimum_kapasite - uu.mevcut_yuk)::NUMERIC / NULLIF(uu.maksimum_kapasite, 0)) * 100 * 0.40) +
      ((100 - ((uu.mevcut_yuk::NUMERIC / NULLIF(uu.maksimum_kapasite, 0)) * 100)) * 0.40) +
      (uu.uzmanlik_uyumu * 100 * 0.20),
      2
    ) as oncelik_puani,
    CASE 
      WHEN (uu.maksimum_kapasite - uu.mevcut_yuk) <= 0 THEN 'Kapasite dolu, atama yapılamaz'
      WHEN (uu.maksimum_kapasite - uu.mevcut_yuk) <= 2 THEN 'Kapasiteye yakın, dikkatli atama yapılmalı'
      ELSE 'Rahatça atama yapılabilir'
    END as oneriler
  FROM uzmanlik_uyumlari uu
  ORDER BY oncelik_puani DESC;
END;
$$ LANGUAGE plpgsql;

-- Danışman dağılımındaki adaletsizliği göster
CREATE OR REPLACE FUNCTION get_load_imbalance_report()
RETURNS JSONB AS $$
DECLARE
  v_rapor JSONB;
  v_ortalama_yuzde NUMERIC;
  v_max_yuzde NUMERIC;
  v_min_yuzde NUMERIC;
  v_standart_sapma NUMERIC;
BEGIN
  -- Ortalama, max, min kapasite kullanım yüzdelerini hesapla
  SELECT 
    ROUND(AVG(kapasite_kullanim_yuzdesi), 2),
    ROUND(MAX(kapasite_kullanim_yuzdesi), 2),
    ROUND(MIN(kapasite_kullanim_yuzdesi), 2),
    ROUND(STDDEV(kapasite_kullanim_yuzdesi), 2)
  INTO v_ortalama_yuzde, v_max_yuzde, v_min_yuzde, v_standart_sapma
  FROM public.akademik_personel_yuk_view;
  
  -- Dengesizlik raporu oluştur
  SELECT json_build_object(
    'ortalama_kapasite_kullanim_yuzdesi', v_ortalama_yuzde,
    'maksimum_kapasite_kullanim_yuzdesi', v_max_yuzde,
    'minimum_kapasite_kullanim_yuzdesi', v_min_yuzde,
    'standart_sapma', v_standart_sapma,
    'dengesizlik_seviyesi', CASE
      WHEN v_standart_sapma >= 30 THEN 'Yuksek - Ciddi Dengesizlik Var'
      WHEN v_standart_sapma >= 20 THEN 'Orta - Orta Seviye Dengesizlik'
      WHEN v_standart_sapma >= 10 THEN 'Dusuk - Hafif Dengesizlik'
      ELSE 'Dengeli - İyi Dağılım'
    END,
    'en_yuklu_danismanlar', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          personel_id,
          ad || ' ' || soyad as ad_soyad,
          unvan,
          mevcut_yuk,
          maksimum_kapasite,
          kapasite_kullanim_yuzdesi
        FROM public.akademik_personel_yuk_view
        WHERE kapasite_kullanim_yuzdesi >= 100
        ORDER BY kapasite_kullanim_yuzdesi DESC
        LIMIT 5
      ) t
    ),
    'en_az_yuklu_danismanlar', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          personel_id,
          ad || ' ' || soyad as ad_soyad,
          unvan,
          mevcut_yuk,
          maksimum_kapasite,
          kapasite_kullanim_yuzdesi
        FROM public.akademik_personel_yuk_view
        WHERE kapasite_kullanim_yuzdesi < 50
        ORDER BY kapasite_kullanim_yuzdesi ASC
        LIMIT 5
      ) t
    ),
    'oneriler', CASE
      WHEN v_standart_sapma >= 30 THEN 'Yüksek yüklü danışmanlardan öğrenci transferi yapılmalı. Yeni atamalar düşük yüklü danışmanlara yapılmalı.'
      WHEN v_standart_sapma >= 20 THEN 'Yük dağılımı optimize edilmeli. Yeni atamalar dengeli yapılmalı.'
      ELSE 'Yük dağılımı dengeli görünüyor.'
    END
  ) INTO v_rapor;
  
  RETURN v_rapor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. SESSIZ OLUM RISKI (ATTRITION RADAR) FUNCTION'LARI
-- ============================================

-- Hayalet öğrenciler (6+ ay login yok)
CREATE OR REPLACE FUNCTION get_hayalet_ogrenciler(p_limit INT DEFAULT 50)
RETURNS TABLE (
  ogrenci_id UUID,
  kayit_tarihi DATE,
  program_adi TEXT,
  program_kodu TEXT,
  mevcut_yariyil INT,
  son_login TIMESTAMP WITH TIME ZONE,
  login_olmayan_gun_sayisi INT,
  risk_seviyesi TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.ogrenci_id,
    o.kayit_tarihi,
    pt.program_adi,
    pt.program_kodu,
    public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) as mevcut_yariyil,
    osl.son_login,
    (CURRENT_DATE - COALESCE(osl.son_login::DATE, o.kayit_tarihi))::INT as login_olmayan_gun_sayisi,
    CASE
      WHEN osl.son_login IS NULL OR osl.son_login < CURRENT_DATE - INTERVAL '12 months' THEN 'Kritik'
      WHEN osl.son_login < CURRENT_DATE - INTERVAL '9 months' THEN 'Yuksek'
      WHEN osl.son_login < CURRENT_DATE - INTERVAL '6 months' THEN 'Orta'
      ELSE 'Dusuk'
    END as risk_seviyesi
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  LEFT JOIN public.ogrenci_son_login osl ON o.ogrenci_id = osl.ogrenci_id
  WHERE o.soft_delete = false
  AND (osl.son_login IS NULL OR osl.son_login < CURRENT_DATE - INTERVAL '6 months')
  ORDER BY 
    CASE
      WHEN osl.son_login IS NULL THEN 0
      ELSE (CURRENT_DATE - osl.son_login::DATE)::INT
    END DESC,
    o.kayit_tarihi ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Riskli doktora öğrencileri (risk skoru 70+)
CREATE OR REPLACE FUNCTION get_riskli_doktora_ogrencileri(p_limit INT DEFAULT 50)
RETURNS TABLE (
  ogrenci_id UUID,
  kayit_tarihi DATE,
  mevcut_yariyil INT,
  maksimum_yariyil INT,
  risk_skoru INT,
  risk_seviyesi TEXT,
  risk_faktorleri JSONB,
  aciliyet_puani NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.ogrenci_id,
    o.kayit_tarihi,
    public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) as mevcut_yariyil,
    pt.maksimum_sure_yariyil,
    COALESCE(ora.risk_skoru, 0) as risk_skoru,
    COALESCE(ora.risk_seviyesi, 'Dusuk') as risk_seviyesi,
    COALESCE(ora.risk_faktorleri, '{}'::JSONB) as risk_faktorleri,
    -- Aciliyet puanı: Risk skoru + süre aşımı yakınlığı
    (COALESCE(ora.risk_skoru, 0)::NUMERIC + 
     CASE 
       WHEN public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) >= pt.maksimum_sure_yariyil - 2 THEN 20
       WHEN public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) >= pt.maksimum_sure_yariyil - 4 THEN 10
       ELSE 0
     END)::NUMERIC as aciliyet_puani
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  LEFT JOIN LATERAL (
    SELECT risk_skoru, risk_seviyesi, risk_faktorleri
    FROM public.ogrenci_risk_analizi
    WHERE ogrenci_id = o.ogrenci_id
    ORDER BY hesaplama_tarihi DESC
    LIMIT 1
  ) ora ON true
  WHERE o.soft_delete = false
  AND pt.program_kodu = 'Doktora'
  AND COALESCE(ora.risk_skoru, 0) >= 70
  ORDER BY aciliyet_puani DESC, ora.risk_skoru DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Kırmızı Alarm listesi (aciliyet sırasına göre)
CREATE OR REPLACE FUNCTION get_attrition_radar(p_limit INT DEFAULT 50)
RETURNS TABLE (
  ogrenci_id UUID,
  kayit_tarihi DATE,
  program_adi TEXT,
  program_kodu TEXT,
  mevcut_yariyil INT,
  maksimum_yariyil INT,
  risk_skoru INT,
  risk_seviyesi TEXT,
  hayalet_ogrenci_mi BOOLEAN,
  son_login TIMESTAMP WITH TIME ZONE,
  login_olmayan_gun_sayisi INT,
  aciliyet_puani NUMERIC,
  aciliyet_seviyesi TEXT,
  oncelik_sirasi INT
) AS $$
BEGIN
  RETURN QUERY
  WITH riskli_ogrenciler AS (
    SELECT 
      o.ogrenci_id,
      o.kayit_tarihi,
      pt.program_adi,
      pt.program_kodu,
      public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE) as mevcut_yariyil,
      pt.maksimum_sure_yariyil,
      COALESCE(ora.risk_skoru, hesapla_risk_skoru(o.ogrenci_id)) as risk_skoru,
      COALESCE(ora.risk_seviyesi, 
        CASE 
          WHEN COALESCE(ora.risk_skoru, hesapla_risk_skoru(o.ogrenci_id)) >= 85 THEN 'Kritik'
          WHEN COALESCE(ora.risk_skoru, hesapla_risk_skoru(o.ogrenci_id)) >= 70 THEN 'Yuksek'
          ELSE 'Orta'
        END
      ) as risk_seviyesi,
      COALESCE(ora.hayalet_ogrenci_mi, 
        (osl.son_login IS NULL OR osl.son_login < CURRENT_DATE - INTERVAL '6 months')
      ) as hayalet_ogrenci_mi,
      osl.son_login,
      (CURRENT_DATE - COALESCE(osl.son_login::DATE, o.kayit_tarihi))::INT as login_olmayan_gun_sayisi
    FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    LEFT JOIN public.ogrenci_son_login osl ON o.ogrenci_id = osl.ogrenci_id
    LEFT JOIN LATERAL (
      SELECT risk_skoru, risk_seviyesi, hayalet_ogrenci_mi
      FROM public.ogrenci_risk_analizi
      WHERE ogrenci_id = o.ogrenci_id
      ORDER BY hesaplama_tarihi DESC
      LIMIT 1
    ) ora ON true
    WHERE o.soft_delete = false
    AND (
      COALESCE(ora.risk_skoru, hesapla_risk_skoru(o.ogrenci_id)) >= 70
      OR (osl.son_login IS NULL OR osl.son_login < CURRENT_DATE - INTERVAL '6 months')
    )
  )
  SELECT 
    ro.ogrenci_id,
    ro.kayit_tarihi,
    ro.program_adi,
    ro.program_kodu,
    ro.mevcut_yariyil,
    ro.maksimum_sure_yariyil,
    ro.risk_skoru,
    ro.risk_seviyesi,
    ro.hayalet_ogrenci_mi,
    ro.son_login,
    ro.login_olmayan_gun_sayisi,
    -- Aciliyet puanı: Risk skoru + hayalet öğrenci bonusu + süre aşımı yakınlığı
    (ro.risk_skoru::NUMERIC + 
     CASE WHEN ro.hayalet_ogrenci_mi THEN 30 ELSE 0 END +
     CASE 
       WHEN ro.mevcut_yariyil >= ro.maksimum_sure_yariyil THEN 50
       WHEN ro.mevcut_yariyil >= ro.maksimum_sure_yariyil - 2 THEN 30
       WHEN ro.mevcut_yariyil >= ro.maksimum_sure_yariyil - 4 THEN 15
       ELSE 0
     END +
     CASE
       WHEN ro.login_olmayan_gun_sayisi >= 365 THEN 20
       WHEN ro.login_olmayan_gun_sayisi >= 270 THEN 15
       WHEN ro.login_olmayan_gun_sayisi >= 180 THEN 10
       ELSE 0
     END)::NUMERIC as aciliyet_puani,
    CASE
      WHEN (ro.risk_skoru::NUMERIC + 
            CASE WHEN ro.hayalet_ogrenci_mi THEN 30 ELSE 0 END +
            CASE WHEN ro.mevcut_yariyil >= ro.maksimum_sure_yariyil THEN 50 ELSE 0 END) >= 100 THEN 'Kritik'
      WHEN (ro.risk_skoru::NUMERIC + 
            CASE WHEN ro.hayalet_ogrenci_mi THEN 30 ELSE 0 END) >= 80 THEN 'Yuksek'
      ELSE 'Orta'
    END as aciliyet_seviyesi,
    ROW_NUMBER() OVER (
      ORDER BY 
        (ro.risk_skoru::NUMERIC + 
         CASE WHEN ro.hayalet_ogrenci_mi THEN 30 ELSE 0 END +
         CASE WHEN ro.mevcut_yariyil >= ro.maksimum_sure_yariyil THEN 50 ELSE 0 END) DESC,
        ro.login_olmayan_gun_sayisi DESC,
        ro.risk_skoru DESC
    )::INT as oncelik_sirasi
  FROM riskli_ogrenciler ro
  ORDER BY aciliyet_puani DESC, ro.login_olmayan_gun_sayisi DESC, ro.risk_skoru DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION calculate_yariyil IS 'Öğrencinin kayıt tarihinden itibaren geçen yarıyıl sayısını hesaplar';
COMMENT ON FUNCTION hesapla_risk_skoru IS 'Öğrenci için risk skoru hesaplar (0-100 arası) - Detaylı implementasyon';
COMMENT ON FUNCTION calculate_akademik_personel_yuk IS 'Akademik personel yükünü hesaplar';
COMMENT ON FUNCTION calculate_mevcut_yariyil IS 'Mevcut yarıyılı hesaplayıp günceller';
COMMENT ON FUNCTION batch_calculate_risk_skoru IS 'Tüm öğrenciler için toplu risk skoru hesaplama';
COMMENT ON FUNCTION simulate_future_capacity IS 'Gelecek yıl X kadar öğrenci alırsam ne olur? - What-If simülasyon hesaplama';
COMMENT ON FUNCTION create_simulation_scenario IS 'Simülasyon senaryosu oluşturur ve simulasyon_senaryolari tablosuna kaydeder';
COMMENT ON FUNCTION suggest_danisman IS 'Yeni öğrenci ataması için en uygun danışmanı önerir (yük, kapasite, uzmanlık bazlı)';
COMMENT ON FUNCTION get_load_imbalance_report IS 'Danışman dağılımındaki adaletsizliği gösterir (X Hoca %120 dolu, Y Hoca %10 dolu)';
COMMENT ON FUNCTION get_hayalet_ogrenciler IS '6+ ay login olmayan öğrencileri listeler (hayalet öğrenci tespiti)';
COMMENT ON FUNCTION get_riskli_doktora_ogrencileri IS 'Risk skoru 70+ olan doktora öğrencilerini listeler (risk faktörlerine göre sıralı)';
COMMENT ON FUNCTION get_attrition_radar IS 'Kırmızı Alarm listesi - Aciliyet sırasına göre riskli öğrenciler (hayalet + riskli doktora)';
-- ============================================
-- KDS RİSK HESAPLAMA FONKSİYONU
-- Formül: (Kalan Süre Oranı * 0.6) + (Aşama Tıkanıklığı * 0.3) + (Toplam TS * 5)
-- ============================================
CREATE OR REPLACE FUNCTION fn_hesapla_ogrenci_riski(p_ogrenci_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_program_kodu TEXT;
  v_maksimum_yariyil INT;
  v_mevcut_yariyil INT;
  v_kalan_sure_orani NUMERIC;
  v_asama_tikanikligi NUMERIC;
  v_toplam_ts INT;
  v_risk_skoru NUMERIC;
  v_h_notu_sayisi INT; -- H (Hak Dondurma) notu sayısı
  v_etkili_yariyil INT; -- H notları düşüldükten sonraki etkili yarıyıl
  v_kayit_tarihi DATE;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT 
    o.kayit_tarihi,
    pt.program_kodu,
    pt.maksimum_sure_yariyil,
    public.calculate_yariyil(o.kayit_tarihi, CURRENT_DATE::DATE)
  INTO 
    v_kayit_tarihi,
    v_program_kodu,
    v_maksimum_yariyil,
    v_mevcut_yariyil
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = p_ogrenci_id
  AND o.soft_delete = false;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- H (Hak Dondurma) notu sayısını hesapla (farklı yarıyıllardaki H notlarını say)
  SELECT COUNT(DISTINCT yariyil) INTO v_h_notu_sayisi
  FROM public.ogrenci_dersleri
  WHERE ogrenci_id = p_ogrenci_id
  AND not_kodu = 'H';
  
  -- Etkili yarıyıl = Mevcut yarıyıl - H notu sayısı (H notları azami süre hesabından düşülür)
  v_etkili_yariyil := GREATEST(0, v_mevcut_yariyil - v_h_notu_sayisi);
  
  -- 1. Kalan Süre Oranı (0-100 arası, yüksek = riskli)
  -- Kalan süre azaldıkça risk artar
  IF v_maksimum_yariyil > 0 THEN
    v_kalan_sure_orani := GREATEST(0, LEAST(100, ((v_maksimum_yariyil - v_etkili_yariyil)::NUMERIC / v_maksimum_yariyil::NUMERIC) * 100));
    -- Tersine çevir: Kalan süre azaldıkça risk artar
    v_kalan_sure_orani := 100 - v_kalan_sure_orani;
  ELSE
    v_kalan_sure_orani := 0;
  END IF;
  
  -- 2. Aşama Tıkanıklığı (0-100 arası)
  -- Öğrencinin hangi aşamada takıldığını hesapla
  DECLARE
    v_mevcut_asinama TEXT;
    v_ders_tamamlandi_mi BOOLEAN;
    v_tamamlanan_ders_sayisi INT;
  BEGIN
    -- Mevcut aşama bilgisini al
    SELECT 
      mevcut_asinama,
      ders_tamamlandi_mi,
      tamamlanan_ders_sayisi
    INTO v_mevcut_asinama, v_ders_tamamlandi_mi, v_tamamlanan_ders_sayisi
    FROM public.ogrenci_akademik_durum
    WHERE ogrenci_id = p_ogrenci_id;
    
    -- Aşama tıkanıklığı hesaplama
    IF v_program_kodu = 'Doktora' THEN
      -- Doktora: Yeterlik sınavı, Tez önerisi, TİK toplantıları kontrolü
      IF v_mevcut_asinama = 'Ders' AND v_etkili_yariyil >= 4 THEN
        v_asama_tikanikligi := 80; -- Ders aşamasında takılmış
      ELSIF v_mevcut_asinama = 'Yeterlik' AND v_etkili_yariyil >= 6 THEN
        v_asama_tikanikligi := 90; -- Yeterlik aşamasında takılmış
      ELSIF v_mevcut_asinama = 'Tez_Onersi' AND v_etkili_yariyil >= 8 THEN
        v_asama_tikanikligi := 85; -- Tez önerisi aşamasında takılmış
      ELSE
        v_asama_tikanikligi := 0;
      END IF;
    ELSIF v_program_kodu = 'Tezli_YL' THEN
      -- Tezli YL: Ders tamamlama kontrolü
      IF v_ders_tamamlandi_mi = false AND v_etkili_yariyil >= 4 THEN
        v_asama_tikanikligi := 100; -- Ders tamamlama süresi aşımı
      ELSIF v_ders_tamamlandi_mi = false AND v_etkili_yariyil = 3 THEN
        v_asama_tikanikligi := 70; -- Ders tamamlama süresine yakın
      ELSE
        v_asama_tikanikligi := 0;
      END IF;
    ELSIF v_program_kodu IN ('Tezsiz_YL_IO', 'Tezsiz_YL_Uzaktan') THEN
      -- Tezsiz YL: Ders sayısı kontrolü
      IF v_tamamlanan_ders_sayisi < 10 AND v_etkili_yariyil >= 3 THEN
        v_asama_tikanikligi := 100; -- Ders tamamlama süresi aşımı
      ELSIF v_tamamlanan_ders_sayisi < 10 AND v_etkili_yariyil = 2 THEN
        v_asama_tikanikligi := 60; -- Ders tamamlama süresine yakın
      ELSE
        v_asama_tikanikligi := 0;
      END IF;
    ELSE
      v_asama_tikanikligi := 0;
    END IF;
  END;
  
  -- 3. Toplam TS (Tekrar Sayısı) hesaplama
  SELECT COALESCE(SUM(ts - 1), 0) INTO v_toplam_ts
  FROM public.ogrenci_dersleri
  WHERE ogrenci_id = p_ogrenci_id
  AND ts > 1; -- Sadece tekrar alınan dersler (ts > 1)
  
  -- Risk skoru hesaplama: (Kalan Süre Oranı * 0.6) + (Aşama Tıkanıklığı * 0.3) + (Toplam TS * 5)
  v_risk_skoru := (v_kalan_sure_orani * 0.6) + (v_asama_tikanikligi * 0.3) + (v_toplam_ts * 5);
  
  -- Hayalet Takibi: son_login 180 günü geçmişse otomatik +30 puan ekle
  DECLARE
    v_son_login TIMESTAMP WITH TIME ZONE;
    v_gun_farki INT;
  BEGIN
    -- Öğrencinin son giriş tarihini al
    SELECT son_login INTO v_son_login
    FROM public.ogrenci
    WHERE ogrenci_id = p_ogrenci_id;
    
    -- Son giriş tarihi yoksa veya 180 günü geçmişse hayalet öğrenci
    IF v_son_login IS NULL THEN
      v_risk_skoru := v_risk_skoru + 30; -- Hiç giriş yapmamışsa +30 puan
    ELSE
      v_gun_farki := (CURRENT_DATE - v_son_login::DATE)::INT;
      IF v_gun_farki > 180 THEN
        v_risk_skoru := v_risk_skoru + 30; -- 180 günü geçmişse +30 puan
      END IF;
    END IF;
  END;
  
  -- Risk skorunu 0-100 arasına sınırla
  v_risk_skoru := GREATEST(0, LEAST(100, v_risk_skoru));
  
  RETURN ROUND(v_risk_skoru, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- H KODU (HAK DONDURMA) MANTIĞI
-- H notu içeren dönemleri azami süre hesabından otomatik düşen fonksiyon
-- ============================================
CREATE OR REPLACE FUNCTION fn_hesapla_etkili_yariyil(p_ogrenci_id UUID)
RETURNS INT AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_h_notu_sayisi INT;
  v_etkili_yariyil INT;
BEGIN
  -- Mevcut yarıyılı hesapla
  SELECT public.calculate_yariyil(kayit_tarihi, CURRENT_DATE::DATE) INTO v_mevcut_yariyil
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- H (Hak Dondurma) notu sayısını hesapla (farklı yarıyıllardaki H notlarını say)
  SELECT COUNT(DISTINCT yariyil) INTO v_h_notu_sayisi
  FROM public.ogrenci_dersleri
  WHERE ogrenci_id = p_ogrenci_id
  AND not_kodu = 'H';
  
  -- Etkili yarıyıl = Mevcut yarıyıl - H notu sayısı
  -- H notları azami süre hesabından düşülür
  v_etkili_yariyil := GREATEST(0, v_mevcut_yariyil - v_h_notu_sayisi);
  
  RETURN v_etkili_yariyil;
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW public.ogrenci_mevcut_durum_view IS 'Öğrenci mevcut durum bilgileri (yarıyıl, risk skoru, akademik durum)';
COMMENT ON VIEW public.akademik_personel_yuk_view IS 'Akademik personel yük bilgileri';
COMMENT ON VIEW public.ogrenci_risk_ozet_view IS 'Öğrenci risk özeti (en son risk analizi)';
COMMENT ON VIEW public.danisman_yuk_detay_view IS 'Danışman yük detayları';
COMMENT ON FUNCTION fn_hesapla_ogrenci_riski IS 'KDS Risk Hesaplama Fonksiyonu: (Kalan Süre Oranı * 0.6) + (Aşama Tıkanıklığı * 0.3) + (Toplam TS * 5) + Hayalet Öğrenci (+30 puan)';
COMMENT ON FUNCTION fn_hesapla_etkili_yariyil IS 'H (Hak Dondurma) notu içeren dönemleri azami süre hesabından otomatik düşen fonksiyon';

-- ============================================
-- SEMİNER DARBOĞAZ KONTROLÜ
-- 4. yarıyılda ve seminer 'B' değilse ACİL_EYLEM statüsü
-- ============================================

-- View: Öğrenci Ders Aşaması Kontrolü
CREATE OR REPLACE VIEW public.ogrenci_ders_asamasi_view AS
SELECT 
  o.ogrenci_id,
  o.ad,
  o.soyad,
  pt.program_kodu,
  oad.mevcut_yariyil,
  oad.ders_tamamlandi_mi,
  oad.tamamlanan_ders_sayisi,
  -- Ders sayısı (başarılı dersler)
  (SELECT COUNT(DISTINCT od.ders_kodu)
   FROM public.ogrenci_dersleri od
   WHERE od.ogrenci_id = o.ogrenci_id
   AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
   AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
  ) as basarili_ders_sayisi,
  -- Toplam AKTS (başarılı dersler)
  (SELECT COALESCE(SUM(akts), 0)
   FROM public.ogrenci_dersleri od
   WHERE od.ogrenci_id = o.ogrenci_id
   AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
   AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
  ) as toplam_akts,
  -- Seminer dersi kontrolü
  (SELECT od.ders_kodu
   FROM public.ogrenci_dersleri od
   JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
   WHERE od.ogrenci_id = o.ogrenci_id
   AND dk.ders_turu = 'Seminer'
   AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
   AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
   LIMIT 1
  ) as seminer_ders_kodu,
  (SELECT not_kodu
   FROM public.ogrenci_dersleri od
   JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
   WHERE od.ogrenci_id = o.ogrenci_id
   AND dk.ders_turu = 'Seminer'
   AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
   ORDER BY od.yariyil DESC
   LIMIT 1
  ) as seminer_not_kodu,
  -- Ders aşaması tamamlandı mı? (7 ders + 60 AKTS + Seminer)
  CASE 
    WHEN (SELECT COUNT(DISTINCT od.ders_kodu)
          FROM public.ogrenci_dersleri od
          WHERE od.ogrenci_id = o.ogrenci_id
          AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
          AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                       WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
         ) >= 7
    AND (SELECT COALESCE(SUM(akts), 0)
         FROM public.ogrenci_dersleri od
         WHERE od.ogrenci_id = o.ogrenci_id
         AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
         AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                      WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
        ) >= 60
    AND EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
      AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
      AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                   WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
    )
    THEN true
    ELSE false
  END as ders_asamasi_tamamlandi
FROM public.ogrenci o
JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
WHERE o.soft_delete = false;

-- View: Seminer Darbogaz Kontrolü
-- Eski view'i drop et (eğer varsa)
DROP VIEW IF EXISTS public.ogrenci_seminer_darboğaz_view CASCADE;
CREATE OR REPLACE VIEW public.ogrenci_seminer_darbogaz_view AS
SELECT 
  o.ogrenci_id,
  o.ad,
  o.soyad,
  pt.program_kodu,
  oad.mevcut_yariyil,
  -- Seminer durumu
  CASE 
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
    ) THEN 'seminer_yok'
    WHEN EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
      AND od.not_kodu NOT IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
      AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                   WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
    ) THEN 'seminer_basarisiz'
    WHEN EXISTS (
      SELECT 1
      FROM public.ogrenci_ders_asamasi_view odav
      WHERE odav.ogrenci_id = o.ogrenci_id
      AND odav.ders_asamasi_tamamlandi = false
      AND odav.basarili_ders_sayisi >= 7
      AND odav.toplam_akts >= 60
      AND NOT EXISTS (
        SELECT 1
        FROM public.ogrenci_dersleri od
        JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
        WHERE od.ogrenci_id = o.ogrenci_id
        AND dk.ders_turu = 'Seminer'
        AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
        AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                     WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
      )
    ) THEN 'seminer_eksik'
    ELSE 'seminer_tamam'
  END as seminer_durumu,
  -- Seminer not kodu
  (SELECT not_kodu
   FROM public.ogrenci_dersleri od
   JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
   WHERE od.ogrenci_id = o.ogrenci_id
   AND dk.ders_turu = 'Seminer'
   AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
   ORDER BY od.yariyil DESC
   LIMIT 1
  ) as seminer_not_kodu,
  -- Kritik darboğaz mı?
  CASE 
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
    ) THEN true
    WHEN EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
      AND od.not_kodu NOT IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
      AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                   WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
    ) THEN true
    WHEN EXISTS (
      SELECT 1
      FROM public.ogrenci_ders_asamasi_view odav
      WHERE odav.ogrenci_id = o.ogrenci_id
      AND odav.ders_asamasi_tamamlandi = false
      AND odav.basarili_ders_sayisi >= 7
      AND odav.toplam_akts >= 60
      AND NOT EXISTS (
        SELECT 1
        FROM public.ogrenci_dersleri od
        JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
        WHERE od.ogrenci_id = o.ogrenci_id
        AND dk.ders_turu = 'Seminer'
        AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
        AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                     WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
      )
    ) THEN true
    ELSE false
  END as kritik_darbogaz_mi,
  -- ACİL_EYLEM Statüsü: 4. yarıyılda ve seminer 'B' değilse
  CASE 
    WHEN oad.mevcut_yariyil = 4 
    AND (
      NOT EXISTS (
        SELECT 1
        FROM public.ogrenci_dersleri od
        JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
        WHERE od.ogrenci_id = o.ogrenci_id
        AND dk.ders_turu = 'Seminer'
        AND od.not_kodu = 'B'
        AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                     WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
      )
    ) THEN true
    ELSE false
  END as acil_eylem_mi,
  -- Durum statüsü
  CASE 
    WHEN oad.mevcut_yariyil = 4 
    AND (
      NOT EXISTS (
        SELECT 1
        FROM public.ogrenci_dersleri od
        JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
        WHERE od.ogrenci_id = o.ogrenci_id
        AND dk.ders_turu = 'Seminer'
        AND od.not_kodu = 'B'
        AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                     WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
      )
    ) THEN 'ACİL_EYLEM'
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
    ) THEN 'UYARI'
    WHEN EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
      AND dk.ders_turu = 'Seminer'
      AND od.not_kodu NOT IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
      AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                   WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
    ) THEN 'UYARI'
    ELSE 'NORMAL'
  END as durum_statüsü
FROM public.ogrenci o
JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
WHERE o.soft_delete = false;

-- Function: Seminer Darbogaz Kontrolü
-- Eski function'ı drop et (eğer varsa)
DROP FUNCTION IF EXISTS fn_kontrol_seminer_darboğaz(UUID) CASCADE;
CREATE OR REPLACE FUNCTION fn_kontrol_seminer_darbogaz(p_ogrenci_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_view_record RECORD;
BEGIN
  SELECT * INTO v_view_record
  FROM public.ogrenci_seminer_darbogaz_view
  WHERE ogrenci_id = p_ogrenci_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'hata', 'Öğrenci bulunamadı',
      'ogrenci_id', p_ogrenci_id
    );
  END IF;
  
  v_result := jsonb_build_object(
    'ogrenci_id', v_view_record.ogrenci_id,
    'ad', v_view_record.ad,
    'soyad', v_view_record.soyad,
    'program_kodu', v_view_record.program_kodu,
    'mevcut_yariyil', v_view_record.mevcut_yariyil,
    'seminer_durumu', v_view_record.seminer_durumu,
    'seminer_not_kodu', v_view_record.seminer_not_kodu,
    'kritik_darbogaz_mi', v_view_record.kritik_darbogaz_mi,
    'acil_eylem_mi', v_view_record.acil_eylem_mi,
    'durum_statüsü', v_view_record.durum_statüsü
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Ders Aşaması Kontrolü
CREATE OR REPLACE FUNCTION fn_kontrol_ders_asamasi(p_ogrenci_id UUID)
RETURNS TABLE (
  ders_asamasi_tamamlandi BOOLEAN,
  ders_sayisi INT,
  toplam_akts INT,
  seminer_basarili BOOLEAN,
  seminer_ders_kodu TEXT,
  seminer_not_kodu TEXT
) AS $$
DECLARE
  v_basarili_not_kodlari TEXT[] := ARRAY['B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD'];
  v_ders_sayisi INT;
  v_toplam_akts INT;
  v_seminer_basarili BOOLEAN := FALSE;
  v_seminer_ders_kodu TEXT := NULL;
  v_seminer_not_kodu TEXT := NULL;
BEGIN
  -- Başarılı ders sayısını ve toplam AKTS'yi hesapla
  SELECT
    COUNT(DISTINCT od.ders_kodu),
    COALESCE(SUM(od.akts), 0)
  INTO
    v_ders_sayisi,
    v_toplam_akts
  FROM public.ogrenci_dersleri od
  WHERE od.ogrenci_id = p_ogrenci_id
    AND od.not_kodu = ANY(v_basarili_not_kodlari)
    AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                 WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu);

  -- Seminer dersinin başarılı olup olmadığını kontrol et
  SELECT
    TRUE,
    od.ders_kodu,
    od.not_kodu
  INTO
    v_seminer_basarili,
    v_seminer_ders_kodu,
    v_seminer_not_kodu
  FROM public.ogrenci_dersleri od
  JOIN public.dersler dk ON od.ders_kodu = dk.ders_kodu
  WHERE od.ogrenci_id = p_ogrenci_id
    AND dk.ders_turu = 'Seminer'
    AND od.not_kodu = ANY(v_basarili_not_kodlari)
    AND od.ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
                 WHERE od2.ogrenci_id = od.ogrenci_id AND od2.ders_kodu = od.ders_kodu)
  LIMIT 1;

  ders_asamasi_tamamlandi := (v_ders_sayisi >= 7) AND (v_toplam_akts >= 60) AND v_seminer_basarili;
  ders_sayisi := v_ders_sayisi;
  toplam_akts := v_toplam_akts;
  seminer_basarili := v_seminer_basarili;
  seminer_ders_kodu := v_seminer_ders_kodu;
  seminer_not_kodu := v_seminer_not_kodu;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW public.ogrenci_ders_asamasi_view IS 'Öğrenci ders aşaması kontrolü (7 ders + 60 AKTS + Seminer)';
COMMENT ON VIEW public.ogrenci_seminer_darbogaz_view IS 'Seminer darbogaz kontrolü - ACİL_EYLEM statüsü ile (4. yarıyılda ve seminer B değilse)';
COMMENT ON FUNCTION fn_kontrol_ders_asamasi IS 'Ders aşaması kontrolü yapar: (Ders Sayısı >= 7) AND (AKTS >= 60) AND (Seminer == B veya AA-DD arası)';
COMMENT ON FUNCTION fn_kontrol_seminer_darbogaz IS 'Seminer darbogaz kontrolü yapar ve JSONB formatında sonuç döndürür';

-- ============================================
-- TEZ ÖNERİSİ EK SÜRE HESAPLAMA FONKSİYONLARI
-- ============================================

-- Function: Tez Önerisi Ek Süre Hesaplama
CREATE OR REPLACE FUNCTION calculate_ek_sure_tez_onersi(
  p_ogrenci_id UUID,
  p_savunma_sonucu TEXT
)
RETURNS INT AS $$
DECLARE
  v_ek_sure_ay INT := 0;
BEGIN
  -- Savunma sonucuna göre ek süre hesapla
  CASE p_savunma_sonucu
    WHEN 'Revizyon_Gerekli' THEN
      v_ek_sure_ay := 3; -- Revizyon gerekli: +3 ay
    WHEN 'Red' THEN
      v_ek_sure_ay := 6; -- Red: +6 ay
    WHEN 'Onaylandi' THEN
      v_ek_sure_ay := 0; -- Onaylandı: ek süre yok
    ELSE
      v_ek_sure_ay := 0;
  END CASE;
  
  RETURN v_ek_sure_ay;
END;
$$ LANGUAGE plpgsql;

-- Function: Yeni Hedef Tarih Hesaplama
CREATE OR REPLACE FUNCTION calculate_yeni_hedef_tarih(
  p_ilk_savunma_tarihi DATE,
  p_savunma_sonucu TEXT
)
RETURNS DATE AS $$
DECLARE
  v_ek_sure_ay INT;
  v_yeni_hedef_tarih DATE;
BEGIN
  -- Ek süreyi hesapla
  v_ek_sure_ay := calculate_ek_sure_tez_onersi(NULL::UUID, p_savunma_sonucu);
  
  -- Yeni hedef tarihi hesapla
  IF v_ek_sure_ay > 0 AND p_ilk_savunma_tarihi IS NOT NULL THEN
    v_yeni_hedef_tarih := p_ilk_savunma_tarihi + (v_ek_sure_ay || ' months')::INTERVAL;
  ELSE
    v_yeni_hedef_tarih := NULL;
  END IF;
  
  RETURN v_yeni_hedef_tarih;
END;
$$ LANGUAGE plpgsql;

-- Function: Tez Önerisi Başarısız Durumunu İşle
CREATE OR REPLACE FUNCTION handle_tez_onersi_basarisiz(
  p_ogrenci_id UUID,
  p_savunma_sonucu TEXT,
  p_gerceklesme_tarihi DATE
)
RETURNS JSONB AS $$
DECLARE
  v_ek_sure_ay INT;
  v_yeni_hedef_tarih DATE;
  v_result JSONB;
BEGIN
  -- Ek süreyi hesapla
  v_ek_sure_ay := calculate_ek_sure_tez_onersi(p_ogrenci_id, p_savunma_sonucu);
  
  -- Yeni hedef tarihi hesapla
  v_yeni_hedef_tarih := calculate_yeni_hedef_tarih(p_gerceklesme_tarihi, p_savunma_sonucu);
  
  -- Milestone'u güncelle
  UPDATE public.akademik_milestone
  SET 
    ek_sure_ay = v_ek_sure_ay,
    yeni_hedef_tarih = v_yeni_hedef_tarih,
    hedef_tarih = COALESCE(v_yeni_hedef_tarih, hedef_tarih),
    durum = CASE 
      WHEN p_savunma_sonucu = 'Onaylandi' THEN 'Tamamlandi'
      WHEN p_savunma_sonucu IN ('Revizyon_Gerekli', 'Red') THEN 'Beklemede'
      ELSE durum
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE ogrenci_id = p_ogrenci_id
  AND milestone_turu = 'Tez_Onersi'
  AND durum != 'Tamamlandi';
  
  v_result := jsonb_build_object(
    'ogrenci_id', p_ogrenci_id,
    'savunma_sonucu', p_savunma_sonucu,
    'ek_sure_ay', v_ek_sure_ay,
    'yeni_hedef_tarih', v_yeni_hedef_tarih
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_ek_sure_tez_onersi IS 'Tez önerisi ek süre hesaplama (Revizyon: +3 ay, Red: +6 ay)';
COMMENT ON FUNCTION calculate_yeni_hedef_tarih IS 'Yeni hedef tarih hesaplama (ilk savunma tarihi + ek süre)';
COMMENT ON FUNCTION handle_tez_onersi_basarisiz IS 'Tez önerisi başarısız durumunu işler ve milestone günceller';

-- ============================================
-- TİK TOPLANTI FONKSİYONLARI
-- ============================================

-- Function: TİK Toplantı Tarihi Hesaplama
CREATE OR REPLACE FUNCTION hesapla_tik_toplanti_tarihi(
  p_tez_onersi_onay_tarihi DATE,
  p_topanti_sirasi INT
)
RETURNS DATE AS $$
DECLARE
  v_ilk_topanti_tarihi DATE;
  v_topanti_tarihi DATE;
BEGIN
  -- İlk toplantı tarihi: Tez önerisi onay tarihinden 6 ay sonra
  v_ilk_topanti_tarihi := p_tez_onersi_onay_tarihi + INTERVAL '6 months';
  
  -- Toplantı sırasına göre tarih hesapla
  -- 1. toplantı: +0 ay, 2. toplantı: +6 ay, 3. toplantı: +12 ay, vb.
  v_topanti_tarihi := v_ilk_topanti_tarihi + ((p_topanti_sirasi - 1) * INTERVAL '6 months');
  
  RETURN v_topanti_tarihi;
END;
$$ LANGUAGE plpgsql;

-- Function: TİK Takvimi Oluşturma
CREATE OR REPLACE FUNCTION create_tik_toplanti_takvimi(
  p_ogrenci_id UUID,
  p_tez_onersi_onay_tarihi DATE,
  p_topanti_sayisi INT DEFAULT 10 -- 5 yıl için 10 toplantı
)
RETURNS void AS $$
DECLARE
  v_topanti_sirasi INT;
  v_topanti_tarihi DATE;
BEGIN
  -- Mevcut toplantıları kontrol et
  IF EXISTS (
    SELECT 1 FROM public.tik_toplantilari
    WHERE ogrenci_id = p_ogrenci_id
  ) THEN
    RAISE EXCEPTION 'Bu öğrenci için TİK takvimi zaten oluşturulmuş';
  END IF;
  
  -- Her toplantı için tarih hesapla ve kaydet
  FOR v_topanti_sirasi IN 1..p_topanti_sayisi LOOP
    v_topanti_tarihi := hesapla_tik_toplanti_tarihi(
      p_tez_onersi_onay_tarihi,
      v_topanti_sirasi
    );
    
    -- Toplantıyı kaydet
    INSERT INTO public.tik_toplantilari (
      ogrenci_id,
      toplanti_tarihi,
      katilim_durumu,
      rapor_verildi_mi,
      uyari_gonderildi_mi
    ) VALUES (
      p_ogrenci_id,
      v_topanti_tarihi,
      NULL, -- Henüz gerçekleşmedi
      false,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: TİK Bildirimlerini Kontrol Et (Periyodik)
CREATE OR REPLACE FUNCTION check_tik_notifications()
RETURNS void AS $$
DECLARE
  v_tik_record RECORD;
BEGIN
  -- 1 ay içinde TİK toplantısı olan öğrenciler
  FOR v_tik_record IN
    SELECT 
      t.topanti_id,
      t.ogrenci_id,
      t.topanti_tarihi,
      o.ad,
      o.soyad
    FROM public.tik_toplantilari t
    JOIN public.ogrenci o ON t.ogrenci_id = o.ogrenci_id
    WHERE t.topanti_tarihi BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '1 month')
    AND t.uyari_gonderildi_mi = false
    AND o.soft_delete = false
  LOOP
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'TIK_Uyari',
      v_tik_record.ogrenci_id,
      format('%s %s öğrencisi için TİK toplantısı yaklaşıyor. Toplantı tarihi: %s', 
        v_tik_record.ad, v_tik_record.soyad, v_tik_record.topanti_tarihi),
      'Yuksek'
    );
    
    -- Uyarı gönderildi olarak işaretle
    UPDATE public.tik_toplantilari
    SET uyari_gonderildi_mi = true,
        uyari_tarihi = CURRENT_DATE
    WHERE toplanti_id = v_tik_record.topanti_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: TİK Katılım Durumunu Kontrol Et
CREATE OR REPLACE FUNCTION check_tik_katilim_durumu(p_ogrenci_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_katilim_sayisi INT;
  v_katilmama_sayisi INT;
  v_son_katilim_durumu TEXT;
  v_result JSONB;
BEGIN
  -- Son 12 ayda üst üste 2 kez katılmama kontrolü
  SELECT COUNT(*) INTO v_katilmama_sayisi
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
  AND katilim_durumu IN ('Katilmadi', 'Raporlu')
  AND toplanti_tarihi >= (CURRENT_DATE - INTERVAL '12 months')
  ORDER BY toplanti_tarihi DESC
  LIMIT 2;
  
  -- Toplam katılım sayısı
  SELECT COUNT(*) INTO v_katilim_sayisi
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
  AND katilim_durumu = 'Katildi'
  AND toplanti_tarihi >= (CURRENT_DATE - INTERVAL '12 months');
  
  -- Son katılım durumu
  SELECT katilim_durumu INTO v_son_katilim_durumu
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
  ORDER BY toplanti_tarihi DESC
  LIMIT 1;
  
  v_result := jsonb_build_object(
    'ogrenci_id', p_ogrenci_id,
    'katilim_sayisi', v_katilim_sayisi,
    'katilmama_sayisi', v_katilmama_sayisi,
    'son_katilim_durumu', v_son_katilim_durumu,
    'ust_uste_2_kez_katilmama', (v_katilmama_sayisi >= 2)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hesapla_tik_toplanti_tarihi IS 'TİK toplantı tarihi hesaplama (tez önerisi onay tarihinden 6 ay sonra başlar)';
COMMENT ON FUNCTION create_tik_toplanti_takvimi IS 'TİK takvimi oluşturma (otomatik olarak 10 toplantı oluşturur)';
COMMENT ON FUNCTION check_tik_notifications IS 'TİK bildirimlerini kontrol et (periyodik görev için)';
COMMENT ON FUNCTION check_tik_katilim_durumu IS 'TİK katılım durumunu kontrol et (üst üste 2 kez katılmama kontrolü)';

-- ============================================
-- DURUM KONTROL FONKSİYONLARI
-- ============================================

-- Function: TİK Katılım Kontrolü ve Pasif Yapma
CREATE OR REPLACE FUNCTION check_tik_katilim_pasif(p_ogrenci_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_katilmama_sayisi INT;
  v_pasif_durum_id UUID;
BEGIN
  -- Son 12 ayda üst üste 2 kez katılmama kontrolü
  SELECT COUNT(*) INTO v_katilmama_sayisi
  FROM public.tik_toplantilari
  WHERE ogrenci_id = p_ogrenci_id
  AND katilim_durumu IN ('Katilmadi', 'Raporlu')
  AND toplanti_tarihi >= (CURRENT_DATE - INTERVAL '12 months')
  ORDER BY toplanti_tarihi DESC
  LIMIT 2;
  
  -- Üst üste 2 kez katılmamışsa
  IF v_katilmama_sayisi >= 2 THEN
    -- Pasif durum ID'sini al
    SELECT durum_id INTO v_pasif_durum_id
    FROM public.durum_turleri
    WHERE durum_kodu = 'Pasif';
    
    -- Durumu Pasif yap
    UPDATE public.ogrenci
    SET durum_id = v_pasif_durum_id
    WHERE ogrenci_id = p_ogrenci_id;
    
    -- Durum geçmişine kaydet
    INSERT INTO public.ogrenci_durum_gecmisi (
      ogrenci_id,
      eski_durum_id,
      yeni_durum_id,
      degisiklik_nedeni,
      otomatik_mi
    ) VALUES (
      p_ogrenci_id,
      (SELECT durum_id FROM public.ogrenci WHERE ogrenci_id = p_ogrenci_id),
      v_pasif_durum_id,
      'TİK toplantısına üst üste 2 kez katılmama',
      true
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function: Hayalet Öğrenci Kontrolü
CREATE OR REPLACE FUNCTION check_hayalet_ogrenci(p_ogrenci_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_son_login TIMESTAMP WITH TIME ZONE;
  v_gun_farki INT;
BEGIN
  -- Son giriş tarihini al
  SELECT son_login INTO v_son_login
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Son giriş tarihi yoksa veya 180 günü geçmişse hayalet öğrenci
  IF v_son_login IS NULL THEN
    RETURN true; -- Hiç giriş yapmamışsa hayalet öğrenci
  END IF;
  
  v_gun_farki := (CURRENT_DATE - v_son_login::DATE)::INT;
  
  IF v_gun_farki > 180 THEN
    RETURN true; -- 180 günü geçmişse hayalet öğrenci
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function: Ders Tamamlama Süresi Kontrolü
CREATE OR REPLACE FUNCTION check_ders_tamamlama_sure(p_ogrenci_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_program_kodu TEXT;
  v_mevcut_yariyil INT;
  v_ders_tamamlandi_mi BOOLEAN;
  v_pasif_durum_id UUID;
BEGIN
  -- Program türünü al
  SELECT pt.program_kodu INTO v_program_kodu
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = p_ogrenci_id;
  
  -- Sadece Tezli YL için
  IF v_program_kodu = 'Tezli_YL' THEN
    -- Mevcut yarıyıl ve ders tamamlama durumunu al
    SELECT 
      mevcut_yariyil,
      ders_tamamlandi_mi
    INTO v_mevcut_yariyil, v_ders_tamamlandi_mi
    FROM public.ogrenci_akademik_durum
    WHERE ogrenci_id = p_ogrenci_id;
    
    -- 4 yarıyıl geçmiş ve dersler tamamlanmamışsa
    IF v_mevcut_yariyil > 4 AND v_ders_tamamlandi_mi = false THEN
      -- Pasif durum ID'sini al
      SELECT durum_id INTO v_pasif_durum_id
      FROM public.durum_turleri
      WHERE durum_kodu = 'Pasif';
      
      -- Durumu Pasif yap
      UPDATE public.ogrenci
      SET durum_id = v_pasif_durum_id
      WHERE ogrenci_id = p_ogrenci_id;
      
      -- Durum geçmişine kaydet
      INSERT INTO public.ogrenci_durum_gecmisi (
        ogrenci_id,
        eski_durum_id,
        yeni_durum_id,
        degisiklik_nedeni,
        otomatik_mi
      ) VALUES (
        p_ogrenci_id,
        (SELECT durum_id FROM public.ogrenci WHERE ogrenci_id = p_ogrenci_id),
        v_pasif_durum_id,
        format('Ders tamamlama süresi aşıldı: %s yarıyıl', v_mevcut_yariyil),
        true
      );
      
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function: Milestone Gecikme Kontrolü
CREATE OR REPLACE FUNCTION check_milestone_gecikme(p_ogrenci_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_milestone_record RECORD;
  v_result JSONB := '[]'::JSONB;
  v_gecikmis_milestone JSONB[];
BEGIN
  -- Gecikmiş milestone'ları bul
  FOR v_milestone_record IN
    SELECT 
      milestone_id,
      milestone_turu,
      hedef_tarih,
      gerceklesme_tarihi,
      durum
    FROM public.akademik_milestone
    WHERE ogrenci_id = p_ogrenci_id
    AND durum = 'Beklemede'
    AND hedef_tarih < CURRENT_DATE
    AND gerceklesme_tarihi IS NULL
  LOOP
    v_gecikmis_milestone := array_append(
      v_gecikmis_milestone,
      jsonb_build_object(
        'milestone_id', v_milestone_record.milestone_id,
        'milestone_turu', v_milestone_record.milestone_turu,
        'hedef_tarih', v_milestone_record.hedef_tarih,
        'gecikme_gun_sayisi', (CURRENT_DATE - v_milestone_record.hedef_tarih)::INT
      )
    );
  END LOOP;
  
  v_result := array_to_json(v_gecikmis_milestone)::JSONB;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_tik_katilim_pasif IS 'TİK katılım kontrolü ve Pasif yapma (üst üste 2 kez katılmama)';
COMMENT ON FUNCTION check_hayalet_ogrenci IS 'Hayalet öğrenci tespiti (6+ ay login yok)';
COMMENT ON FUNCTION check_ders_tamamlama_sure IS 'Ders tamamlama süresi kontrolü (Tezli YL: 4 yarıyıl)';
COMMENT ON FUNCTION check_milestone_gecikme IS 'Milestone gecikme kontrolü ve JSONB formatında sonuç döndürür';

-- ============================================
-- DURUM GEÇİŞ FONKSİYONLARI
-- ============================================

-- Function: Öğrenci Durumunu Değiştir ve Logla
CREATE OR REPLACE FUNCTION change_ogrenci_durum(
  p_ogrenci_id UUID,
  p_yeni_durum_kodu TEXT,
  p_degisiklik_nedeni TEXT,
  p_otomatik_mi BOOLEAN DEFAULT false
)
RETURNS void AS $$
DECLARE
  v_eski_durum_id UUID;
  v_yeni_durum_id UUID;
  v_degistiren_kullanici_id UUID;
BEGIN
  -- Rol kontrolü (sadece Admin veya otomatik)
  IF NOT p_otomatik_mi THEN
    SELECT kullanici_id INTO v_degistiren_kullanici_id
    FROM public.kullanicilar
    WHERE kullanici_id = auth.uid()
    AND rol = 'Admin';
    
    IF v_degistiren_kullanici_id IS NULL THEN
      RAISE EXCEPTION 'Bu işlem için Admin yetkisi gereklidir';
    END IF;
  END IF;
  
  -- Eski durumu al
  SELECT durum_id INTO v_eski_durum_id
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Yeni durumu al
  SELECT durum_id INTO v_yeni_durum_id
  FROM public.durum_turleri
  WHERE durum_kodu = p_yeni_durum_kodu;
  
  IF v_yeni_durum_id IS NULL THEN
    RAISE EXCEPTION 'Durum türü bulunamadı: %', p_yeni_durum_kodu;
  END IF;
  
  -- Durumu güncelle
  UPDATE public.ogrenci
  SET durum_id = v_yeni_durum_id,
      updated_at = CURRENT_TIMESTAMP
  WHERE ogrenci_id = p_ogrenci_id;
  
  -- Durum geçmişine kaydet
  INSERT INTO public.ogrenci_durum_gecmisi (
    ogrenci_id,
    eski_durum_id,
    yeni_durum_id,
    degisiklik_nedeni,
    degistiren_kullanici_id,
    otomatik_mi
  ) VALUES (
    p_ogrenci_id,
    v_eski_durum_id,
    v_yeni_durum_id,
    p_degisiklik_nedeni,
    v_degistiren_kullanici_id,
    p_otomatik_mi
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Otomatik Pasif Yapma
CREATE OR REPLACE FUNCTION auto_change_durum_pasif(
  p_ogrenci_id UUID,
  p_degisiklik_nedeni TEXT
)
RETURNS void AS $$
BEGIN
  -- change_ogrenci_durum fonksiyonunu çağır
  PERFORM change_ogrenci_durum(
    p_ogrenci_id,
    'Pasif',
    p_degisiklik_nedeni,
    true -- Otomatik
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION change_ogrenci_durum IS 'Öğrenci durumunu değiştir ve logla (Admin yetkisi gereklidir)';
COMMENT ON FUNCTION auto_change_durum_pasif IS 'Otomatik Pasif yapma (sistem tarafından çağrılır)';

-- ============================================
-- AKADEMİK DURUM FONKSİYONLARI
-- ============================================

-- Function: Mevcut Aşamayı Güncelle
CREATE OR REPLACE FUNCTION update_mevcut_asinama(
  p_ogrenci_id UUID,
  p_yeni_asinama TEXT
)
RETURNS void AS $$
BEGIN
  -- Akademik durumu güncelle
  INSERT INTO public.ogrenci_akademik_durum (
    ogrenci_id,
    mevcut_asinama,
    guncelleme_tarihi
  )
  VALUES (
    p_ogrenci_id,
    p_yeni_asinama,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (ogrenci_id)
  DO UPDATE SET
    mevcut_asinama = p_yeni_asinama,
    guncelleme_tarihi = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function: Mevcut Yarıyılı Hesapla ve Güncelle
CREATE OR REPLACE FUNCTION calculate_mevcut_yariyil(p_ogrenci_id UUID)
RETURNS INT AS $$
DECLARE
  v_kayit_tarihi DATE;
  v_mevcut_yariyil INT;
BEGIN
  -- Kayıt tarihini al
  SELECT kayit_tarihi INTO v_kayit_tarihi
  FROM public.ogrenci
  WHERE ogrenci_id = p_ogrenci_id;
  
  IF v_kayit_tarihi IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Mevcut yarıyılı hesapla
  v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
  
  -- Akademik durumu güncelle
  INSERT INTO public.ogrenci_akademik_durum (
    ogrenci_id,
    mevcut_yariyil,
    guncelleme_tarihi
  )
  VALUES (
    p_ogrenci_id,
    v_mevcut_yariyil,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (ogrenci_id)
  DO UPDATE SET
    mevcut_yariyil = v_mevcut_yariyil,
    guncelleme_tarihi = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN v_mevcut_yariyil;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_mevcut_asinama IS 'Mevcut aşamayı günceller';
COMMENT ON FUNCTION calculate_mevcut_yariyil IS 'Mevcut yarıyılı hesaplayıp günceller';

-- ============================================
-- RİSK ANALİZİ FONKSİYONLARI
-- ============================================

-- Function: Risk Faktörlerini Getir
CREATE OR REPLACE FUNCTION get_risk_faktorleri(p_ogrenci_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_program_kodu TEXT;
  v_risk_faktorleri JSONB;
BEGIN
  -- Program türünü al
  SELECT pt.program_kodu INTO v_program_kodu
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = p_ogrenci_id;
  
  -- Risk faktörlerini hesapla (basitleştirilmiş)
  v_risk_faktorleri := jsonb_build_object(
    'program_kodu', v_program_kodu,
    'risk_skoru', fn_hesapla_ogrenci_riski(p_ogrenci_id),
    'hayalet_ogrenci_mi', check_hayalet_ogrenci(p_ogrenci_id),
    'tik_katilim_durumu', check_tik_katilim_durumu(p_ogrenci_id),
    'milestone_gecikme', check_milestone_gecikme(p_ogrenci_id)
  );
  
  RETURN v_risk_faktorleri;
END;
$$ LANGUAGE plpgsql;

-- Function: Risk Analizini Güncelle
CREATE OR REPLACE FUNCTION update_risk_analizi(p_ogrenci_id UUID)
RETURNS void AS $$
DECLARE
  v_risk_skoru NUMERIC;
  v_risk_seviyesi TEXT;
  v_hayalet_ogrenci_mi BOOLEAN;
  v_risk_faktorleri JSONB;
BEGIN
  -- Risk skorunu hesapla
  v_risk_skoru := fn_hesapla_ogrenci_riski(p_ogrenci_id);
  
  -- Risk seviyesini belirle
  IF v_risk_skoru >= 80 THEN
    v_risk_seviyesi := 'Kritik';
  ELSIF v_risk_skoru >= 60 THEN
    v_risk_seviyesi := 'Yuksek';
  ELSIF v_risk_skoru >= 40 THEN
    v_risk_seviyesi := 'Orta';
  ELSE
    v_risk_seviyesi := 'Dusuk';
  END IF;
  
  -- Hayalet öğrenci kontrolü
  v_hayalet_ogrenci_mi := check_hayalet_ogrenci(p_ogrenci_id);
  
  -- Risk faktörlerini al
  v_risk_faktorleri := get_risk_faktorleri(p_ogrenci_id);
  
  -- Risk analizini kaydet
  INSERT INTO public.ogrenci_risk_analizi (
    ogrenci_id,
    risk_skoru,
    risk_seviyesi,
    tehlike_turu,
    hayalet_ogrenci_mi,
    risk_faktorleri,
    hesaplama_tarihi
  )
  VALUES (
    p_ogrenci_id,
    v_risk_skoru::INT,
    v_risk_seviyesi,
    CASE 
      WHEN v_hayalet_ogrenci_mi THEN 'Hayalet_Ogrenci'
      WHEN v_risk_skoru >= 80 THEN 'Kritik_Risk'
      WHEN v_risk_skoru >= 60 THEN 'Yuksek_Risk'
      ELSE 'Normal'
    END,
    v_hayalet_ogrenci_mi,
    v_risk_faktorleri,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (ogrenci_id, hesaplama_tarihi)
  DO UPDATE SET
    risk_skoru = v_risk_skoru::INT,
    risk_seviyesi = v_risk_seviyesi,
    tehlike_turu = CASE 
      WHEN v_hayalet_ogrenci_mi THEN 'Hayalet_Ogrenci'
      WHEN v_risk_skoru >= 80 THEN 'Kritik_Risk'
      WHEN v_risk_skoru >= 60 THEN 'Yuksek_Risk'
      ELSE 'Normal'
    END,
    hayalet_ogrenci_mi = v_hayalet_ogrenci_mi,
    risk_faktorleri = v_risk_faktorleri;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_risk_faktorleri IS 'Risk faktörlerini getir (JSONB formatında)';
COMMENT ON FUNCTION update_risk_analizi IS 'Risk analizini güncelle';

-- ============================================
-- DANIŞMAN ATAMA FONKSİYONLARI
-- ============================================

-- Function: Danışman Kapasitesini Kontrol Et
CREATE OR REPLACE FUNCTION check_danisman_kapasite(p_danisman_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_danisman_record RECORD;
  v_mevcut_ogrenci_sayisi INT;
  v_result JSONB;
BEGIN
  -- Danışman bilgilerini al
  SELECT 
    personel_id,
    unvan,
    COALESCE(sert_limit, 
      CASE unvan
        WHEN 'Prof. Dr.' THEN 15
        WHEN 'Doç. Dr.' THEN 12
        WHEN 'Dr. Öğr. Üyesi' THEN 10
        WHEN 'Araş. Gör.' THEN 5
        WHEN 'Araş. Gör. Dr.' THEN 5
        ELSE 10
      END
    ) as sert_limit,
    COALESCE(yumusak_limit,
      CASE unvan
        WHEN 'Prof. Dr.' THEN 12
        WHEN 'Doç. Dr.' THEN 10
        WHEN 'Dr. Öğr. Üyesi' THEN 8
        WHEN 'Araş. Gör.' THEN 4
        WHEN 'Araş. Gör. Dr.' THEN 4
        ELSE 8
      END
    ) as yumusak_limit
  INTO v_danisman_record
  FROM public.akademik_personel
  WHERE personel_id = p_danisman_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('hata', 'Danışman bulunamadı');
  END IF;
  
  -- Mevcut öğrenci sayısını hesapla
  SELECT COUNT(*) INTO v_mevcut_ogrenci_sayisi
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = p_danisman_id
  AND o.soft_delete = false
  AND dt.durum_kodu IN ('Aktif', 'Dondurdu');
  
  v_result := jsonb_build_object(
    'danisman_id', p_danisman_id,
    'unvan', v_danisman_record.unvan,
    'mevcut_ogrenci_sayisi', v_mevcut_ogrenci_sayisi,
    'sert_limit', v_danisman_record.sert_limit,
    'yumusak_limit', v_danisman_record.yumusak_limit,
    'kapasite_dolu_mu', (v_mevcut_ogrenci_sayisi >= v_danisman_record.sert_limit),
    'yumusak_limit_asildi_mi', (v_mevcut_ogrenci_sayisi > v_danisman_record.yumusak_limit)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Danışman Yükünü Hesapla
CREATE OR REPLACE FUNCTION calculate_danisman_yuk(p_danisman_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_mevcut_ogrenci_sayisi INT;
  v_aktif_ogrenci_sayisi INT;
  v_dondurdu_ogrenci_sayisi INT;
  v_result JSONB;
BEGIN
  -- Mevcut öğrenci sayısını hesapla
  SELECT COUNT(*) INTO v_mevcut_ogrenci_sayisi
  FROM public.ogrenci
  WHERE danisman_id = p_danisman_id
  AND soft_delete = false;
  
  -- Aktif öğrenci sayısı
  SELECT COUNT(*) INTO v_aktif_ogrenci_sayisi
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = p_danisman_id
  AND o.soft_delete = false
  AND dt.durum_kodu = 'Aktif';
  
  -- Dondurdu öğrenci sayısı
  SELECT COUNT(*) INTO v_dondurdu_ogrenci_sayisi
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = p_danisman_id
  AND o.soft_delete = false
  AND dt.durum_kodu = 'Dondurdu';
  
  v_result := jsonb_build_object(
    'danisman_id', p_danisman_id,
    'mevcut_ogrenci_sayisi', v_mevcut_ogrenci_sayisi,
    'aktif_ogrenci_sayisi', v_aktif_ogrenci_sayisi,
    'dondurdu_ogrenci_sayisi', v_dondurdu_ogrenci_sayisi
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_danisman_kapasite IS 'Danışman kapasitesini kontrol et';
COMMENT ON FUNCTION calculate_danisman_yuk IS 'Danışman yükünü hesapla';

-- ============================================
-- AKTİVİTE FONKSİYONLARI
-- ============================================

-- Function: Kullanıcı Aktivitesini Logla
CREATE OR REPLACE FUNCTION log_kullanici_aktivitesi(
  p_kullanici_id UUID,
  p_ogrenci_id UUID,
  p_aktivite_turu TEXT,
  p_ip_adresi TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ek_bilgi JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_aktivite_id UUID;
BEGIN
  -- Aktivite kaydı oluştur
  INSERT INTO public.kullanici_aktiviteleri (
    kullanici_id,
    ogrenci_id,
    aktivite_turu,
    aktivite_tarihi,
    ip_adresi,
    user_agent,
    ek_bilgi
  )
  VALUES (
    p_kullanici_id,
    p_ogrenci_id,
    p_aktivite_turu,
    CURRENT_TIMESTAMP,
    p_ip_adresi,
    p_user_agent,
    p_ek_bilgi
  )
  RETURNING aktivite_id INTO v_aktivite_id;
  
  RETURN v_aktivite_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_kullanici_aktivitesi IS 'Kullanıcı aktivitesini logla';

-- ============================================
-- RAPORLAMA FONKSİYONLARI
-- ============================================

-- Function: Dashboard KPI'larını Getir
CREATE OR REPLACE FUNCTION get_dashboard_kpi()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_toplam_ogrenci INT;
  v_aktif_ogrenci INT;
  v_riskli_ogrenci INT;
  v_hayalet_ogrenci INT;
BEGIN
  -- Toplam öğrenci sayısı
  SELECT COUNT(*) INTO v_toplam_ogrenci
  FROM public.ogrenci
  WHERE soft_delete = false;
  
  -- Aktif öğrenci sayısı
  SELECT COUNT(*) INTO v_aktif_ogrenci
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.soft_delete = false
  AND dt.durum_kodu = 'Aktif';
  
  -- Riskli öğrenci sayısı (risk skoru >= 60)
  SELECT COUNT(*) INTO v_riskli_ogrenci
  FROM public.ogrenci_risk_analizi
  WHERE risk_skoru >= 60
  AND hesaplama_tarihi >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Hayalet öğrenci sayısı
  SELECT COUNT(*) INTO v_hayalet_ogrenci
  FROM public.ogrenci
  WHERE soft_delete = false
  AND (son_login IS NULL OR son_login < CURRENT_DATE - INTERVAL '180 days');
  
  v_result := jsonb_build_object(
    'toplam_ogrenci', v_toplam_ogrenci,
    'aktif_ogrenci', v_aktif_ogrenci,
    'riskli_ogrenci', v_riskli_ogrenci,
    'hayalet_ogrenci', v_hayalet_ogrenci
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Risk Analizi Raporu
CREATE OR REPLACE FUNCTION get_risk_analizi_raporu()
RETURNS TABLE (
  ogrenci_id UUID,
  ad TEXT,
  soyad TEXT,
  program_kodu TEXT,
  risk_skoru INT,
  risk_seviyesi TEXT,
  hayalet_ogrenci_mi BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.ogrenci_id,
    o.ad,
    o.soyad,
    pt.program_kodu,
    ora.risk_skoru,
    ora.risk_seviyesi,
    ora.hayalet_ogrenci_mi
  FROM public.ogrenci_risk_analizi ora
  JOIN public.ogrenci o ON ora.ogrenci_id = o.ogrenci_id
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.soft_delete = false
  AND ora.hesaplama_tarihi >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY ora.risk_skoru DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Danışman Yük Raporu
CREATE OR REPLACE FUNCTION get_danisman_yuk_raporu()
RETURNS TABLE (
  danisman_id UUID,
  ad TEXT,
  soyad TEXT,
  unvan TEXT,
  mevcut_ogrenci_sayisi INT,
  sert_limit INT,
  yumusak_limit INT,
  kapasite_dolu_mu BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.personel_id,
    ap.ad,
    ap.soyad,
    ap.unvan,
    COUNT(o.ogrenci_id)::INT as mevcut_ogrenci_sayisi,
    COALESCE(ap.sert_limit, 
      CASE ap.unvan
        WHEN 'Prof. Dr.' THEN 15
        WHEN 'Doç. Dr.' THEN 12
        WHEN 'Dr. Öğr. Üyesi' THEN 10
        WHEN 'Araş. Gör.' THEN 5
        WHEN 'Araş. Gör. Dr.' THEN 5
        ELSE 10
      END
    ) as sert_limit,
    COALESCE(ap.yumusak_limit,
      CASE ap.unvan
        WHEN 'Prof. Dr.' THEN 12
        WHEN 'Doç. Dr.' THEN 10
        WHEN 'Dr. Öğr. Üyesi' THEN 8
        WHEN 'Araş. Gör.' THEN 4
        WHEN 'Araş. Gör. Dr.' THEN 4
        ELSE 8
      END
    ) as yumusak_limit,
    (COUNT(o.ogrenci_id) >= COALESCE(ap.sert_limit, 10)) as kapasite_dolu_mu
  FROM public.akademik_personel ap
  LEFT JOIN public.ogrenci o ON ap.personel_id = o.danisman_id
    AND o.soft_delete = false
  WHERE ap.aktif_mi = true
  GROUP BY ap.personel_id, ap.ad, ap.soyad, ap.unvan, ap.sert_limit, ap.yumusak_limit
  ORDER BY mevcut_ogrenci_sayisi DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Öğrenci İstatistikleri
CREATE OR REPLACE FUNCTION get_ogrenci_istatistikleri()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_program_bazli JSONB;
  v_durum_bazli JSONB;
BEGIN
  -- Program bazlı istatistikler
  SELECT jsonb_object_agg(pt.program_kodu, jsonb_build_object(
    'toplam', COUNT(*),
    'aktif', COUNT(*) FILTER (WHERE dt.durum_kodu = 'Aktif'),
    'dondurdu', COUNT(*) FILTER (WHERE dt.durum_kodu = 'Dondurdu'),
    'pasif', COUNT(*) FILTER (WHERE dt.durum_kodu = 'Pasif')
  ))
  INTO v_program_bazli
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.soft_delete = false;
  
  -- Durum bazlı istatistikler
  SELECT jsonb_object_agg(dt.durum_kodu, COUNT(*))
  INTO v_durum_bazli
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.soft_delete = false
  GROUP BY dt.durum_kodu;
  
  v_result := jsonb_build_object(
    'program_bazli', v_program_bazli,
    'durum_bazli', v_durum_bazli
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_dashboard_kpi IS 'Dashboard KPI''larını getir';
COMMENT ON FUNCTION get_risk_analizi_raporu IS 'Risk analizi raporu';
COMMENT ON FUNCTION get_danisman_yuk_raporu IS 'Danışman yük raporu';
COMMENT ON FUNCTION get_ogrenci_istatistikleri IS 'Öğrenci istatistikleri';

-- ============================================
-- VALİDASYON FONKSİYONLARI
-- ============================================

-- Function: Öğrenci Verisi Validasyonu
CREATE OR REPLACE FUNCTION validate_ogrenci_data(p_ogrenci_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_hatalar TEXT[];
BEGIN
  -- Öğrenci ID kontrolü
  IF NOT EXISTS (SELECT 1 FROM public.ogrenci WHERE ogrenci_id = p_ogrenci_id) THEN
    v_hatalar := array_append(v_hatalar, 'Öğrenci bulunamadı');
  END IF;
  
  -- Program türü kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    WHERE o.ogrenci_id = p_ogrenci_id
    AND pt.aktif_mi = true
  ) THEN
    v_hatalar := array_append(v_hatalar, 'Program türü aktif değil');
  END IF;
  
  -- Durum kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM public.ogrenci o
    JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
    WHERE o.ogrenci_id = p_ogrenci_id
  ) THEN
    v_hatalar := array_append(v_hatalar, 'Geçersiz durum');
  END IF;
  
  v_result := array_to_json(v_hatalar)::JSONB;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Milestone Verisi Validasyonu
CREATE OR REPLACE FUNCTION validate_milestone_data(p_milestone_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_hatalar TEXT[];
BEGIN
  -- Milestone ID kontrolü
  IF NOT EXISTS (SELECT 1 FROM public.akademik_milestone WHERE milestone_id = p_milestone_id) THEN
    v_hatalar := array_append(v_hatalar, 'Milestone bulunamadı');
  END IF;
  
  -- Hedef tarih kontrolü
  IF EXISTS (
    SELECT 1 FROM public.akademik_milestone
    WHERE milestone_id = p_milestone_id
    AND hedef_tarih < CURRENT_DATE
    AND durum = 'Beklemede'
    AND gerceklesme_tarihi IS NULL
  ) THEN
    v_hatalar := array_append(v_hatalar, 'Hedef tarih geçmiş');
  END IF;
  
  v_result := array_to_json(v_hatalar)::JSONB;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: TİK Verisi Validasyonu
CREATE OR REPLACE FUNCTION validate_tik_data(p_topanti_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_hatalar TEXT[];
BEGIN
  -- Toplantı ID kontrolü
  IF NOT EXISTS (SELECT 1 FROM public.tik_toplantilari WHERE toplanti_id = p_topanti_id) THEN
    v_hatalar := array_append(v_hatalar, 'Toplantı bulunamadı');
  END IF;
  
  -- Toplantı tarihi kontrolü
  IF EXISTS (
    SELECT 1 FROM public.tik_toplantilari
    WHERE toplanti_id = p_topanti_id
    AND toplanti_tarihi < CURRENT_DATE
    AND katilim_durumu IS NULL
  ) THEN
    v_hatalar := array_append(v_hatalar, 'Toplantı tarihi geçmiş ve katılım durumu girilmemiş');
  END IF;
  
  v_result := array_to_json(v_hatalar)::JSONB;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_ogrenci_data IS 'Öğrenci verisi validasyonu';
COMMENT ON FUNCTION validate_milestone_data IS 'Milestone verisi validasyonu';
COMMENT ON FUNCTION validate_tik_data IS 'TİK verisi validasyonu';

