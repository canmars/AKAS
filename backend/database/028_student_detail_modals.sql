-- SQL Functions: Öğrenci Analizi Detay Modal Fonksiyonları
-- Program ve Aşama dağılımı için detaylı öğrenci listesi döndüren fonksiyonlar

-- 1. Program Dağılımı Detayı
CREATE OR REPLACE FUNCTION public.get_program_distribution_detail(
    program_tipi TEXT,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    guncel_asama TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH program_filtreli_ogrenciler AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
                ELSE dt.durum_adi
            END as guncel_asama,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND (
                (program_tipi = 'Doktora' AND pt.program_kodu = 'DOKTORA')
                OR (program_tipi = 'Yüksek Lisans' AND (pt.program_kodu LIKE 'TEZLI_YL%' OR pt.program_kodu LIKE 'TEZSIZ_YL%'))
                OR (program_tipi = 'Lisans' AND o.kabul_turu = 'Lisans')
            )
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM program_filtreli_ogrenciler
    )
    SELECT 
        po.ogrenci_id,
        po.ogrenci_no,
        po.ad_soyad,
        po.program_adi,
        po.guncel_asama,
        po.kayit_tarihi,
        po.gno,
        po.risk_seviyesi,
        po.risk_skoru,
        po.danisman_adi,
        t.cnt as total_count
    FROM program_filtreli_ogrenciler po
    CROSS JOIN total t
    ORDER BY po.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Aşama Dağılımı Detayı
CREATE OR REPLACE FUNCTION public.get_stage_distribution_detail(
    durum_kodu TEXT,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    guncel_asama TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    mevcut_yariyil INTEGER,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH asama_filtreli_ogrenciler AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            dt.durum_adi as guncel_asama,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi,
            COALESCE(oad.mevcut_yariyil, 1) as mevcut_yariyil
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND dt.durum_kodu = durum_kodu
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM asama_filtreli_ogrenciler
    )
    SELECT 
        ao.ogrenci_id,
        ao.ogrenci_no,
        ao.ad_soyad,
        ao.program_adi,
        ao.guncel_asama,
        ao.kayit_tarihi,
        ao.gno,
        ao.risk_seviyesi,
        ao.risk_skoru,
        ao.danisman_adi,
        ao.mevcut_yariyil,
        t.cnt as total_count
    FROM asama_filtreli_ogrenciler ao
    CROSS JOIN total t
    ORDER BY ao.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örnekleri:
-- SELECT * FROM get_program_distribution_detail('Doktora', 1, 20);
-- SELECT * FROM get_program_distribution_detail('Yüksek Lisans', 1, 20);
-- SELECT * FROM get_program_distribution_detail('Lisans', 1, 20);
-- SELECT * FROM get_stage_distribution_detail('DERS_ASAMASI', 1, 20);
-- SELECT * FROM get_stage_distribution_detail('TEZ_ASAMASI', 1, 20);

