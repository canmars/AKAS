-- SQL Function: Geliştirilmiş Öğrenci Listesi
-- Bu fonksiyon öğrenci analizi sayfası için kayıt tarihi ve aşama bilgisiyle birlikte öğrenci listesi döndürür

-- Not: Bu fonksiyon mevcut getStudentsList model fonksiyonunu desteklemek için kullanılabilir
-- veya doğrudan Supabase query'si ile de yapılabilir

-- Öğrenci listesi için view oluştur (opsiyonel, performans için)
CREATE OR REPLACE VIEW public.view_ogrenci_listesi AS
SELECT 
    o.ogrenci_id,
    o.ogrenci_no,
    o.ad,
    o.soyad,
    o.kayit_tarihi,
    o.gno,
    o.aktif_mi,
    pt.program_adi,
    pt.program_turu_id,
    dt.durum_adi as guncel_asama,
    dt.durum_id,
    CONCAT(ap.unvan, ' ', ap.ad, ' ', ap.soyad) as danisman_adi,
    ors.risk_skoru,
    ors.risk_seviyesi,
    oad.mevcut_yariyil,
    oad.ders_tamamlandi_mi,
    CASE 
        WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
        WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
        ELSE dt.durum_adi
    END as hesaplanan_asama
FROM public.ogrenci o
LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
WHERE o.deleted_at IS NULL;

-- View için RLS policy (eğer RLS aktifse)
-- ALTER VIEW public.view_ogrenci_listesi SET (security_invoker = true);

