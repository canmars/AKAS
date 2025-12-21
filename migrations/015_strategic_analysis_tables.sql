-- Migration 015: Strategic Analysis Tables
-- Stratejik analiz için yeni tablolar: başarı trendi, hoca performansı, süreç darboğaz analizi

-- ============================================
-- OGRENCI BASARI TRENDI TABLOSU
-- Akademik başarı trend analizi için
-- ============================================
CREATE TABLE IF NOT EXISTS public.ogrenci_basari_trendi (
  trend_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  akademik_yil INT NOT NULL,
  yariyil INT NOT NULL,
  ortalama_not NUMERIC(5, 2),
  tamamlanan_ders_sayisi INT DEFAULT 0,
  toplam_akts INT DEFAULT 0,
  basarili_ders_sayisi INT DEFAULT 0,
  basarisiz_ders_sayisi INT DEFAULT 0,
  tekrar_alinan_ders_sayisi INT DEFAULT 0,
  hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ogrenci_id, akademik_yil, yariyil)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_basari_trend_ogrenci ON public.ogrenci_basari_trendi(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_basari_trend_yil_yariyil ON public.ogrenci_basari_trendi(akademik_yil, yariyil);

COMMENT ON TABLE public.ogrenci_basari_trendi IS 'Öğrenci akademik başarı trend analizi (dönem bazlı)';

-- ============================================
-- DANISMAN PERFORMANS METRIKLERI TABLOSU
-- Hoca performans metrikleri için
-- ============================================
CREATE TABLE IF NOT EXISTS public.danisman_performans_metrikleri (
  metrik_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  danisman_id UUID NOT NULL REFERENCES public.akademik_personel(personel_id) ON DELETE CASCADE,
  akademik_yil INT NOT NULL,
  mezun_ettigi_ogrenci_sayisi INT DEFAULT 0,
  ortalama_mezuniyet_suresi_ay NUMERIC(6, 2),
  riskli_ogrenci_sayisi INT DEFAULT 0,
  kritik_riskli_ogrenci_sayisi INT DEFAULT 0,
  aktif_ogrenci_sayisi INT DEFAULT 0,
  pasif_ogrenci_sayisi INT DEFAULT 0,
  ortalama_risk_skoru NUMERIC(5, 2),
  basari_orani NUMERIC(5, 2), -- Mezun olan / Toplam öğrenci
  hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(danisman_id, akademik_yil)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_performans_metrik_danisman ON public.danisman_performans_metrikleri(danisman_id);
CREATE INDEX IF NOT EXISTS idx_performans_metrik_yil ON public.danisman_performans_metrikleri(akademik_yil);

COMMENT ON TABLE public.danisman_performans_metrikleri IS 'Danışman performans metrikleri (mezuniyet oranı, ortalama süre, risk yönetimi)';

-- ============================================
-- SUREC DARBOGAZ ANALIZI TABLOSU
-- Süreç darboğaz analizi için
-- ============================================
CREATE TABLE IF NOT EXISTS public.surec_darbogaz_analizi (
  analiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asama TEXT NOT NULL,
  program_turu_id UUID REFERENCES public.program_turleri(program_turu_id),
  takilan_ogrenci_sayisi INT DEFAULT 0,
  ortalama_takilma_suresi_ay NUMERIC(6, 2),
  maksimum_takilma_suresi_ay NUMERIC(6, 2),
  minimum_takilma_suresi_ay NUMERIC(6, 2),
  kritik_darbogaz_mi BOOLEAN DEFAULT false,
  darbogaz_seviyesi TEXT CHECK (darbogaz_seviyesi IN ('Dusuk', 'Orta', 'Yuksek', 'Kritik')),
  analiz_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  akademik_yil INT,
  yariyil INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(asama, program_turu_id, akademik_yil, yariyil)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_darbogaz_analiz_asama ON public.surec_darbogaz_analizi(asama);
CREATE INDEX IF NOT EXISTS idx_darbogaz_analiz_program ON public.surec_darbogaz_analizi(program_turu_id);
CREATE INDEX IF NOT EXISTS idx_darbogaz_analiz_kritik ON public.surec_darbogaz_analizi(kritik_darbogaz_mi);

COMMENT ON TABLE public.surec_darbogaz_analizi IS 'Süreç darboğaz analizi (aşama bazlı takılma süreleri ve öğrenci sayıları)';

-- ============================================
-- FONKSIYON: Öğrenci Başarı Trendi Hesapla
-- ============================================
CREATE OR REPLACE FUNCTION hesapla_ogrenci_basari_trendi(
  p_ogrenci_id UUID,
  p_akademik_yil INT,
  p_yariyil INT
)
RETURNS UUID AS $$
DECLARE
  v_trend_id UUID;
  v_ortalama_not NUMERIC;
  v_tamamlanan_ders_sayisi INT;
  v_toplam_akts INT;
  v_basarili_ders_sayisi INT;
  v_basarisiz_ders_sayisi INT;
  v_tekrar_alinan_ders_sayisi INT;
BEGIN
  -- Ders bilgilerini hesapla
  SELECT 
    COALESCE(AVG(
      CASE 
        WHEN not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'B') THEN
          CASE not_kodu
            WHEN 'AA' THEN 4.0
            WHEN 'BA' THEN 3.5
            WHEN 'BB' THEN 3.0
            WHEN 'CB' THEN 2.5
            WHEN 'CC' THEN 2.0
            WHEN 'DC' THEN 1.5
            WHEN 'DD' THEN 1.0
            WHEN 'B' THEN 3.0
            ELSE 0
          END
        ELSE NULL
      END
    ), 0),
    COUNT(DISTINCT ders_kodu) FILTER (WHERE not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'B')),
    COALESCE(SUM(akts) FILTER (WHERE not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'B')), 0),
    COUNT(DISTINCT ders_kodu) FILTER (WHERE not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'B')),
    COUNT(DISTINCT ders_kodu) FILTER (WHERE not_kodu NOT IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'B', 'H', 'M', 'D', 'E', 'K', 'P', 'T', 'Z')),
    COUNT(*) FILTER (WHERE ts > 1)
  INTO 
    v_ortalama_not,
    v_tamamlanan_ders_sayisi,
    v_toplam_akts,
    v_basarili_ders_sayisi,
    v_basarisiz_ders_sayisi,
    v_tekrar_alinan_ders_sayisi
  FROM public.ogrenci_dersleri
  WHERE ogrenci_id = p_ogrenci_id
    AND akademik_yil = p_akademik_yil
    AND yariyil = p_yariyil
    AND ts = (SELECT MAX(ts) FROM public.ogrenci_dersleri od2 
              WHERE od2.ogrenci_id = ogrenci_dersleri.ogrenci_id 
              AND od2.ders_kodu = ogrenci_dersleri.ders_kodu);

  -- Trend kaydını oluştur veya güncelle
  INSERT INTO public.ogrenci_basari_trendi (
    ogrenci_id,
    akademik_yil,
    yariyil,
    ortalama_not,
    tamamlanan_ders_sayisi,
    toplam_akts,
    basarili_ders_sayisi,
    basarisiz_ders_sayisi,
    tekrar_alinan_ders_sayisi
  ) VALUES (
    p_ogrenci_id,
    p_akademik_yil,
    p_yariyil,
    v_ortalama_not,
    v_tamamlanan_ders_sayisi,
    v_toplam_akts,
    v_basarili_ders_sayisi,
    v_basarisiz_ders_sayisi,
    v_tekrar_alinan_ders_sayisi
  )
  ON CONFLICT (ogrenci_id, akademik_yil, yariyil)
  DO UPDATE SET
    ortalama_not = EXCLUDED.ortalama_not,
    tamamlanan_ders_sayisi = EXCLUDED.tamamlanan_ders_sayisi,
    toplam_akts = EXCLUDED.toplam_akts,
    basarili_ders_sayisi = EXCLUDED.basarili_ders_sayisi,
    basarisiz_ders_sayisi = EXCLUDED.basarisiz_ders_sayisi,
    tekrar_alinan_ders_sayisi = EXCLUDED.tekrar_alinan_ders_sayisi,
    hesaplama_tarihi = CURRENT_TIMESTAMP
  RETURNING trend_id INTO v_trend_id;

  RETURN v_trend_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hesapla_ogrenci_basari_trendi IS 'Öğrenci başarı trendini hesaplar ve kaydeder';

