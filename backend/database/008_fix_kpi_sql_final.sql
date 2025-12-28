-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: FINAL FIX for Dashboard KPI Function (V3)
-- Fixes: "column must appear in GROUP BY" error (removed ORDER BY from COUNT queries)
-- Fixes: Added 'Duzeltme' constraint to tezler table
-- =============================================

-- 1. Constraint Fix (Safe Update)
DO $$
DECLARE
    v_constraint_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tezler_durum_check'
    ) INTO v_constraint_exists;

    IF v_constraint_exists THEN
        ALTER TABLE public.tezler DROP CONSTRAINT tezler_durum_check;
    END IF;
    
    ALTER TABLE public.tezler
    ADD CONSTRAINT tezler_durum_check 
    CHECK (durum = ANY (ARRAY['Oneri'::text, 'Yazim'::text, 'Juri'::text, 'Duzeltme'::text, 'Tamamlandi'::text, 'Basarisiz'::text, 'Iptal'::text]));
END $$;


-- 2. Log History Trigger (Ensuring it exists)
CREATE OR REPLACE FUNCTION log_risk_history() RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.risk_skoru IS DISTINCT FROM NEW.risk_skoru) OR 
       (OLD.risk_seviyesi IS DISTINCT FROM NEW.risk_seviyesi) THEN
       
        INSERT INTO public.risk_tarihcesi (
            ogrenci_id, risk_skoru, risk_seviyesi, ana_faktorler, hesaplama_tarihi, donem_tipi
        )
        VALUES (
            NEW.ogrenci_id, NEW.risk_skoru, NEW.risk_seviyesi, NEW.risk_faktorleri, NOW(), 'Guz'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_risk_history ON public.ogrenci_risk_skorlari;
CREATE TRIGGER trg_log_risk_history
AFTER UPDATE ON public.ogrenci_risk_skorlari
FOR EACH ROW EXECUTE FUNCTION log_risk_history();


-- 3. FIX KPI FUNCTION (Removed ORDER BY from COUNT query)
DROP FUNCTION IF EXISTS get_dashboard_kpis_v3();

CREATE OR REPLACE FUNCTION get_dashboard_kpis_v3()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    -- Current Counts
    total_students_curr INTEGER := 0;
    risky_students_curr INTEGER := 0;
    active_thesis_curr INTEGER := 0;
    advisor_count INTEGER := 0;
    
    -- Previous Counts (For Trend)
    total_students_prev INTEGER := 0;
    risky_students_prev INTEGER := 0;
    active_thesis_prev INTEGER := 0;
    advisor_load_prev NUMERIC := 0;
    
    -- Calculated Metrics
    advisor_load_curr NUMERIC := 0;
    
    -- Trend Percentages
    total_students_trend NUMERIC := 0;
    risky_students_trend NUMERIC := 0;
    active_thesis_trend NUMERIC := 0;
    advisor_load_trend NUMERIC := 0;
    
    -- Chart Data Arrays
    chart_active_thesis INTEGER[];
    
    -- Date Variables
    prev_period_date DATE;
    
    result JSON;
BEGIN
    prev_period_date := CURRENT_DATE - INTERVAL '6 months';

    -- 1. TOPLAM ÖĞRENCİ
    SELECT COUNT(*) INTO total_students_curr FROM ogrenci WHERE aktif_mi = true;
    
    SELECT COUNT(*) INTO total_students_prev 
    FROM ogrenci 
    WHERE aktif_mi = true AND kayit_tarihi <= prev_period_date;
    
    IF total_students_prev > 0 THEN
        total_students_trend := ROUND(((total_students_curr - total_students_prev)::NUMERIC / total_students_prev) * 100, 1);
    END IF;

    -- 2. RİSKLİ ÖĞRENCİLER
    SELECT COUNT(*) INTO risky_students_curr
    FROM ogrenci_risk_skorlari
    WHERE risk_seviyesi IN ('Yuksek', 'Kritik');
      
    -- Geçmiş (FIX: Removed ORDER BY because using COUNT)
    SELECT COUNT(*) INTO risky_students_prev
    FROM risk_tarihcesi
    WHERE hesaplama_tarihi <= prev_period_date
      AND risk_seviyesi IN ('Yuksek', 'Kritik');
    -- LIMIT 1 removed since COUNT returns 1 row anyway.
    
    IF risky_students_prev IS NULL THEN risky_students_prev := 0; END IF;

    IF risky_students_prev > 0 THEN
        risky_students_trend := ROUND(((risky_students_curr - risky_students_prev)::NUMERIC / risky_students_prev) * 100, 1);
    END IF;

    -- 3. AKTİF TEZLER
    SELECT COUNT(*) INTO active_thesis_curr
    FROM tezler
    WHERE durum IN ('Oneri', 'Yazim', 'Juri', 'Duzeltme');
    
    SELECT COUNT(*) INTO active_thesis_prev
    FROM tezler
    WHERE baslangic_tarihi <= prev_period_date 
      AND (bitis_tarihi IS NULL OR bitis_tarihi > prev_period_date);
    
    IF active_thesis_prev IS NULL THEN active_thesis_prev := 0; END IF;
      
    IF active_thesis_prev > 0 THEN
        active_thesis_trend := ROUND(((active_thesis_curr - active_thesis_prev)::NUMERIC / active_thesis_prev) * 100, 1);
    END IF;

    -- 4. DANIŞMAN YÜKÜ
    SELECT COUNT(*) INTO advisor_count FROM akademik_personel WHERE rol IN ('Danisman', 'Bolum_Baskani') AND aktif_danisman_mi = true;
    
    IF advisor_count > 0 THEN
        advisor_load_curr := ROUND(total_students_curr::NUMERIC / advisor_count, 1);
        
        IF total_students_prev > 0 THEN
             advisor_load_prev := ROUND(total_students_prev::NUMERIC / advisor_count, 1);
             IF advisor_load_prev > 0 THEN
                advisor_load_trend := ROUND(((advisor_load_curr - advisor_load_prev) / advisor_load_prev) * 100, 1);
             END IF;
        END IF;
    END IF;

    -- 5. GRAFİK DATALARI
    SELECT ARRAY_AGG(cnt ORDER BY month_date)
    INTO chart_active_thesis
    FROM (
        SELECT d.month_date, 
               (
                   SELECT COUNT(*) 
                   FROM tezler t
                   WHERE t.baslangic_tarihi <= d.month_date
                     AND (t.bitis_tarihi IS NULL OR t.bitis_tarihi > d.month_date)
                     AND t.durum IN ('Oneri', 'Yazim', 'Juri', 'Duzeltme')
               ) as cnt
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 months', 
            CURRENT_DATE, 
            '1 month'
        ) AS d(month_date)
    ) sub;
    
    IF chart_active_thesis IS NULL THEN chart_active_thesis := ARRAY[]::INTEGER[]; END IF;

    -- JSON ÇIKTISI
    result := json_build_object(
        'toplam_ogrenci', json_build_object(
            'value', total_students_curr,
            'trend', total_students_trend,
            'trend_direction', CASE WHEN total_students_trend >= 0 THEN 'up' ELSE 'down' END
        ),
        'riskli_ogrenci', json_build_object(
            'value', risky_students_curr,
            'trend', risky_students_trend,
            'trend_direction', CASE WHEN risky_students_trend >= 0 THEN 'up' ELSE 'down' END,
            'label', 'Risk Değişimi'
        ),
        'aktif_tezler', json_build_object(
            'value', active_thesis_curr,
            'chart_data', chart_active_thesis,
            'trend', active_thesis_trend
        ),
        'danisman_yuku', json_build_object(
            'value', advisor_load_curr,
            'trend', advisor_load_trend,
            'trend_direction', CASE WHEN advisor_load_trend <= 0 THEN 'down' ELSE 'up' END
        )
    );

    RETURN result;
END;
$$;
