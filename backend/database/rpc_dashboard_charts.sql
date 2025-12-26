-- Function to get Advisor Load Metrics
CREATE OR REPLACE FUNCTION get_advisor_load_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT
            ap.personel_id,
            ap.unvan || ' ' || ap.ad || ' ' || ap.soyad AS hoca_adi,
            ap.avatar_url,
            COUNT(o.ogrenci_id) AS mevcut,
            ap.tezli_kotasi AS kota,
            CASE
                WHEN ap.tezli_kotasi > 0 THEN ROUND((COUNT(o.ogrenci_id)::NUMERIC / ap.tezli_kotasi) * 100, 0)
                ELSE 0
            END AS doluluk_orani
        FROM akademik_personel ap
        LEFT JOIN ogrenci o ON ap.personel_id = o.danisman_id AND o.aktif_mi = true
        WHERE ap.rol IN ('Danisman', 'Bolum_Baskani') AND ap.aktif_mi = true
        GROUP BY ap.personel_id, ap.unvan, ap.ad, ap.soyad, ap.avatar_url, ap.tezli_kotasi
        ORDER BY doluluk_orani DESC
        LIMIT 5
    ) t;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to get Funnel Metrics
CREATE OR REPLACE FUNCTION get_funnel_metrics()
RETURNS JSON AS $$
DECLARE
    lesson_count INTEGER;
    qualification_count INTEGER;
    thesis_count INTEGER;
    graduated_count INTEGER;
    result JSON;
BEGIN
    -- 1. Lesson Stage
    SELECT COUNT(*) INTO lesson_count
    FROM ogrenci o
    JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE o.aktif_mi = true AND (d.durum_kodu = 'DERS_ASAMASI' OR d.durum_kodu = 'BILIMSEL_HAZIRLIK');

    -- 2. Qualification Stage (Assuming 'YETERLIK' or similar exists, fallback to regex if unsure, but user said YETERLIK)
    -- Also including potential variations if guessed.
    SELECT COUNT(*) INTO qualification_count
    FROM ogrenci o
    JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE o.aktif_mi = true AND d.durum_kodu = 'YETERLIK';

    -- 3. Thesis Stage (Starts with TEZ_)
    SELECT COUNT(*) INTO thesis_count
    FROM ogrenci o
    JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE o.aktif_mi = true AND d.durum_kodu LIKE 'TEZ_%';

    -- 4. Graduated
    SELECT COUNT(*) INTO graduated_count
    FROM ogrenci o
    JOIN durum_turleri d ON o.durum_id = d.durum_id
    WHERE d.durum_kodu = 'MEZUN';

    result := json_build_object(
        'lesson', lesson_count,
        'qualification', qualification_count,
        'thesis', thesis_count,
        'graduated', graduated_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;