-- ============================================
-- FONKSIYON: Danışman Performans Metrikleri Hesapla
-- ============================================
CREATE OR REPLACE FUNCTION hesapla_danisman_performans_metrikleri(
  p_danisman_id UUID,
  p_akademik_yil INT
)
RETURNS UUID AS $$
DECLARE
  v_metrik_id UUID;
  v_mezun_sayisi INT;
  v_ortalama_sure NUMERIC;
  v_riskli_sayisi INT;
  v_kritik_riskli_sayisi INT;
  v_aktif_sayisi INT;
  v_pasif_sayisi INT;
  v_ortalama_risk NUMERIC;
  v_basari_orani NUMERIC;
BEGIN
  -- Mezun edilen öğrenci sayısı (tahmini - gerçek implementasyonda mezuniyet tablosu kullanılabilir)
  SELECT COUNT(*) INTO v_mezun_sayisi
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = p_danisman_id
    AND dt.durum_kodu = 'Mezun'
    AND EXTRACT(YEAR FROM o.updated_at) = p_akademik_yil;

  -- Ortalama mezuniyet süresi (ay)
  SELECT COALESCE(AVG(
    EXTRACT(EPOCH FROM (o.updated_at - o.kayit_tarihi)) / (30 * 24 * 60 * 60)
  ), 0) INTO v_ortalama_sure
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = p_danisman_id
    AND dt.durum_kodu = 'Mezun'
    AND EXTRACT(YEAR FROM o.updated_at) = p_akademik_yil;

  -- Riskli öğrenci sayıları
  SELECT 
    COUNT(*) FILTER (WHERE mevcut_risk_skoru >= 50),
    COUNT(*) FILTER (WHERE mevcut_risk_skoru >= 70),
    COUNT(*) FILTER (WHERE mevcut_risk_skoru < 50),
    COUNT(*) FILTER (WHERE mevcut_risk_skoru >= 70 OR mevcut_risk_skoru IS NULL),
    COALESCE(AVG(mevcut_risk_skoru), 0)
  INTO 
    v_riskli_sayisi,
    v_kritik_riskli_sayisi,
    v_aktif_sayisi,
    v_pasif_sayisi,
    v_ortalama_risk
  FROM public.ogrenci_mevcut_durum_view omdv
  JOIN public.ogrenci o ON omdv.ogrenci_id = o.ogrenci_id
  WHERE o.danisman_id = p_danisman_id
    AND o.soft_delete = false;

  -- Başarı oranı (mezun / toplam)
  DECLARE
    v_toplam_ogrenci INT;
  BEGIN
    SELECT COUNT(*) INTO v_toplam_ogrenci
    FROM public.ogrenci
    WHERE danisman_id = p_danisman_id
      AND soft_delete = false;

    IF v_toplam_ogrenci > 0 THEN
      v_basari_orani := (v_mezun_sayisi::NUMERIC / v_toplam_ogrenci::NUMERIC) * 100;
    ELSE
      v_basari_orani := 0;
    END IF;
  END;

  -- Metrik kaydını oluştur veya güncelle
  INSERT INTO public.danisman_performans_metrikleri (
    danisman_id,
    akademik_yil,
    mezun_ettigi_ogrenci_sayisi,
    ortalama_mezuniyet_suresi_ay,
    riskli_ogrenci_sayisi,
    kritik_riskli_ogrenci_sayisi,
    aktif_ogrenci_sayisi,
    pasif_ogrenci_sayisi,
    ortalama_risk_skoru,
    basari_orani
  ) VALUES (
    p_danisman_id,
    p_akademik_yil,
    v_mezun_sayisi,
    v_ortalama_sure,
    v_riskli_sayisi,
    v_kritik_riskli_sayisi,
    v_aktif_sayisi,
    v_pasif_sayisi,
    v_ortalama_risk,
    v_basari_orani
  )
  ON CONFLICT (danisman_id, akademik_yil)
  DO UPDATE SET
    mezun_ettigi_ogrenci_sayisi = EXCLUDED.mezun_ettigi_ogrenci_sayisi,
    ortalama_mezuniyet_suresi_ay = EXCLUDED.ortalama_mezuniyet_suresi_ay,
    riskli_ogrenci_sayisi = EXCLUDED.riskli_ogrenci_sayisi,
    kritik_riskli_ogrenci_sayisi = EXCLUDED.kritik_riskli_ogrenci_sayisi,
    aktif_ogrenci_sayisi = EXCLUDED.aktif_ogrenci_sayisi,
    pasif_ogrenci_sayisi = EXCLUDED.pasif_ogrenci_sayisi,
    ortalama_risk_skoru = EXCLUDED.ortalama_risk_skoru,
    basari_orani = EXCLUDED.basari_orani,
    hesaplama_tarihi = CURRENT_TIMESTAMP
  RETURNING metrik_id INTO v_metrik_id;

  RETURN v_metrik_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hesapla_danisman_performans_metrikleri IS 'Danışman performans metriklerini hesaplar ve kaydeder';

