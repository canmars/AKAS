-- SQL Function: Aşamaya göre öğrenci listesi getir
-- Bu fonksiyon funnel'daki bir aşamaya tıklandığında o aşamadaki öğrencileri döndürür

CREATE OR REPLACE FUNCTION public.get_students_by_stage(stage_name TEXT)
RETURNS TABLE (
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    danisman_adi TEXT,
    mevcut_yariyil INTEGER,
    gno NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.ogrenci_no,
        CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
        pt.program_adi,
        CONCAT(ap.ad, ' ', ap.soyad) AS danisman_adi,
        oad.mevcut_yariyil,
        o.gno
    FROM public.ogrenci o
    LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
    LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
    LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
    WHERE dt.durum_adi = stage_name
        AND o.aktif_mi = true
        AND o.deleted_at IS NULL
    ORDER BY o.ogrenci_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örneği:
-- SELECT * FROM get_students_by_stage('Ders Aşaması');
-- SELECT * FROM get_students_by_stage('Tez Aşaması');
-- SELECT * FROM get_students_by_stage('Mezun');
