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
    -- Tarih Belirleme (6 ay öncesi)
    prev_period_date := CURRENT_DATE - INTERVAL '6 months';

    -- 1. TOPLAM ÖĞRENCİ (Sadece Aktifler)
    SELECT COUNT(*) INTO total_students_curr 
    FROM ogrenci 
    WHERE aktif_mi = true AND deleted_at IS NULL;
    
    -- Geçmiş
    SELECT COUNT(*) INTO total_students_prev 
    FROM ogrenci 
    WHERE aktif_mi = true AND deleted_at IS NULL 
      AND kayit_tarihi <= prev_period_date;
    
    IF total_students_prev > 0 THEN
        total_students_trend := ROUND(((total_students_curr - total_students_prev)::NUMERIC / total_students_prev) * 100, 1);
    END IF;

    -- 2. RİSKLİ ÖĞRENCİLER (DÜZELTME BURADA YAPILDI)
    -- Artık risk tablosunu Öğrenci tablosuyla birleştirip "Aktif mi?" diye soruyoruz.
    SELECT COUNT(*) INTO risky_students_curr
    FROM ogrenci_risk_skorlari r
    JOIN ogrenci o ON o.ogrenci_id = r.ogrenci_id
    WHERE r.risk_seviyesi IN ('Yuksek', 'Kritik')
      AND o.aktif_mi = true 
      AND o.deleted_at IS NULL;
      
    -- Geçmiş (Risk Tarihçesi)
    SELECT COUNT(*) INTO risky_students_prev
    FROM risk_tarihcesi rt
    JOIN ogrenci o ON o.ogrenci_id = rt.ogrenci_id
    WHERE rt.hesaplama_tarihi <= prev_period_date
      AND rt.risk_seviyesi IN ('Yuksek', 'Kritik')
      AND o.aktif_mi = true
    LIMIT 1; 
    
    IF risky_students_prev IS NULL THEN risky_students_prev := 0; END IF;

    IF risky_students_prev > 0 THEN
        risky_students_trend := ROUND(((risky_students_curr - risky_students_prev)::NUMERIC / risky_students_prev) * 100, 1);
    END IF;

    -- 3. AKTİF TEZLER (Duzeltme durumu dahil)
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

    -- 4. DANIŞMAN YÜKÜ (Sadece Aktif Hocalar)
    SELECT COUNT(*) INTO advisor_count 
    FROM akademik_personel 
    WHERE rol IN ('Danisman', 'Bolum_Baskani') 
      AND aktif_mi = true; -- Aktiflik kontrolü
    
    IF advisor_count > 0 THEN
        advisor_load_curr := ROUND(total_students_curr::NUMERIC / advisor_count, 1);
        
        -- Geçmiş yük
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
            'trend_direction', CASE WHEN total_students_trend >= 0 THEN 'up' ELSE 'down' END,
            'label', 'Geçen döneme göre'
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
            'trend_direction', CASE WHEN advisor_load_trend <= 0 THEN 'down' ELSE 'up' END,
            'label', 'Yük değişimi'
        )
    );

    RETURN result;
END;
$$;