-- ============================================
-- FONKSIYON: Süreç Darboğaz Analizi Hesapla
-- ============================================
CREATE OR REPLACE FUNCTION hesapla_surec_darbogaz_analizi(
  p_asama TEXT,
  p_program_turu_id UUID DEFAULT NULL,
  p_akademik_yil INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  p_yariyil INT DEFAULT CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 10 OR EXTRACT(MONTH FROM CURRENT_DATE) <= 1 THEN 1 ELSE 2 END
)
RETURNS UUID AS $$
DECLARE
  v_analiz_id UUID;
  v_takilan_sayisi INT;
  v_ortalama_sure NUMERIC;
  v_maksimum_sure NUMERIC;
  v_minimum_sure NUMERIC;
  v_kritik_mi BOOLEAN;
  v_seviye TEXT;
BEGIN
  -- Takılan öğrenci sayısını hesapla
  SELECT COUNT(*)
  INTO v_takilan_sayisi
  FROM public.ogrenci_akademik_durum oad
  JOIN public.ogrenci o ON oad.ogrenci_id = o.ogrenci_id
  WHERE oad.mevcut_asinama = p_asama
    AND o.soft_delete = false
    AND (p_program_turu_id IS NULL OR o.program_turu_id = p_program_turu_id);

  -- Ortalama takılma süresini hesapla (basitleştirilmiş)
  -- Gerçek implementasyonda milestone tarihleri kullanılabilir
  SELECT 
    COALESCE(AVG(oad.mevcut_yariyil), 0),
    COALESCE(MAX(oad.mevcut_yariyil), 0),
    COALESCE(MIN(oad.mevcut_yariyil), 0)
  INTO 
    v_ortalama_sure,
    v_maksimum_sure,
    v_minimum_sure
  FROM public.ogrenci_akademik_durum oad
  JOIN public.ogrenci o ON oad.ogrenci_id = o.ogrenci_id
  WHERE oad.mevcut_asinama = p_asama
    AND o.soft_delete = false
    AND (p_program_turu_id IS NULL OR o.program_turu_id = p_program_turu_id);

  -- Kritik darboğaz kontrolü
  -- 4. yarıyıl Seminer veya 6+ yarıyıl Yeterlik gibi kritik durumlar
  v_kritik_mi := (
    (p_asama = 'Ders' AND v_ortalama_sure >= 4) OR
    (p_asama = 'Yeterlik' AND v_ortalama_sure >= 6) OR
    (p_asama = 'Tez_Onersi' AND v_ortalama_sure >= 8) OR
    v_takilan_sayisi > 20
  );

  -- Darboğaz seviyesi
  v_seviye := CASE
    WHEN v_takilan_sayisi > 30 OR v_ortalama_sure > 8 THEN 'Kritik'
    WHEN v_takilan_sayisi > 15 OR v_ortalama_sure > 6 THEN 'Yuksek'
    WHEN v_takilan_sayisi > 5 OR v_ortalama_sure > 4 THEN 'Orta'
    ELSE 'Dusuk'
  END;

  -- Analiz kaydını oluştur veya güncelle
  INSERT INTO public.surec_darbogaz_analizi (
    asama,
    program_turu_id,
    takilan_ogrenci_sayisi,
    ortalama_takilma_suresi_ay,
    maksimum_takilma_suresi_ay,
    minimum_takilma_suresi_ay,
    kritik_darbogaz_mi,
    darbogaz_seviyesi,
    akademik_yil,
    yariyil
  ) VALUES (
    p_asama,
    p_program_turu_id,
    v_takilan_sayisi,
    v_ortalama_sure,
    v_maksimum_sure,
    v_minimum_sure,
    v_kritik_mi,
    v_seviye,
    p_akademik_yil,
    p_yariyil
  )
  ON CONFLICT (asama, program_turu_id, akademik_yil, yariyil)
  DO UPDATE SET
    takilan_ogrenci_sayisi = EXCLUDED.takilan_ogrenci_sayisi,
    ortalama_takilma_suresi_ay = EXCLUDED.ortalama_takilma_suresi_ay,
    maksimum_takilma_suresi_ay = EXCLUDED.maksimum_takilma_suresi_ay,
    minimum_takilma_suresi_ay = EXCLUDED.minimum_takilma_suresi_ay,
    kritik_darbogaz_mi = EXCLUDED.kritik_darbogaz_mi,
    darbogaz_seviyesi = EXCLUDED.darbogaz_seviyesi,
    analiz_tarihi = CURRENT_TIMESTAMP
  RETURNING analiz_id INTO v_analiz_id;

  RETURN v_analiz_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hesapla_surec_darbogaz_analizi IS 'Süreç darboğaz analizini hesaplar ve kaydeder';

-- ============================================
-- BATCH FONKSIYONLAR
-- ============================================

-- Tüm öğrenciler için başarı trendi hesapla
CREATE OR REPLACE FUNCTION batch_hesapla_basari_trendi(
  p_akademik_yil INT,
  p_yariyil INT
)
RETURNS TABLE(ogrenci_id UUID, trend_id UUID) AS $$
DECLARE
  v_ogrenci_record RECORD;
BEGIN
  FOR v_ogrenci_record IN
    SELECT ogrenci_id
    FROM public.ogrenci
    WHERE soft_delete = false
  LOOP
    BEGIN
      PERFORM hesapla_ogrenci_basari_trendi(
        v_ogrenci_record.ogrenci_id,
        p_akademik_yil,
        p_yariyil
      );
      
      ogrenci_id := v_ogrenci_record.ogrenci_id;
      trend_id := NULL; -- Hesaplama fonksiyonu ID döndürüyor, burada kullanmıyoruz
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Hata durumunda devam et
      CONTINUE;
    END;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION batch_hesapla_basari_trendi IS 'Tüm öğrenciler için başarı trendi hesaplar';

