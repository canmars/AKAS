-- =============================================
-- Author: AKAS Agent
-- Date: 2025-01-XX
-- Description: Dashboard Detay Modalları için SQL Fonksiyonları
-- =============================================

-- 1. RİSKLİ ÖĞRENCİLER DETAY LİSTESİ
CREATE OR REPLACE FUNCTION get_risky_students_detail()
RETURNS json
LANGUAGE plpgsql
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
            (o.ad || ' ' || o.soyad) as ad_soyad,
            o.avatar_url,
            o.gno,
            COALESCE(rs.risk_skoru, 0) as risk_skoru,
            COALESCE(rs.risk_seviyesi, 'Orta') as risk_seviyesi,
            COALESCE(rs.risk_faktorleri, '[]'::jsonb) as risk_faktorleri,
            dt.durum_adi as mevcut_durum,
            pt.program_adi,
            (ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) as danisman_adi
        FROM public.ogrenci o
        LEFT JOIN public.ogrenci_risk_skorlari rs ON o.ogrenci_id = rs.ogrenci_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        WHERE o.aktif_mi = true
          AND o.deleted_at IS NULL
          AND (rs.risk_seviyesi IN ('Yuksek', 'Kritik') OR o.gno < 2.0)
        ORDER BY rs.risk_skoru DESC NULLS LAST, o.gno ASC
    ) t;

    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

-- 2. DANIŞMAN ÖĞRENCİ LİSTESİ (Ders/Tez Aşaması Ayrımıyla)
CREATE OR REPLACE FUNCTION get_advisor_students_detail(advisor_id_param uuid)
RETURNS json
LANGUAGE plpgsql
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
            (o.ad || ' ' || o.soyad) as ad_soyad,
            o.avatar_url,
            o.gno,
            pt.program_adi,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
                ELSE 'Belirsiz'
            END as asama,
            CASE 
                WHEN pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%' THEN 'Tezli'
                ELSE 'Tezsiz'
            END as program_turu,
            dt.durum_adi as mevcut_durum
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        WHERE o.danisman_id = advisor_id_param
          AND o.aktif_mi = true
          AND o.deleted_at IS NULL
        ORDER BY 
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 1
                ELSE 2
            END,
            o.ogrenci_no
    ) t;

    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

-- 3. DERS BAŞARISIZLIK KARNESİ
CREATE OR REPLACE FUNCTION get_course_failure_report(course_code_param text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    course_info json;
    student_list json;
    grade_distribution json;
BEGIN
    -- Ders Bilgileri
    SELECT json_build_object(
        'ders_kodu', od.ders_kodu,
        'ders_adi', od.ders_adi,
        'ogretim_uyesi', COALESCE(
            MAX(ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) FILTER (WHERE ap.personel_id IS NOT NULL),
            'Atanmamış'
        ),
        'toplam_kayit', COUNT(DISTINCT od.ogrenci_id),
        'kalan_sayisi', COUNT(*) FILTER (WHERE od.basarili_mi = false),
        'basarisizlik_orani', ROUND(
            (COUNT(*) FILTER (WHERE od.basarili_mi = false)::numeric / 
             NULLIF(COUNT(*), 0)::numeric) * 100, 
            1
        ),
        'ortalama_not', ROUND(
            AVG(od.basari_katsayisi) FILTER (WHERE od.basari_katsayisi IS NOT NULL), 
            2
        )
    )
    INTO course_info
    FROM public.ogrenci_dersleri od
    LEFT JOIN public.acilan_dersler ad ON od.acilan_ders_id = ad.acilan_ders_id
    LEFT JOIN public.akademik_personel ap ON ad.ogretim_uyesi_id = ap.personel_id
    WHERE od.ders_kodu = course_code_param
      AND EXISTS (
          SELECT 1 
          FROM public.ogrenci o 
          WHERE o.ogrenci_id = od.ogrenci_id 
          AND o.aktif_mi = true
          AND o.deleted_at IS NULL
      )
    GROUP BY od.ders_kodu, od.ders_adi;

    -- Öğrenci Listesi (Başarısız olanlar önce)
    SELECT json_agg(row_to_json(t))
    INTO student_list
    FROM (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            (o.ad || ' ' || o.soyad) as ad_soyad,
            o.avatar_url,
            od.basarili_mi,
            od.basari_katsayisi,
            od.harf_notu,
            od.tekrar_sayisi
        FROM public.ogrenci_dersleri od
        JOIN public.ogrenci o ON od.ogrenci_id = o.ogrenci_id
        WHERE od.ders_kodu = course_code_param
          AND o.aktif_mi = true
          AND o.deleted_at IS NULL
        ORDER BY od.basarili_mi ASC, od.basari_katsayisi ASC
    ) t;

    -- Not Dağılımı (Histogram için)
    WITH grade_ranges AS (
        SELECT 
            CASE 
                WHEN od.basari_katsayisi >= 3.5 THEN 'AA-BA'
                WHEN od.basari_katsayisi >= 2.5 THEN 'BB-CB'
                WHEN od.basari_katsayisi >= 1.5 THEN 'CC-DC'
                WHEN od.basari_katsayisi >= 0.5 THEN 'DD-FD'
                ELSE 'FF'
            END as not_araligi,
            CASE 
                WHEN od.basari_katsayisi >= 3.5 THEN 1
                WHEN od.basari_katsayisi >= 2.5 THEN 2
                WHEN od.basari_katsayisi >= 1.5 THEN 3
                WHEN od.basari_katsayisi >= 0.5 THEN 4
                ELSE 5
            END as siralama
        FROM public.ogrenci_dersleri od
        JOIN public.ogrenci o ON od.ogrenci_id = o.ogrenci_id
        WHERE od.ders_kodu = course_code_param
          AND o.aktif_mi = true
          AND o.deleted_at IS NULL
    )
    SELECT json_agg(row_to_json(t))
    INTO grade_distribution
    FROM (
        SELECT 
            not_araligi,
            COUNT(*) as ogrenci_sayisi
        FROM grade_ranges
        GROUP BY not_araligi, siralama
        ORDER BY siralama
    ) t;

    -- Sonuç JSON
    result := json_build_object(
        'ders_bilgisi', course_info,
        'ogrenci_listesi', COALESCE(student_list, '[]'::json),
        'not_dagilimi', COALESCE(grade_distribution, '[]'::json)
    );

    RETURN result;
END;
$$;

-- 4. AKTİF TEZLER DETAY LİSTESİ
CREATE OR REPLACE FUNCTION get_active_theses_detail()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            t.tez_id,
            t.tez_baslik,
            t.durum,
            t.baslangic_tarihi,
            t.bitis_tarihi,
            o.ogrenci_no,
            (o.ad || ' ' || o.soyad) as ogrenci_adi,
            o.avatar_url,
            (ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) as danisman_adi,
            pt.program_adi
        FROM public.tezler t
        JOIN public.ogrenci o ON t.ogrenci_id = o.ogrenci_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        WHERE t.durum IN ('Oneri', 'Yazim', 'Juri', 'Duzeltme')
          AND o.aktif_mi = true
          AND o.deleted_at IS NULL
        ORDER BY 
            CASE t.durum
                WHEN 'Juri' THEN 1
                WHEN 'Yazim' THEN 2
                WHEN 'Duzeltme' THEN 3
                WHEN 'Oneri' THEN 4
                ELSE 5
            END,
            t.baslangic_tarihi DESC
    ) t;

    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

