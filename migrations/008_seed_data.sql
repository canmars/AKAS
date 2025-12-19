-- Migration 008: Seed Data
-- Başlangıç verileri: program türleri, durum türleri, bildirim türleri, anabilim dalları

-- ============================================
-- PROGRAM TURLERI
-- ============================================
INSERT INTO public.program_turleri (program_adi, program_kodu, maksimum_sure_yil, maksimum_sure_yariyil) VALUES
('Doktora', 'Doktora', 6, 12),
('Tezli Yüksek Lisans', 'Tezli_YL', 3, 6),
('Tezsiz Yüksek Lisans (İÖ)', 'Tezsiz_YL_IO', 1.5, 3),
('Tezsiz Yüksek Lisans (Uzaktan)', 'Tezsiz_YL_Uzaktan', 1.5, 3)
ON CONFLICT (program_kodu) DO NOTHING;

-- ============================================
-- ANABILIM DALLARI
-- ============================================
INSERT INTO public.anabilim_dallari (anabilim_dali_adi, anabilim_dali_kodu) VALUES
('Coğrafi Bilgi Sistemleri', 'CBS'),
('Enformasyon Teknolojisi', 'ET')
ON CONFLICT (anabilim_dali_kodu) DO NOTHING;

-- ============================================
-- DURUM TURLERI
-- ============================================
INSERT INTO public.durum_turleri (durum_adi, durum_kodu, sira_no, aciklama) VALUES
('Aktif', 'Aktif', 1, 'Öğrenci aktif olarak eğitimine devam ediyor'),
('Dondurdu', 'Dondurdu', 2, 'Öğrenci eğitimine ara vermiş'),
('Pasif', 'Pasif', 3, 'Öğrencinin üniversite ile ilişiği kesilmiş')
ON CONFLICT (durum_kodu) DO NOTHING;

-- ============================================
-- BILDIRIM TURLERI
-- ============================================
INSERT INTO public.bildirim_turleri (bildirim_turu_adi, bildirim_turu_kodu, varsayilan_oncelik, varsayilan_alici_roller) VALUES
('TİK Uyarısı', 'TIK_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani']),
('Hayalet Öğrenci', 'Hayalet_Ogrenci', 'Kritik', ARRAY['Bolum_Baskani']),
('Risk Bildirimi', 'Risk_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani']),
('Süre Aşımı Uyarısı', 'Sure_Asimi_Uyari', 'Kritik', ARRAY['Bolum_Baskani']),
('Yeterlik Süresi Uyarısı', 'Yeterlik_Sure_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani']),
('Tez Önerisi Süresi Uyarısı', 'Tez_Onersi_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani']),
('Ders Tamamlama Uyarısı', 'Ders_Tamam_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani']),
('Dönem Projesi Uyarısı', 'Donem_Projesi_Uyari', 'Yuksek', ARRAY['Danisman', 'Bolum_Baskani'])
ON CONFLICT (bildirim_turu_kodu) DO NOTHING;

-- ============================================
-- SISTEM AYARLARI (Varsayılan)
-- ============================================
INSERT INTO public.sistem_ayarlari (ayar_anahtari, ayar_degeri, ayar_turu, aciklama, guncellenebilir_mi) VALUES
('tik_uyari_suresi_gun', '30', 'Integer', 'TİK toplantısı için kaç gün önceden uyarı verileceği', true),
('hayalet_ogrenci_sure_ay', '6', 'Integer', 'Hayalet öğrenci tespiti için kaç ay login olmamalı', true),
('risk_hesaplama_periyodu_gun', '7', 'Integer', 'Risk skoru hesaplama periyodu (gün)', true),
('maksimum_ogrenci_kapasitesi_prof', '15', 'Integer', 'Prof. Dr. için maksimum öğrenci kapasitesi', true),
('maksimum_ogrenci_kapasitesi_doc', '12', 'Integer', 'Doç. Dr. için maksimum öğrenci kapasitesi', true),
('maksimum_ogrenci_kapasitesi_dr', '10', 'Integer', 'Dr. Öğr. Üyesi için maksimum öğrenci kapasitesi', true),
('maksimum_ogrenci_kapasitesi_arastirma', '5', 'Integer', 'Araştırma Görevlisi için maksimum öğrenci kapasitesi', true)
ON CONFLICT (ayar_anahtari) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.program_turleri IS 'Lisansüstü program türleri seed data';
COMMENT ON TABLE public.anabilim_dallari IS 'Anabilim dalları seed data';
COMMENT ON TABLE public.durum_turleri IS 'Öğrenci durum türleri seed data';
COMMENT ON TABLE public.bildirim_turleri IS 'Bildirim türleri seed data';
COMMENT ON TABLE public.sistem_ayarlari IS 'Sistem ayarları varsayılan değerleri';

