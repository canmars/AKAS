-- 1. Huni Metrikleri Fonksiyonu (Dinamik ve Sıralı)
CREATE OR REPLACE FUNCTION get_dashboard_funnel_stats()
RETURNS TABLE (
    label text,
    value bigint,
    sub_value text,
    badge_text text,
    badge_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.durum_adi::text as label,
        COUNT(o.ogrenci_id) as value,
        ROUND(AVG(o.gno), 2)::text as sub_value,
        CASE 
            WHEN dt.durum_kodu = 'YETERLIK_ASAMASI' THEN 'High Stress'
            WHEN dt.durum_kodu = 'TEZ_YAZIM' THEN 'Delay Risk'
            WHEN dt.durum_kodu = 'MEZUN' THEN 'Success'
            ELSE NULL
        END::text as badge_text,
        CASE 
            WHEN dt.durum_kodu = 'YETERLIK_ASAMASI' THEN 'warning'
            WHEN dt.durum_kodu = 'TEZ_YAZIM' THEN 'danger'
            WHEN dt.durum_kodu = 'MEZUN' THEN 'success'
            ELSE NULL
        END::text as badge_type
    FROM public.durum_turleri dt
    LEFT JOIN public.ogrenci o ON o.durum_id = dt.durum_id
    GROUP BY dt.durum_id, dt.durum_adi, dt.durum_kodu, dt.sira_no
    ORDER BY dt.sira_no ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. Kritik Alarmlar (Fallback Mekanizmalı)
CREATE OR REPLACE FUNCTION get_critical_student_alarms()
RETURNS TABLE (
    name text,
    stage text,
    risk_score integer,
    reason text,
    avatar_url text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (o.ad || ' ' || SUBSTRING(o.soyad, 1, 1) || '.') as name,
        dt.durum_adi::text as stage,
        COALESCE(rs.risk_skoru, (CASE WHEN o.gno < 2.0 THEN (80 + (2.0 - o.gno) * 10)::integer ELSE 40 END)) as risk_score,
        COALESCE(rs.risk_faktorleri->>0, (CASE WHEN o.gno < 2.0 THEN 'Düşük GNO' ELSE 'Genel Takip' END)) as reason,
        o.avatar_url
    FROM public.ogrenci o
    LEFT JOIN public.ogrenci_risk_skorlari rs ON o.ogrenci_id = rs.ogrenci_id
    JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
    WHERE (rs.risk_skoru > 60 OR o.gno < 2.2)
      AND o.aktif_mi = true
      AND o.deleted_at IS NULL
    ORDER BY risk_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- 3. Genel KPI'lar (Gelişmiş)
CREATE OR REPLACE FUNCTION get_dashboard_kpis_v2()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'toplam_ogrenci', (SELECT COUNT(*) FROM public.ogrenci WHERE aktif_mi = true AND deleted_at IS NULL),
        'mezuniyet_orani', 78,
        'riskli_ogrenci_sayisi', (SELECT COUNT(*) FROM public.ogrenci o LEFT JOIN public.ogrenci_risk_skorlari rs ON o.ogrenci_id = rs.ogrenci_id WHERE (rs.risk_skoru > 50 OR o.gno < 2.0) AND o.aktif_mi = true AND o.deleted_at IS NULL),
        'danisman_ogrenci_orani', '1:' || ROUND((SELECT COUNT(*)::numeric FROM public.ogrenci WHERE aktif_mi = true AND deleted_at IS NULL) / NULLIF((SELECT COUNT(*)::numeric FROM public.akademik_personel WHERE rol = 'Danisman' AND aktif_mi = true), 0), 0)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;