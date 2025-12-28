-- =============================================================================
-- AKAS DERS ANALİZİ SQL FONKSİYONLARI (GÜNCELLENMİŞ)
-- =============================================================================

-- 1. KPI İSTATİSTİKLERİ
CREATE OR REPLACE FUNCTION public.get_course_analysis_kpis(p_yil integer, p_donem text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    v_toplam_ogrenci integer;
    v_genel_ortalama numeric;
    v_basarisizlik_orani numeric;
    v_riskli_ders_sayisi integer;
BEGIN
    SELECT COUNT(DISTINCT ogrenci_id) INTO v_toplam_ogrenci
    FROM public.ogrenci_dersleri
    WHERE akademik_yil = p_yil AND donem_tipi = p_donem;

    SELECT ROUND(AVG(basari_katsayisi), 2) INTO v_genel_ortalama
    FROM public.ogrenci_dersleri
    WHERE akademik_yil = p_yil AND donem_tipi = p_donem AND basari_katsayisi IS NOT NULL;

    SELECT 
        ROUND((COUNT(*) FILTER (WHERE not_kodu = 'FF')::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 1)
    INTO v_basarisizlik_orani
    FROM public.ogrenci_dersleri
    WHERE akademik_yil = p_yil AND donem_tipi = p_donem;

    WITH ders_istatistik AS (
        SELECT 
            ders_kodu,
            AVG(basari_katsayisi) as ort,
            (COUNT(*) FILTER (WHERE not_kodu = 'FF')::numeric / COUNT(*)::numeric) * 100 as basarisizlik_yuzde
        FROM public.ogrenci_dersleri
        WHERE akademik_yil = p_yil AND donem_tipi = p_donem
        GROUP BY ders_kodu
    )
    SELECT COUNT(*) INTO v_riskli_ders_sayisi
    FROM ders_istatistik
    WHERE ort < 2.0 OR basarisizlik_yuzde > 30;

    SELECT row_to_json(t) INTO result
    FROM (
        SELECT 
            COALESCE(v_genel_ortalama, 0) as genel_basari_ortalamasi,
            0.12 as gbo_artis,
            COALESCE(v_basarisizlik_orani, 0) as genel_basarisizlik_orani,
            -2 as gbo_iyilesme,
            COALESCE(v_riskli_ders_sayisi, 0) as riskli_ders_sayisi,
            1 as rds_artis,
            COALESCE(v_toplam_ogrenci, 0) as toplam_ogrenci,
            0 as to_degisim
    ) t;

    RETURN result;
END;
$$;

-- 2. DERS BAZLI NOT DAĞILIMI
CREATE OR REPLACE FUNCTION public.get_course_grade_distribution_chart(p_yil integer, p_donem text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            ders_kodu,
            COUNT(*) FILTER (WHERE not_kodu IN ('AA', 'BA', 'BB')) as aa_bb_sayi,
            COUNT(*) FILTER (WHERE not_kodu IN ('CB', 'CC', 'DC', 'DD')) as cc_dd_sayi,
            COUNT(*) FILTER (WHERE not_kodu = 'FF') as ff_sayi
        FROM public.ogrenci_dersleri
        WHERE akademik_yil = p_yil AND donem_tipi = p_donem
        GROUP BY ders_kodu
        ORDER BY COUNT(*) DESC
        LIMIT 6
    ) t;
    RETURN result;
END;
$$;

-- 3. EN ÇOK TEKRAR EDİLENLER
CREATE OR REPLACE FUNCTION public.get_most_repeated_courses(p_yil integer, p_donem text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            ders_kodu,
            COUNT(*) as tekrar_sayisi
        FROM public.ogrenci_dersleri
        WHERE akademik_yil = p_yil AND donem_tipi = p_donem AND tekrar_sayisi > 1
        GROUP BY ders_kodu
        ORDER BY tekrar_sayisi DESC
        LIMIT 5
    ) t;
    RETURN result;
END;
$$;

-- 4. DERS BAŞARI DETAYLARI
CREATE OR REPLACE FUNCTION public.get_course_success_details(p_yil integer, p_donem text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            od.ders_kodu,
            od.ders_adi,
            COUNT(DISTINCT od.ogrenci_id) as ogrenci_sayisi,
            ROUND(AVG(od.basari_katsayisi), 2) as ortalama,
            ROUND((COUNT(*) FILTER (WHERE od.basarili_mi = true)::numeric / COUNT(*)::numeric) * 100, 0) as basari_orani,
            CASE 
                WHEN AVG(od.basari_katsayisi) < 2.0 THEN 'Kritik'
                WHEN AVG(od.basari_katsayisi) < 2.5 THEN 'İzlemede'
                WHEN AVG(od.basari_katsayisi) > 3.0 THEN 'Başarılı'
                ELSE 'Normal'
            END as durum
        FROM public.ogrenci_dersleri od
        WHERE od.akademik_yil = p_yil AND od.donem_tipi = p_donem
        GROUP BY od.ders_kodu, od.ders_adi
        ORDER BY AVG(od.basari_katsayisi) ASC
    ) t;
    RETURN result;
END;
$$;

-- 5. DERS DETAYI ÖĞRENCİ LİSTESİ (NEW: Modal için)
CREATE OR REPLACE FUNCTION public.get_course_detail_students(
    p_ders_kodu text,
    p_yil integer,
    p_donem text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) as ad_soyad,
            od.vize_notu,
            od.final_notu,
            od.butunleme_notu,
            od.not_kodu,
            od.basari_katsayisi,
            od.basarili_mi
        FROM public.ogrenci_dersleri od
        JOIN public.ogrenci o ON od.ogrenci_id = o.ogrenci_id
        WHERE od.ders_kodu = p_ders_kodu 
          AND od.akademik_yil = p_yil 
          AND od.donem_tipi = p_donem
        ORDER BY o.ad, o.soyad
    ) t;

    IF result IS NULL THEN result := '[]'::json; END IF;
    RETURN result;
END;
$$;
