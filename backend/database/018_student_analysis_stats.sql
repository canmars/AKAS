-- SQL Function: Öğrenci Analizi Sayfası İstatistikleri
-- Bu fonksiyon öğrenci analizi sayfasındaki istatistik kartları için veri döndürür

CREATE OR REPLACE FUNCTION public.get_student_analysis_stats()
RETURNS TABLE (
    toplam_ogrenci INTEGER,
    tez_asamasinda INTEGER,
    izlenmesi_gereken INTEGER,
    yuksek_riskli INTEGER,
    gecen_donem_artis INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH aktif_ogrenciler AS (
        SELECT 
            o.ogrenci_id,
            o.aktif_mi,
            oad.ders_tamamlandi_mi,
            ors.risk_seviyesi
        FROM public.ogrenci o
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
    ),
    tez_asamasindakiler AS (
        SELECT COUNT(*)::INTEGER as sayi
        FROM aktif_ogrenciler
        WHERE ders_tamamlandi_mi = true
    ),
    izlenmesi_gerekenler AS (
        SELECT COUNT(*)::INTEGER as sayi
        FROM aktif_ogrenciler
        WHERE risk_seviyesi IN ('Orta', 'Yuksek')
    ),
    yuksek_riskliler AS (
        SELECT COUNT(*)::INTEGER as sayi
        FROM aktif_ogrenciler
        WHERE risk_seviyesi IN ('Kritik', 'Yuksek')
    )
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM aktif_ogrenciler) as toplam_ogrenci,
        (SELECT sayi FROM tez_asamasindakiler) as tez_asamasinda,
        (SELECT sayi FROM izlenmesi_gerekenler) as izlenmesi_gereken,
        (SELECT sayi FROM yuksek_riskliler) as yuksek_riskli,
        0::INTEGER as gecen_donem_artis -- Bu değer şimdilik 0, ileride hesaplanabilir
    ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örneği:
-- SELECT * FROM get_student_analysis_stats();

