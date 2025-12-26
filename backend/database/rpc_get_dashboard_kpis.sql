-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_dashboard_kpis();

CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    total_students_count INTEGER;
    high_risk_count INTEGER;
    advisor_count INTEGER;
    advisor_load NUMERIC;
    active_thesis_count INTEGER;
    risk_threshold_exceeded_count INTEGER;
    graduates_count INTEGER;
    graduate_candidates_count INTEGER;
    
    result JSON;
BEGIN
    -- 1. Total Active Students
    SELECT COUNT(*) INTO total_students_count
    FROM ogrenci
    WHERE aktif_mi = true;

    -- 2. High Risk (GNO < 2.0 OR Status = 'TEZ_UZATMA')
    SELECT COUNT(*) INTO high_risk_count
    FROM ogrenci o
    LEFT JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE o.aktif_mi = true 
      AND (o.gno < 2.0 OR d.durum_kodu = 'TEZ_UZATMA');

    -- 3. Advisor Load
    SELECT COUNT(*) INTO advisor_count
    FROM akademik_personel
    WHERE rol IN ('Danisman', 'Bolum_Baskani');

    IF advisor_count > 0 THEN
        advisor_load := ROUND(total_students_count::NUMERIC / advisor_count, 1);
    ELSE
        advisor_load := 0;
    END IF;

    -- 4. Active Thesis Work
    -- Status in 'TEZ_ASAMASI', 'TEZ_ONERI', 'TEZ_YAZIM'
    SELECT COUNT(*) INTO active_thesis_count
    FROM ogrenci o
    LEFT JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE o.aktif_mi = true
      AND d.durum_kodu IN ('TEZ_ASAMASI', 'TEZ_ONERI', 'TEZ_YAZIM');

    -- 5. Risk Threshold Exceeded (GNO < 1.80)
    SELECT COUNT(*) INTO risk_threshold_exceeded_count
    FROM ogrenci
    WHERE aktif_mi = true AND gno < 1.80;

    -- 6. Graduates (Total)
    SELECT COUNT(*) INTO graduates_count
    FROM ogrenci o
    LEFT JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE d.durum_kodu = 'MEZUN';

    -- 7. Graduate Candidates (Semester >= 4)
    -- 'mevcut_yariyil' is in 'ogrenci_akademik_durum' table
    SELECT COUNT(*) INTO graduate_candidates_count
    FROM ogrenci o
    LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
    WHERE o.aktif_mi = true AND COALESCE(oad.mevcut_yariyil, 1) >= 4;

    -- Construct the JSON result
    result := json_build_object(
        'total_students', json_build_object(
            'value', total_students_count,
            'change', '0%',
            'trend', 'neutral'
        ),
        'high_risk', json_build_object(
            'value', high_risk_count,
            'percentage', CASE WHEN total_students_count > 0 THEN ROUND((high_risk_count::NUMERIC / total_students_count) * 100, 1) || '%' ELSE '0%' END,
            'status', CASE WHEN high_risk_count > 35 THEN 'critical' ELSE 'normal' END
        ),
        'advisor_load', json_build_object(
            'value', advisor_load,
            'target', 8.0,
            'status', CASE WHEN advisor_load > 8.0 THEN 'warning' ELSE 'good' END
        ),
        'advisor_count', json_build_object(
            'value', advisor_count
        ),
        'active_thesis', json_build_object(
            'value', active_thesis_count,
            'total_pool', total_students_count
        ),
        'risk_threshold_exceeded', json_build_object(
            'value', risk_threshold_exceeded_count,
            'change', '0%'
        ),
        'thesis_completion_rate', json_build_object(
            'value', CASE WHEN (graduates_count + active_thesis_count) > 0 THEN ROUND((graduates_count::NUMERIC / (graduates_count + active_thesis_count)) * 100, 0) ELSE 0 END,
            'trend', '0%'
        ),
        'graduates', json_build_object(
             'value', graduates_count
        ),
        'graduate_candidates', json_build_object(
            'value', graduate_candidates_count,
            'trend', '0%'
        )
    );

    RETURN result;
END;
$$;
