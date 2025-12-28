-- SQL Function: Öğrenci Analizi Sayfası İstatistikleri V2
-- Bu fonksiyon öğrenci analizi sayfasındaki yeni KPI kartları için veri döndürür

CREATE OR REPLACE FUNCTION public.get_student_analysis_kpis_v2()
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
        WITH aktif_ogrenciler AS (
            SELECT 
                o.ogrenci_id,
                o.aktif_mi,
                o.kayit_tarihi,
                o.mezuniyet_tarihi,
                oad.ders_tamamlandi_mi,
                COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi
            FROM public.ogrenci o
            LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
            LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
        ),
        toplam_aktif AS (
            SELECT COUNT(*)::INTEGER as sayi
            FROM aktif_ogrenciler
        ),
        tez_asamasindakiler AS (
            -- Tez aşamasında olan öğrenciler (ders tamamladı ama mezun olmadı)
            SELECT COUNT(DISTINCT o.ogrenci_id)::INTEGER as sayi
            FROM public.ogrenci o
            LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
                AND oad.ders_tamamlandi_mi = true
        ),
        danisman_bekleyenler AS (
            -- Danışman bekleyen öğrenciler (Basit ve Kritik KPI)
            SELECT COUNT(DISTINCT o.ogrenci_id)::INTEGER as sayi
            FROM public.ogrenci o
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
                AND o.danisman_id IS NULL -- FIXED: Removing illegal empty string comparison for UUID
        ),
        kritik_riskliler AS (
            -- Modal ile aynı filtreyi kullan: Kritik VE Yüksek risk
            SELECT COUNT(DISTINCT o.ogrenci_id)::INTEGER as sayi
            FROM public.ogrenci o
            LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
                AND (ors.risk_seviyesi IN ('Kritik', 'Yuksek') OR o.gno < 2.0)
        )
        SELECT 
            (SELECT sayi FROM toplam_aktif) as toplam_aktif_ogrenci,
            0::NUMERIC as toplam_aktif_ogrenci_artis, -- Placeholder, ileride hesaplanabilir
            (SELECT sayi FROM tez_asamasindakiler) as tez_asamasinda_ogrenci,
            (SELECT sayi FROM danisman_bekleyenler) as danisman_bekleyen_ogrenci,
            (SELECT sayi FROM kritik_riskliler) as kritik_riskli_ogrenci,
            0::NUMERIC as kritik_riskli_artis -- Placeholder, ileride hesaplanabilir
    ) t;

    -- Return empty object instead of null
    IF result IS NULL THEN
        result := '[{}]'::json;
    END IF;

    RETURN result;
END;
$$;
