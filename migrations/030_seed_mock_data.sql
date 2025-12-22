-- Migration 030: Seed Mock Data
-- 50 öğrenci, akademik personel (JSON'dan), referans veriler
-- Detaylı mock veri ekleme (manuel insert)
-- ============================================

-- ============================================
-- ÖNCE: GEREKLİ KOLONLARI EKLEME
-- ============================================
-- Bu migration'dan ÖNCE çalıştırılmalı, ama buraya dahil ediyoruz

-- 1. DERSLER TABLOSUNA PROGRAM_TURU_ID KOLONU
-- program_turu_id kolonu ekle (program_turleri tablosuna FK)
ALTER TABLE IF EXISTS public.dersler
    ADD COLUMN IF NOT EXISTS program_turu_id UUID REFERENCES public.program_turleri(program_turu_id);

-- İndeks
CREATE INDEX IF NOT EXISTS idx_dersler_program_turu ON public.dersler(program_turu_id) WHERE program_turu_id IS NOT NULL;

COMMENT ON COLUMN public.dersler.program_turu_id IS 'Dersin okutulduğu program türü (program_turleri tablosuna FK) - NULL ise tüm programlarda okutulur';

-- 2. AKADEMİK PERSONEL TABLOSUNA ANABİLİM DALI BAŞKANI KOLONU
-- anabilim_dali_baskani_mi kolonu ekle
ALTER TABLE IF EXISTS public.akademik_personel
    ADD COLUMN IF NOT EXISTS anabilim_dali_baskani_mi BOOLEAN DEFAULT false;

-- İndeks
CREATE INDEX IF NOT EXISTS idx_akademik_personel_anabilim_dali_baskani 
    ON public.akademik_personel(anabilim_dali_baskani_mi) 
    WHERE anabilim_dali_baskani_mi = true;

CREATE INDEX IF NOT EXISTS idx_akademik_personel_anabilim_dali_baskani_kombinasyon
    ON public.akademik_personel(anabilim_dali_id, anabilim_dali_baskani_mi)
    WHERE anabilim_dali_baskani_mi = true;

COMMENT ON COLUMN public.akademik_personel.anabilim_dali_baskani_mi IS 
    'Anabilim dalı başkanı mı? (true/false) - Bir kişi hem bölüm başkanı hem anabilim dalı başkanı olabilir';

-- 3. OGRENCI TABLOSUNA KABUL_TURU KOLONU
-- kabul_turu kolonu ekle (Lisans veya Yuksek_Lisans)
ALTER TABLE IF EXISTS public.ogrenci
    ADD COLUMN IF NOT EXISTS kabul_turu TEXT CHECK (kabul_turu IN ('Lisans', 'Yuksek_Lisans'));

-- İndeks
CREATE INDEX IF NOT EXISTS idx_ogrenci_kabul_turu ON public.ogrenci(kabul_turu) WHERE kabul_turu IS NOT NULL;

COMMENT ON COLUMN public.ogrenci.kabul_turu IS 'Öğrencinin kabul türü: Lisans veya Yuksek_Lisans - Analiz için gerekli';

-- ============================================
-- MOCK VERİ EKLEME
-- ============================================

-- ============================================
-- 1. REFERANS VERİLER
-- ============================================

-- Program Türleri
INSERT INTO public.program_turleri (program_turu_id, program_kodu, program_adi, maksimum_sure_yil, maksimum_sure_yariyil, aktif_mi) VALUES
  (gen_random_uuid(), 'DOKTORA', 'Doktora', 8, 16, true),
  (gen_random_uuid(), 'TEZLI_YL', 'Tezli Yüksek Lisans', 4, 8, true),
  (gen_random_uuid(), 'TEZSIZ_IO', 'Tezsiz Yüksek Lisans (İÖ)', 3, 6, true),
  (gen_random_uuid(), 'TEZSIZ_UZAKTAN', 'Tezsiz Yüksek Lisans (Uzaktan)', 3, 6, true)
ON CONFLICT DO NOTHING;

-- Anabilim Dalları
INSERT INTO public.anabilim_dallari (anabilim_dali_id, anabilim_dali_kodu, anabilim_dali_adi, aktif_mi) VALUES
  (gen_random_uuid(), 'CBS', 'Coğrafi Bilgi Sistemleri', true),
  (gen_random_uuid(), 'ET', 'E-Ticaret', true)
ON CONFLICT DO NOTHING;

-- Durum Türleri
INSERT INTO public.durum_turleri (durum_id, durum_kodu, durum_adi, sira_no, aciklama) VALUES
  (gen_random_uuid(), 'Aktif', 'Aktif', 1, 'Aktif öğrenci'),
  (gen_random_uuid(), 'Dondurdu', 'Dondurdu', 2, 'Kayıt donduruldu'),
  (gen_random_uuid(), 'Pasif', 'Pasif', 3, 'Pasif öğrenci'),
  (gen_random_uuid(), 'Mezun', 'Mezun', 4, 'Mezun olan öğrenci'),
  (gen_random_uuid(), 'Ilisik_Kesildi', 'İlişik Kesildi', 5, 'İlişik kesilen öğrenci')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. DERSLER (JSON'dan alınan dersler)
-- ============================================

-- Dersler JSON dosyasından alınacak, ders_turu kolonu eksik olduğu için üretilecek
-- Seminer, Tez, Dönem Projesi dersleri özel türde, diğerleri Seçmeli veya Zorunlu olarak işaretlenecek
-- program_turu_id JSON'daki program_seviyesi bilgisine göre atanacak

DO $$
DECLARE
  v_doktora_id UUID;
  v_tezli_yl_id UUID;
  v_tezsiz_io_id UUID;
  v_tezsiz_uzaktan_id UUID;
BEGIN
  -- Program ID'lerini al
  SELECT program_turu_id INTO v_doktora_id FROM public.program_turleri WHERE program_kodu = 'DOKTORA' LIMIT 1;
  SELECT program_turu_id INTO v_tezli_yl_id FROM public.program_turleri WHERE program_kodu = 'TEZLI_YL' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_io_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_IO' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_uzaktan_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_UZAKTAN' LIMIT 1;

  -- Tezli YL Dersleri
  INSERT INTO public.dersler (ders_kodu, ders_adi, ders_turu, akts, aktif_mi, program_turu_id) VALUES
    ('İYO 5025', 'Yönetim ve Organizasyon', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('SBE 5000', 'Bilimsel Araştırma Teknikleri ve Yayın Etiği', 'Zorunlu', 5, true, v_tezli_yl_id),
    ('YBS 5008', 'Sosyal Medya ve İnternet Reklamcılığı', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5010', 'Yönetim Bilişim Sistemlerinde Güncel Yaklaşımlar', 'Zorunlu', 6, true, v_tezli_yl_id),
    ('YBS 5016', 'Kurumsal Kaynak Planlaması', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5020', 'Mekansal Veri Yönetimi ve Analizi', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5022', 'Veri Görselleştirme ve Raporlama Teknikleri', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5023', 'Yönetim Bilişim Sistemleri', 'Zorunlu', 9, true, v_tezli_yl_id),
    ('YBS 5024', 'Bilgi Güvenliği', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5026', 'Veritabanı Yönetim Sistemleri', 'Zorunlu', 6, true, v_tezli_yl_id),
    ('YBS 5028', 'Bilişim Sistemleri ve Teknolojileri', 'Zorunlu', 6, true, v_tezli_yl_id),
    ('YBS 5030', 'Üretim İşlemler Yönetimi', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5032', 'Karar Verme Teknikleri', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5034', 'Bulut Bilişim', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5036', 'Web Uygulamaları', 'Seçmeli', 6, true, v_tezli_yl_id),
    ('YBS 5041', 'E-İş ve E-Ticaret', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5043', 'Bilişim Hukuku', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5045', 'Yazılım Geliştirme', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5049', 'Mekansal Bilgi Sistemleri', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5051', 'Sistem ve Proje Yönetimi', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5053', 'Araştırma Yöntemleri', 'Zorunlu', 8, true, v_tezli_yl_id),
    ('YBS 5055', 'Veri Madenciliği', 'Seçmeli', 8, true, v_tezli_yl_id),
    ('YBS 5096', 'Seminer', 'Seminer', 3, true, v_tezli_yl_id),
    ('YBS 5098', 'Uzmanlık Alanı', 'Seçmeli', 3, true, v_tezli_yl_id),
    ('YBS 5099', 'Tez', 'Tez', 30, true, v_tezli_yl_id);
  
  -- Doktora Dersleri
  INSERT INTO public.dersler (ders_kodu, ders_adi, ders_turu, akts, aktif_mi, program_turu_id) VALUES
    ('SBE 6000', 'Bilim Felsefesi ve Etiği', 'Zorunlu', 5, true, v_doktora_id),
    ('YBS 6002', 'İşletmeler için İleri Seviye Sosyal Medya Analizi', 'Seçmeli', 7, true, v_doktora_id),
    ('YBS 6003', 'İş Süreci Yönetimi', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6004', 'Bilgi Sistemleri Tasarımı ve Ergonomi', 'Seçmeli', 9, true, v_doktora_id),
    ('YBS 6005', 'Veri Analizi', 'Zorunlu', 8, true, v_doktora_id),
    ('YBS 6006', 'Bilgi ve İletişim Teknolojileri ve Kurumsal Dönüşüm', 'Seçmeli', 9, true, v_doktora_id),
    ('YBS 6007', 'Veri ve Süreç Modelleme', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6008', 'İş Analitiği', 'Seçmeli', 9, true, v_doktora_id),
    ('YBS 6009', 'İleri Düzey Raporlama ve Veri Tabanı Uygulamaları', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6010', 'İleri Düzey Programlama', 'Seçmeli', 9, true, v_doktora_id),
    ('YBS 6011', 'Büyük Veri Yönetimi', 'Seçmeli', 7, true, v_doktora_id),
    ('YBS 6013', 'Kurumsal İş Modelleri ve Optimizasyon Teknikleri', 'Seçmeli', 7, true, v_doktora_id),
    ('YBS 6014', 'Bulut Bilişim Tasarımı ve Uygulamasında İleri Seviye Araştırmalar', 'Seçmeli', 9, true, v_doktora_id),
    ('YBS 6016', 'Uzman Sistemler', 'Seçmeli', 7, true, v_doktora_id),
    ('YBS 6018', 'Mekansal Veri Madenciliği', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6023', 'Anlamsal Web', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6025', 'İleri Düzey Kurumsal Kaynak Planlaması', 'Seçmeli', 8, true, v_doktora_id),
    ('YBS 6027', 'Yönetim Bilişim Sistemlerinde Güncel Araştırmalar', 'Zorunlu', 8, true, v_doktora_id),
    ('YBS 6196', 'Seminer', 'Seminer', 3, true, v_doktora_id),
    ('YBS 6198', 'Uzmanlık Alanı', 'Seçmeli', 18, true, v_doktora_id),
    ('YBS 6199', 'Tez', 'Tez', 30, true, v_doktora_id);
  
  -- Tezsiz YL Dersleri (İÖ)
  INSERT INTO public.dersler (ders_kodu, ders_adi, ders_turu, akts, aktif_mi, program_turu_id) VALUES
    ('YBS 7299', 'Dönem Projesi', 'Proje', 5, true, v_tezsiz_io_id),
    ('YBS 7300', 'Bilişim Sistemleri ve Teknolojileri', 'Zorunlu', 5, true, v_tezsiz_io_id),
    ('YBS 7301', 'Yönetim Bilişim Sistemleri', 'Zorunlu', 6, true, v_tezsiz_io_id),
    ('YBS 7302', 'Veritabanı Yönetim Sistemleri', 'Zorunlu', 5, true, v_tezsiz_io_id),
    ('YBS 7303', 'Yazılım Geliştirme', 'Seçmeli', 6, true, v_tezsiz_io_id),
    ('YBS 7304', 'Karar Verme Teknikleri', 'Seçmeli', 5, true, v_tezsiz_io_id),
    ('YBS 7305', 'Araştırma Yöntemleri', 'Zorunlu', 6, true, v_tezsiz_io_id),
    ('YBS 7306', 'Veri Madenciliği', 'Seçmeli', 5, true, v_tezsiz_io_id),
    ('YBS 7307', 'Sistem ve Proje Yönetimi', 'Seçmeli', 6, true, v_tezsiz_io_id),
    ('YBS 7308', 'Bulut Bilişim', 'Seçmeli', 5, true, v_tezsiz_io_id),
    ('YBS 7309', 'Mekansal Bilgi Sistemleri', 'Seçmeli', 6, true, v_tezsiz_io_id),
    ('YBS 7310', 'Sosyal Medya ve İnternet Reklamcılığı', 'Seçmeli', 5, true, v_tezsiz_io_id),
    ('YBS 7311', 'Web Uygulamaları', 'Seçmeli', 6, true, v_tezsiz_io_id),
    ('YBS 7312', 'Kurumsal Kaynak Planlaması', 'Seçmeli', 5, true, v_tezsiz_io_id),
    ('YBS 7313', 'Bilişim Hukuku', 'Seçmeli', 6, true, v_tezsiz_io_id);
  
  -- Tezsiz YL Uzaktan Dersleri
  INSERT INTO public.dersler (ders_kodu, ders_adi, ders_turu, akts, aktif_mi, program_turu_id) VALUES
    ('YBS 8122', 'Bilişim Sistemleri ve Teknolojileri', 'Zorunlu', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8124', 'Veri Tabanı Yönetim Sistemleri', 'Zorunlu', 7, true, v_tezsiz_uzaktan_id),
    ('YBS 8126', 'Kurumsal Kaynak Planlaması', 'Seçmeli', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8128', 'Karar Verme Teknikleri', 'Seçmeli', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8130', 'Veri Madenciliği', 'Seçmeli', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8136', 'Bulut Bilişim', 'Seçmeli', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8138', 'Araştırma Yöntemleri', 'Zorunlu', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8140', 'Sosyal Medya ve İnternet Reklamcılığı', 'Seçmeli', 3, true, v_tezsiz_uzaktan_id),
    ('YBS 8145', 'Yönetim Bilişim Sistemleri', 'Zorunlu', 6, true, v_tezsiz_uzaktan_id),
    ('YBS 8147', 'Yazılım Geliştirme', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8151', 'Mekansal Bilgi Sistemleri', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8153', 'Sistem ve Proje Yönetimi', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8155', 'Web Uygulamaları', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8157', 'Bilişim Hukuku', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8159', 'E-İş E-Ticaret', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8161', 'Yapay Zeka Uygulamaları', 'Seçmeli', 4, true, v_tezsiz_uzaktan_id),
    ('YBS 8299', 'Dönem Projesi', 'Proje', 5, true, v_tezsiz_uzaktan_id)
  ON CONFLICT (ders_kodu) DO NOTHING;
END $$;

-- ============================================
-- 3. AŞAMA TANIMLARI (Her Program İçin)
-- ============================================

-- Program ID'lerini almak için DO bloğu
DO $$
DECLARE
  v_doktora_id UUID;
  v_tezli_yl_id UUID;
  v_tezsiz_io_id UUID;
  v_tezsiz_uzaktan_id UUID;
BEGIN
  -- Program ID'lerini al
  SELECT program_turu_id INTO v_doktora_id FROM public.program_turleri WHERE program_kodu = 'DOKTORA' LIMIT 1;
  SELECT program_turu_id INTO v_tezli_yl_id FROM public.program_turleri WHERE program_kodu = 'TEZLI_YL' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_io_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_IO' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_uzaktan_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_UZAKTAN' LIMIT 1;

  -- DOKTORA AŞAMALARI
  INSERT INTO public.asama_tanimlari (program_turu_id, asama_kodu, asama_adi, sira_no, azami_sure_yariyil, azami_sure_yil, gecis_kosullari, kontrol_verileri, aciklama) VALUES
    (v_doktora_id, 'DERS_DONEMI', 'Ders Dönemi', 1, 6, 3, '{"sonraki_asama": "YETERLIK_SINAVI", "kosullar": ["DERSLER_TAMAMLANDI", "GENEL_NOT_ORTALAMASI", "GECME_NOTU"]}'::jsonb, ARRAY['toplam_akts', 'genel_not_ortalamasi', 'ders_notlari', 'seminer_durumu'], 'Öğrenci kredili derslerini ve seminer dersini tamamlamakla yükümlüdür'),
    (v_doktora_id, 'YETERLIK_SINAVI', 'Doktora Yeterlik Sınavı', 2, 2, 1, '{"sonraki_asama": "TEZ_ONERISI", "kosullar": ["YAZILI_SINAV_BASARILI", "SOZLU_SINAV_BASARILI"]}'::jsonb, ARRAY['yazili_sinav_puani', 'sozlu_sinav_sonucu'], 'Öğrencinin alanındaki derinlemesine bilgisinin ölçülmesi'),
    (v_doktora_id, 'TEZ_ONERISI', 'Tez Önerisi Savunması', 3, 2, 1, '{"sonraki_asama": "TEZ_CALISMASI", "kosullar": ["TEZ_ONERISI_KABUL"]}'::jsonb, ARRAY['tez_konusu', 'oneri_sonucu'], 'Tez önerisi sunumu ve kabulü'),
    (v_doktora_id, 'TEZ_CALISMASI', 'Tez Çalışması', 4, 8, 4, '{"sonraki_asama": "TEZ_SAVUNMA", "kosullar": ["TIK_TOPLANTILARI_BASARILI", "TEZ_TAMAMLANDI"]}'::jsonb, ARRAY['tik_toplantilari', 'tez_ilerleme'], 'Tez yazım süreci ve TİK toplantıları'),
    (v_doktora_id, 'TEZ_SAVUNMA', 'Tez Savunma', 5, 1, 0.5, '{"sonraki_asama": "MEZUNIYET", "kosullar": ["TEZ_SAVUNMA_BASARILI"]}'::jsonb, ARRAY['savunma_sonucu', 'juri_karari'], 'Tez savunma sınavı'),
    (v_doktora_id, 'MEZUNIYET', 'Mezuniyet', 6, 0, 0, '{}'::jsonb, ARRAY['mezuniyet_tarihi'], 'Mezuniyet işlemleri')
  ON CONFLICT (program_turu_id, asama_kodu) DO NOTHING;

  -- TEZLI YÜKSEK LİSANS AŞAMALARI
  INSERT INTO public.asama_tanimlari (program_turu_id, asama_kodu, asama_adi, sira_no, azami_sure_yariyil, azami_sure_yil, gecis_kosullari, kontrol_verileri, aciklama) VALUES
    (v_tezli_yl_id, 'DERS_DONEMI', 'Ders Dönemi', 1, 4, 2, '{"sonraki_asama": "TEZ_ONERISI", "kosullar": ["DERSLER_TAMAMLANDI", "GENEL_NOT_ORTALAMASI"]}'::jsonb, ARRAY['toplam_akts', 'genel_not_ortalamasi', 'ders_notlari'], 'Öğrenci kredili derslerini tamamlamakla yükümlüdür'),
    (v_tezli_yl_id, 'TEZ_ONERISI', 'Tez Önerisi', 2, 1, 0.5, '{"sonraki_asama": "TEZ_CALISMASI", "kosullar": ["TEZ_ONERISI_KABUL"]}'::jsonb, ARRAY['tez_konusu', 'oneri_sonucu'], 'Tez önerisi sunumu ve kabulü'),
    (v_tezli_yl_id, 'TEZ_CALISMASI', 'Tez Çalışması', 3, 4, 2, '{"sonraki_asama": "TEZ_SAVUNMA", "kosullar": ["TEZ_TAMAMLANDI"]}'::jsonb, ARRAY['tez_ilerleme'], 'Tez yazım süreci'),
    (v_tezli_yl_id, 'TEZ_SAVUNMA', 'Tez Savunma', 4, 1, 0.5, '{"sonraki_asama": "MEZUNIYET", "kosullar": ["TEZ_SAVUNMA_BASARILI"]}'::jsonb, ARRAY['savunma_sonucu'], 'Tez savunma sınavı'),
    (v_tezli_yl_id, 'MEZUNIYET', 'Mezuniyet', 5, 0, 0, '{}'::jsonb, ARRAY['mezuniyet_tarihi'], 'Mezuniyet işlemleri')
  ON CONFLICT (program_turu_id, asama_kodu) DO NOTHING;

  -- TEZSIZ İKİNCİ ÖĞRETİM AŞAMALARI
  INSERT INTO public.asama_tanimlari (program_turu_id, asama_kodu, asama_adi, sira_no, azami_sure_yariyil, azami_sure_yil, gecis_kosullari, kontrol_verileri, aciklama) VALUES
    (v_tezsiz_io_id, 'DERS_DONEMI', 'Ders Dönemi', 1, 4, 2, '{"sonraki_asama": "DONEM_PROJESI", "kosullar": ["DERSLER_TAMAMLANDI", "GENEL_NOT_ORTALAMASI"]}'::jsonb, ARRAY['toplam_akts', 'genel_not_ortalamasi', 'ders_notlari'], 'Öğrenci kredili derslerini tamamlamakla yükümlüdür'),
    (v_tezsiz_io_id, 'DONEM_PROJESI', 'Dönem Projesi', 2, 1, 0.5, '{"sonraki_asama": "YETERLIK_SINAVI", "kosullar": ["PROJE_TAMAMLANDI"]}'::jsonb, ARRAY['proje_durumu'], 'Dönem projesi tamamlama'),
    (v_tezsiz_io_id, 'YETERLIK_SINAVI', 'Yeterlik Sınavı', 3, 1, 0.5, '{"sonraki_asama": "MEZUNIYET", "kosullar": ["YETERLIK_SINAVI_BASARILI"]}'::jsonb, ARRAY['sinav_sonucu'], 'Yeterlik sınavı'),
    (v_tezsiz_io_id, 'MEZUNIYET', 'Mezuniyet', 4, 0, 0, '{}'::jsonb, ARRAY['mezuniyet_tarihi'], 'Mezuniyet işlemleri')
  ON CONFLICT (program_turu_id, asama_kodu) DO NOTHING;

  -- TEZSIZ UZAKTAN ÖĞRETİM AŞAMALARI
  INSERT INTO public.asama_tanimlari (program_turu_id, asama_kodu, asama_adi, sira_no, azami_sure_yariyil, azami_sure_yil, gecis_kosullari, kontrol_verileri, aciklama) VALUES
    (v_tezsiz_uzaktan_id, 'DERS_DONEMI', 'Ders Dönemi', 1, 4, 2, '{"sonraki_asama": "DONEM_PROJESI", "kosullar": ["DERSLER_TAMAMLANDI", "GENEL_NOT_ORTALAMASI"]}'::jsonb, ARRAY['toplam_akts', 'genel_not_ortalamasi', 'ders_notlari'], 'Öğrenci kredili derslerini tamamlamakla yükümlüdür'),
    (v_tezsiz_uzaktan_id, 'DONEM_PROJESI', 'Dönem Projesi', 2, 1, 0.5, '{"sonraki_asama": "YETERLIK_SINAVI", "kosullar": ["PROJE_TAMAMLANDI"]}'::jsonb, ARRAY['proje_durumu'], 'Dönem projesi tamamlama'),
    (v_tezsiz_uzaktan_id, 'YETERLIK_SINAVI', 'Yeterlik Sınavı', 3, 1, 0.5, '{"sonraki_asama": "MEZUNIYET", "kosullar": ["YETERLIK_SINAVI_BASARILI"]}'::jsonb, ARRAY['sinav_sonucu'], 'Yeterlik sınavı'),
    (v_tezsiz_uzaktan_id, 'MEZUNIYET', 'Mezuniyet', 4, 0, 0, '{}'::jsonb, ARRAY['mezuniyet_tarihi'], 'Mezuniyet işlemleri')
  ON CONFLICT (program_turu_id, asama_kodu) DO NOTHING;
END $$;

-- ============================================
-- 4. AKADEMİK PERSONEL (SADECE JSON'DAN - 8 KİŞİ)
-- ============================================

-- Anabilim dalı ID'lerini almak için DO bloğu
DO $$
DECLARE
  v_cbs_id UUID;
  v_et_id UUID;
  v_personel_id UUID;
BEGIN
  -- Anabilim dalı ID'lerini al
  SELECT anabilim_dali_id INTO v_cbs_id FROM public.anabilim_dallari WHERE anabilim_dali_kodu = 'CBS' LIMIT 1;
  SELECT anabilim_dali_id INTO v_et_id FROM public.anabilim_dallari WHERE anabilim_dali_kodu = 'ET' LIMIT 1;

  -- JSON'dan alınan akademik personel (8 kişi)
  -- 1. Vahap TECİM - Prof. Dr. - CBS - Bölüm Başkanı + Anabilim Dalı Başkanı
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol, anabilim_dali_baskani_mi) VALUES
    (v_cbs_id, 'Prof. Dr.', 'Vahap', 'Tecim', 'vahap.tecim@deu.edu.tr', '0232-1234567', 15, 15, 12, true, 'Bolum_Baskani', true)
  RETURNING personel_id INTO v_personel_id;

  -- 2. Kaan YARALIOĞLU - Prof. Dr. - ET - Anabilim Dalı Başkanı (Bölüm Başkanı olarak değil, sadece anabilim dalı başkanı)
  -- NOT: JSON'da sadece anabilim_dali_baskani görevi var, ama biz rol olarak Bolum_Baskani kullanıyoruz
  -- Alternatif: rol = 'Danisman' ve anabilim_dali_baskani_mi = true olabilir
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol, anabilim_dali_baskani_mi) VALUES
    (v_et_id, 'Prof. Dr.', 'Kaan', 'Yaralıoğlu', 'k.yaralioglu@deu.edu.tr', '0232-1234568', 15, 15, 12, true, 'Bolum_Baskani', true)
  RETURNING personel_id INTO v_personel_id;

  -- 3. Çiğdem TARHAN - Prof. Dr. - ET - Bölüm Başkan Yardımcısı (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_et_id, 'Prof. Dr.', 'Çiğdem', 'Tarhan', 'cigdem.tarhan@deu.edu.tr', '0232-1234569', 15, 15, 12, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;

  -- 4. Yılmaz GÖKŞEN - Prof. Dr. - ET - Öğretim Üyesi (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_et_id, 'Prof. Dr.', 'Yılmaz', 'Gökşen', 'yilmaz.goksen@deu.edu.tr', '0232-1234570', 15, 15, 12, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;

  -- 5. Can AYDIN - Doç. Dr. - CBS - Bölüm Başkan Yardımcısı (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_cbs_id, 'Doç. Dr.', 'Can', 'Aydın', 'can.aydin@deu.edu.tr', '0232-1234571', 12, 12, 10, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;

  -- 6. Kutan KORUYAN - Dr. Öğr. Üyesi - ET - Öğretim Üyesi (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_et_id, 'Dr. Öğr. Üyesi', 'Kutan', 'Koruyan', 'kutan.koruyan@deu.edu.tr', '0232-1234572', 10, 10, 8, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;

  -- 7. Ceyda ÜNAL - Araş. Gör. Dr. - ET - Araştırma Görevlisi (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_et_id, 'Araş. Gör. Dr.', 'Ceyda', 'Ünal', 'ceyda.unal@deu.edu.tr', '0232-1234573', 5, 5, 4, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;

  -- 8. Ali Kaan BARKA - Araş. Gör. - CBS - Araştırma Görevlisi (Danışman)
  INSERT INTO public.akademik_personel (anabilim_dali_id, unvan, ad, soyad, email, telefon, maksimum_kapasite, sert_limit, yumusak_limit, aktif_mi, rol) VALUES
    (v_cbs_id, 'Araş. Gör.', 'Ali Kaan', 'Barka', 'alikaan.barka@deu.edu.tr', '0232-1234574', 5, 5, 4, true, 'Danisman')
  RETURNING personel_id INTO v_personel_id;
END $$;

-- ============================================
-- 5. ADMINLER (İsim Listesinden)
-- ============================================

INSERT INTO public.adminler (email, ad, soyad, telefon, aktif_mi) VALUES
  ('serkan.oz@deu.edu.tr', 'Serkan', 'Öz', '0232-1234590', true),
  ('pinar.sen@deu.edu.tr', 'Pınar', 'Şen', '0232-1234591', true),
  ('tolga.akar@deu.edu.tr', 'Tolga', 'Akar', '0232-1234592', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 6. ÖĞRENCİLER (50 Öğrenci - İsim Listesinden)
-- ============================================
-- Dağılım: 8 Doktora, 10 Tezli YL, 15 Tezsiz İÖ, 17 Tezsiz Uzaktan
-- Risk seviyesi: 20 Düşük, 15 Orta, 10 Yüksek, 5 Kritik

-- Öğrenci verilerini eklemek için DO bloğu kullanacağız
-- Program, durum, danışman ID'lerini almak için
DO $$
DECLARE
  v_doktora_id UUID;
  v_tezli_yl_id UUID;
  v_tezsiz_io_id UUID;
  v_tezsiz_uzaktan_id UUID;
  v_aktif_durum_id UUID;
  v_dondurdu_durum_id UUID;
  v_mezun_durum_id UUID;
  v_ilisik_kesildi_durum_id UUID;
  v_danisman_ids UUID[];
  v_ogrenci_id UUID;
  v_kayit_tarihi DATE;
  v_dogum_tarihi DATE;
  v_cinsiyet TEXT;
  v_ad TEXT;
  v_soyad TEXT;
  v_email TEXT;
  v_telefon TEXT;
  v_ogrenci_no TEXT;
  v_tc_no TEXT;
  v_program_turu_id UUID;
  v_durum_id UUID;
  v_danisman_id UUID;
  v_kabul_turu TEXT;
  i INTEGER;
BEGIN
  -- Program ID'lerini al
  SELECT program_turu_id INTO v_doktora_id FROM public.program_turleri WHERE program_kodu = 'DOKTORA' LIMIT 1;
  SELECT program_turu_id INTO v_tezli_yl_id FROM public.program_turleri WHERE program_kodu = 'TEZLI_YL' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_io_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_IO' LIMIT 1;
  SELECT program_turu_id INTO v_tezsiz_uzaktan_id FROM public.program_turleri WHERE program_kodu = 'TEZSIZ_UZAKTAN' LIMIT 1;
  
  -- Durum ID'lerini al
  SELECT durum_id INTO v_aktif_durum_id FROM public.durum_turleri WHERE durum_kodu = 'Aktif' LIMIT 1;
  SELECT durum_id INTO v_dondurdu_durum_id FROM public.durum_turleri WHERE durum_kodu = 'Dondurdu' LIMIT 1;
  SELECT durum_id INTO v_mezun_durum_id FROM public.durum_turleri WHERE durum_kodu = 'Mezun' LIMIT 1;
  SELECT durum_id INTO v_ilisik_kesildi_durum_id FROM public.durum_turleri WHERE durum_kodu = 'Ilisik_Kesildi' LIMIT 1;
  
  -- Danışman ID'lerini al (sadece Danisman rolünde olanlar)
  SELECT ARRAY_AGG(personel_id) INTO v_danisman_ids 
  FROM public.akademik_personel 
  WHERE rol = 'Danisman' AND aktif_mi = true;
  
  -- ============================================
  -- 8 DOKTORA ÖĞRENCİSİ
  -- ============================================
  
  -- 8 Doktora öğrencisi ekle
  FOR i IN 1..8 LOOP
    -- İsim üret (Türkçe isim listesinden)
    v_ad := CASE i
      WHEN 1 THEN 'Ahmet'
      WHEN 2 THEN 'Mehmet'
      WHEN 3 THEN 'Mustafa'
      WHEN 4 THEN 'Ali'
      WHEN 5 THEN 'Fatma'
      WHEN 6 THEN 'Ayşe'
      WHEN 7 THEN 'Zeynep'
      WHEN 8 THEN 'Emine'
    END;
    
    v_soyad := CASE i
      WHEN 1 THEN 'Yılmaz'
      WHEN 2 THEN 'Kaya'
      WHEN 3 THEN 'Demir'
      WHEN 4 THEN 'Şahin'
      WHEN 5 THEN 'Çelik'
      WHEN 6 THEN 'Yıldız'
      WHEN 7 THEN 'Öztürk'
      WHEN 8 THEN 'Aydın'
    END;
    
    v_email := LOWER(REPLACE(v_ad, 'ı', 'i') || '.' || REPLACE(v_soyad, 'ı', 'i') || '@deu.edu.tr');
    v_telefon := '0532-' || LPAD((1000000 + i)::TEXT, 7, '0');
    v_ogrenci_no := '202' || LPAD(i::TEXT, 3, '0');
    v_tc_no := LPAD((10000000000 + i)::TEXT, 11, '0');
    v_cinsiyet := CASE WHEN i <= 4 THEN 'E' ELSE 'K' END;
    v_dogum_tarihi := '1990-01-01'::DATE + (i * 365);
    v_kayit_tarihi := '2022-09-01'::DATE + (i * 30);
    v_kabul_turu := CASE WHEN i <= 4 THEN 'Yuksek_Lisans' ELSE 'Lisans' END;
    v_durum_id := CASE 
      WHEN i <= 6 THEN v_aktif_durum_id
      WHEN i = 7 THEN v_mezun_durum_id
      ELSE v_aktif_durum_id
    END;
    v_danisman_id := v_danisman_ids[1 + ((i - 1) % array_length(v_danisman_ids, 1))];
    
    INSERT INTO public.ogrenci (
      program_turu_id, durum_id, tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet,
      email, telefon, kayit_tarihi, kabul_tarihi, kabul_turu, ogrenci_no, danisman_id
    ) VALUES (
      v_doktora_id, v_durum_id, v_tc_no, v_ad, v_soyad, v_dogum_tarihi, v_cinsiyet,
      v_email, v_telefon, v_kayit_tarihi, v_kayit_tarihi, v_kabul_turu, v_ogrenci_no, v_danisman_id
    ) RETURNING ogrenci_id INTO v_ogrenci_id;
    
    -- Akademik durum ekle
    INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, mevcut_yariyil) VALUES
      (v_ogrenci_id, 1 + (i % 4));
  END LOOP;
  
  -- ============================================
  -- 10 TEZLİ YÜKSEK LİSANS ÖĞRENCİSİ
  -- ============================================
  
  FOR i IN 1..10 LOOP
    v_ad := CASE i
      WHEN 1 THEN 'Hasan'
      WHEN 2 THEN 'Hüseyin'
      WHEN 3 THEN 'İbrahim'
      WHEN 4 THEN 'Osman'
      WHEN 5 THEN 'Hatice'
      WHEN 6 THEN 'Zeliha'
      WHEN 7 THEN 'Sultan'
      WHEN 8 THEN 'Selin'
      WHEN 9 THEN 'Derya'
      WHEN 10 THEN 'Burcu'
    END;
    
    v_soyad := CASE i
      WHEN 1 THEN 'Özdemir'
      WHEN 2 THEN 'Arslan'
      WHEN 3 THEN 'Doğan'
      WHEN 4 THEN 'Kılıç'
      WHEN 5 THEN 'Aslan'
      WHEN 6 THEN 'Çetin'
      WHEN 7 THEN 'Kara'
      WHEN 8 THEN 'Koç'
      WHEN 9 THEN 'Kurt'
      WHEN 10 THEN 'Özkan'
    END;
    
    v_email := LOWER(REPLACE(v_ad, 'ı', 'i') || '.' || REPLACE(v_soyad, 'ı', 'i') || '@deu.edu.tr');
    v_telefon := '0533-' || LPAD((1000000 + i)::TEXT, 7, '0');
    v_ogrenci_no := '202' || LPAD((10 + i)::TEXT, 3, '0');
    v_tc_no := LPAD((10000000010 + i)::TEXT, 11, '0');
    v_cinsiyet := CASE WHEN i <= 4 THEN 'E' ELSE 'K' END;
    v_dogum_tarihi := '1992-01-01'::DATE + (i * 365);
    v_kayit_tarihi := '2023-09-01'::DATE + (i * 30);
    v_kabul_turu := 'Lisans';
    v_durum_id := CASE 
      WHEN i <= 8 THEN v_aktif_durum_id
      WHEN i = 9 THEN v_mezun_durum_id
      ELSE v_aktif_durum_id
    END;
    v_danisman_id := v_danisman_ids[1 + ((i - 1) % array_length(v_danisman_ids, 1))];
    
    INSERT INTO public.ogrenci (
      program_turu_id, durum_id, tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet,
      email, telefon, kayit_tarihi, kabul_tarihi, kabul_turu, ogrenci_no, danisman_id
    ) VALUES (
      v_tezli_yl_id, v_durum_id, v_tc_no, v_ad, v_soyad, v_dogum_tarihi, v_cinsiyet,
      v_email, v_telefon, v_kayit_tarihi, v_kayit_tarihi, v_kabul_turu, v_ogrenci_no, v_danisman_id
    ) RETURNING ogrenci_id INTO v_ogrenci_id;
    
    INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, mevcut_yariyil) VALUES
      (v_ogrenci_id, 1 + (i % 3));
  END LOOP;
  
  -- ============================================
  -- 15 TEZSIZ İKİNCİ ÖĞRETİM ÖĞRENCİSİ
  -- ============================================
  
  FOR i IN 1..15 LOOP
    v_ad := CASE i
      WHEN 1 THEN 'Yusuf'
      WHEN 2 THEN 'Fatih'
      WHEN 3 THEN 'Emre'
      WHEN 4 THEN 'Burak'
      WHEN 5 THEN 'Can'
      WHEN 6 THEN 'Gizem'
      WHEN 7 THEN 'Seda'
      WHEN 8 THEN 'Pınar'
      WHEN 9 THEN 'Özge'
      WHEN 10 THEN 'Esra'
      WHEN 11 THEN 'Ceren'
      WHEN 12 THEN 'Gamze'
      WHEN 13 THEN 'Melis'
      WHEN 14 THEN 'İrem'
      WHEN 15 THEN 'Büşra'
    END;
    
    v_soyad := CASE i
      WHEN 1 THEN 'Şimşek'
      WHEN 2 THEN 'Polat'
      WHEN 3 THEN 'Öz'
      WHEN 4 THEN 'Çakır'
      WHEN 5 THEN 'Sarı'
      WHEN 6 THEN 'Erdoğan'
      WHEN 7 THEN 'Güler'
      WHEN 8 THEN 'Şen'
      WHEN 9 THEN 'Akar'
      WHEN 10 THEN 'Bulut'
      WHEN 11 THEN 'Keskin'
      WHEN 12 THEN 'Özer'
      WHEN 13 THEN 'Ateş'
      WHEN 14 THEN 'Taş'
      WHEN 15 THEN 'Toprak'
    END;
    
    v_email := LOWER(REPLACE(v_ad, 'ı', 'i') || '.' || REPLACE(v_soyad, 'ı', 'i') || '@deu.edu.tr');
    v_telefon := '0534-' || LPAD((1000000 + i)::TEXT, 7, '0');
    v_ogrenci_no := '202' || LPAD((20 + i)::TEXT, 3, '0');
    v_tc_no := LPAD((10000000020 + i)::TEXT, 11, '0');
    v_cinsiyet := CASE WHEN i <= 5 THEN 'E' ELSE 'K' END;
    v_dogum_tarihi := '1993-01-01'::DATE + (i * 365);
    v_kayit_tarihi := '2023-09-01'::DATE + (i * 30);
    v_kabul_turu := 'Lisans';
    v_durum_id := CASE 
      WHEN i <= 12 THEN v_aktif_durum_id
      WHEN i = 13 THEN v_mezun_durum_id
      WHEN i = 14 THEN v_dondurdu_durum_id
      ELSE v_aktif_durum_id
    END;
    v_danisman_id := v_danisman_ids[1 + ((i - 1) % array_length(v_danisman_ids, 1))];
    
    INSERT INTO public.ogrenci (
      program_turu_id, durum_id, tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet,
      email, telefon, kayit_tarihi, kabul_tarihi, kabul_turu, ogrenci_no, danisman_id
    ) VALUES (
      v_tezsiz_io_id, v_durum_id, v_tc_no, v_ad, v_soyad, v_dogum_tarihi, v_cinsiyet,
      v_email, v_telefon, v_kayit_tarihi, v_kayit_tarihi, v_kabul_turu, v_ogrenci_no, v_danisman_id
    ) RETURNING ogrenci_id INTO v_ogrenci_id;
    
    INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, mevcut_yariyil) VALUES
      (v_ogrenci_id, 1 + (i % 3));
  END LOOP;
  
  -- ============================================
  -- 17 TEZSIZ UZAKTAN ÖĞRETİM ÖĞRENCİSİ
  -- ============================================
  
  FOR i IN 1..17 LOOP
    v_ad := CASE i
      WHEN 1 THEN 'Kerem'
      WHEN 2 THEN 'Arda'
      WHEN 3 THEN 'Ege'
      WHEN 4 THEN 'Kaan'
      WHEN 5 THEN 'Berk'
      WHEN 6 THEN 'Ebru'
      WHEN 7 THEN 'Tuğba'
      WHEN 8 THEN 'Serap'
      WHEN 9 THEN 'Sevgi'
      WHEN 10 THEN 'Gül'
      WHEN 11 THEN 'Nur'
      WHEN 12 THEN 'Aslı'
      WHEN 13 THEN 'Dilek'
      WHEN 14 THEN 'Özlem'
      WHEN 15 THEN 'Sibel'
      WHEN 16 THEN 'Aylin'
      WHEN 17 THEN 'Hande'
    END;
    
    v_soyad := CASE i
      WHEN 1 THEN 'Köse'
      WHEN 2 THEN 'Çiftçi'
      WHEN 3 THEN 'Özçelik'
      WHEN 4 THEN 'Aydoğan'
      WHEN 5 THEN 'Güneş'
      WHEN 6 THEN 'Bozkurt'
      WHEN 7 THEN 'Aktaş'
      WHEN 8 THEN 'Yücel'
      WHEN 9 THEN 'Özaydın'
      WHEN 10 THEN 'Tekin'
      WHEN 11 THEN 'Çolak'
      WHEN 12 THEN 'Korkmaz'
      WHEN 13 THEN 'Yavuz'
      WHEN 14 THEN 'Aksoy'
      WHEN 15 THEN 'Kurtuluş'
      WHEN 16 THEN 'Özsoy'
      WHEN 17 THEN 'Aydoğdu'
    END;
    
    v_email := LOWER(REPLACE(v_ad, 'ı', 'i') || '.' || REPLACE(v_soyad, 'ı', 'i') || '@deu.edu.tr');
    v_telefon := '0535-' || LPAD((1000000 + i)::TEXT, 7, '0');
    v_ogrenci_no := '202' || LPAD((35 + i)::TEXT, 3, '0');
    v_tc_no := LPAD((10000000035 + i)::TEXT, 11, '0');
    v_cinsiyet := CASE WHEN i <= 5 THEN 'E' ELSE 'K' END;
    v_dogum_tarihi := '1994-01-01'::DATE + (i * 365);
    v_kayit_tarihi := '2024-09-01'::DATE + (i * 30);
    v_kabul_turu := 'Lisans';
    v_durum_id := CASE 
      WHEN i <= 14 THEN v_aktif_durum_id
      WHEN i = 15 THEN v_mezun_durum_id
      WHEN i = 16 THEN v_dondurdu_durum_id
      ELSE v_aktif_durum_id
    END;
    v_danisman_id := v_danisman_ids[1 + ((i - 1) % array_length(v_danisman_ids, 1))];
    
    INSERT INTO public.ogrenci (
      program_turu_id, durum_id, tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet,
      email, telefon, kayit_tarihi, kabul_tarihi, kabul_turu, ogrenci_no, danisman_id
    ) VALUES (
      v_tezsiz_uzaktan_id, v_durum_id, v_tc_no, v_ad, v_soyad, v_dogum_tarihi, v_cinsiyet,
      v_email, v_telefon, v_kayit_tarihi, v_kayit_tarihi, v_kabul_turu, v_ogrenci_no, v_danisman_id
    ) RETURNING ogrenci_id INTO v_ogrenci_id;
    
    INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, mevcut_yariyil) VALUES
      (v_ogrenci_id, 1 + (i % 3));
  END LOOP;
END $$;

-- ============================================
-- 7. ÖĞRENCI DERSLERİ VE NOTLARI
-- ============================================
-- Her öğrencinin programına uygun dersleri seçilecek
-- Risk seviyesine göre gerçekçi not dağılımı

DO $$
DECLARE
  v_ogrenci RECORD;
  v_ders RECORD;
  v_program_kodu TEXT;
  v_not_kodu TEXT;
  v_ts INTEGER;
  v_yariyil INTEGER;
  v_akademik_yil INTEGER;
  v_risk_seviyesi TEXT;
  v_not_rastgele NUMERIC;
BEGIN
  -- Tüm öğrencileri döngüye al
  FOR v_ogrenci IN 
    SELECT o.ogrenci_id, o.program_turu_id, pt.program_kodu, oad.mevcut_yariyil
    FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  LOOP
    v_program_kodu := v_ogrenci.program_kodu;
    v_yariyil := 1;
    v_akademik_yil := 2022;
    
    -- Risk seviyesi belirleme (öğrenci sırasına göre)
    SELECT 
      CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY o.ogrenci_id) <= 20 THEN 'Dusuk'
        WHEN ROW_NUMBER() OVER (ORDER BY o.ogrenci_id) <= 35 THEN 'Orta'
        WHEN ROW_NUMBER() OVER (ORDER BY o.ogrenci_id) <= 45 THEN 'Yuksek'
        ELSE 'Kritik'
      END INTO v_risk_seviyesi
    FROM public.ogrenci o
    WHERE o.ogrenci_id = v_ogrenci.ogrenci_id;
    
    -- Programına uygun dersleri seç
    FOR v_ders IN 
      SELECT d.ders_kodu, d.ders_adi, d.akts
      FROM public.dersler d
      WHERE d.program_turu_id = v_ogrenci.program_turu_id
        AND d.aktif_mi = true
        AND d.ders_turu != 'Tez'  -- Tez dersini ayrı ekleyeceğiz
      ORDER BY d.ders_kodu
      LIMIT CASE 
        WHEN v_program_kodu = 'DOKTORA' THEN 10
        WHEN v_program_kodu = 'TEZLI_YL' THEN 8
        ELSE 10
      END
    LOOP
      -- Risk seviyesine göre not belirleme
      v_not_rastgele := RANDOM();
      
      IF v_risk_seviyesi = 'Dusuk' THEN
        -- Düşük risk: AA, BA, BB, CB
        v_not_kodu := CASE 
          WHEN v_not_rastgele < 0.3 THEN 'AA'
          WHEN v_not_rastgele < 0.6 THEN 'BA'
          WHEN v_not_rastgele < 0.85 THEN 'BB'
          ELSE 'CB'
        END;
        v_ts := 1;
      ELSIF v_risk_seviyesi = 'Orta' THEN
        -- Orta risk: BB, CB, CC
        v_not_kodu := CASE 
          WHEN v_not_rastgele < 0.4 THEN 'BB'
          WHEN v_not_rastgele < 0.75 THEN 'CB'
          ELSE 'CC'
        END;
        v_ts := CASE WHEN v_not_rastgele > 0.8 THEN 2 ELSE 1 END;
      ELSIF v_risk_seviyesi = 'Yuksek' THEN
        -- Yüksek risk: CC, DC, DD
        v_not_kodu := CASE 
          WHEN v_not_rastgele < 0.3 THEN 'CC'
          WHEN v_not_rastgele < 0.6 THEN 'DC'
          ELSE 'DD'
        END;
        v_ts := CASE WHEN v_not_rastgele > 0.5 THEN 2 ELSE 1 END;
      ELSE
        -- Kritik risk: DD, FD, FF + tekrar
        v_not_kodu := CASE 
          WHEN v_not_rastgele < 0.3 THEN 'DD'
          WHEN v_not_rastgele < 0.6 THEN 'FD'
          ELSE 'FF'
        END;
        v_ts := CASE WHEN v_not_rastgele > 0.3 THEN 2 ELSE 1 END;
      END IF;
      
      -- Yarıyıl belirleme (1-4 arası)
      v_yariyil := 1 + ((ROW_NUMBER() OVER (PARTITION BY v_ogrenci.ogrenci_id ORDER BY v_ders.ders_kodu) - 1) % 4);
      v_akademik_yil := 2022 + ((v_yariyil - 1) / 2);
      
      -- Ders kaydı ekle
      INSERT INTO public.ogrenci_dersleri (
        ogrenci_id, ders_kodu, ders_adi, yariyil, akademik_yil, 
        not_kodu, ts, akts
      ) VALUES (
        v_ogrenci.ogrenci_id, v_ders.ders_kodu, v_ders.ders_adi, 
        v_yariyil, v_akademik_yil, v_not_kodu, v_ts, v_ders.akts
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 8. ÖĞRENCI AŞAMALARI
-- ============================================
-- Her öğrencinin aşama geçmişi

DO $$
DECLARE
  v_ogrenci RECORD;
  v_asama RECORD;
  v_program_kodu TEXT;
  v_baslangic_tarihi DATE;
  v_bitis_tarihi DATE;
  v_durum TEXT;
  v_gecikme INTEGER;
BEGIN
  FOR v_ogrenci IN 
    SELECT o.ogrenci_id, o.program_turu_id, pt.program_kodu, o.kayit_tarihi, oad.mevcut_yariyil
    FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  LOOP
    v_program_kodu := v_ogrenci.program_kodu;
    v_baslangic_tarihi := v_ogrenci.kayit_tarihi;
    
    -- Programına uygun aşamaları al
    FOR v_asama IN 
      SELECT at.asama_tanimi_id, at.asama_kodu, at.sira_no, at.azami_sure_yariyil
      FROM public.asama_tanimlari at
      WHERE at.program_turu_id = v_ogrenci.program_turu_id
      ORDER BY at.sira_no
    LOOP
      -- Aşama durumu belirleme
      IF v_asama.sira_no < (SELECT MAX(sira_no) FROM public.asama_tanimlari WHERE program_turu_id = v_ogrenci.program_turu_id) THEN
        -- Tamamlanan aşamalar
        v_durum := 'Tamamlandi';
        v_bitis_tarihi := v_baslangic_tarihi + (v_asama.azami_sure_yariyil * 180);
        v_gecikme := 0;
      ELSE
        -- Aktif aşama (son aşama)
        v_durum := 'Devam_Ediyor';
        v_bitis_tarihi := NULL;
        v_gecikme := GREATEST(0, v_ogrenci.mevcut_yariyil - v_asama.azami_sure_yariyil);
      END IF;
      
      -- Aşama kaydı ekle
      INSERT INTO public.ogrenci_asamalari (
        ogrenci_id, asama_tanimi_id, baslangic_tarihi, bitis_tarihi, 
        durum, gecikme_yariyil, tamamlanma_nedeni
      ) VALUES (
        v_ogrenci.ogrenci_id, v_asama.asama_tanimi_id, v_baslangic_tarihi, v_bitis_tarihi,
        v_durum, v_gecikme, 
        CASE WHEN v_durum = 'Tamamlandi' THEN 'Başarılı' ELSE NULL END
      ) ON CONFLICT DO NOTHING;
      
      -- Sonraki aşama için başlangıç tarihi
      IF v_bitis_tarihi IS NOT NULL THEN
        v_baslangic_tarihi := v_bitis_tarihi + 30;
      END IF;
    END LOOP;
    
    -- Mevcut aşama ID'sini güncelle
    UPDATE public.ogrenci_akademik_durum
    SET mevcut_asama_id = (
      SELECT asama_id 
      FROM public.ogrenci_asamalari 
      WHERE ogrenci_id = v_ogrenci.ogrenci_id 
        AND durum = 'Devam_Ediyor'
      LIMIT 1
    )
    WHERE ogrenci_id = v_ogrenci.ogrenci_id;
  END LOOP;
END $$;

-- ============================================
-- 9. RİSK SKORLARI
-- ============================================
-- Her öğrenci için risk skoru hesaplama

DO $$
DECLARE
  v_ogrenci RECORD;
  v_risk_skoru INTEGER;
  v_risk_seviyesi TEXT;
  v_azami_sureye_yakinlik NUMERIC;
  v_basarisiz_ders_sayisi INTEGER;
  v_asama_gecikmesi INTEGER;
BEGIN
  FOR v_ogrenci IN 
    SELECT 
      o.ogrenci_id,
      o.program_turu_id,
      pt.maksimum_sure_yariyil,
      oad.mevcut_yariyil,
      oad.not_ortalamasi
    FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
    JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  LOOP
    -- Risk skoru hesapla (basit versiyon)
    v_azami_sureye_yakinlik := (v_ogrenci.mevcut_yariyil::NUMERIC / NULLIF(v_ogrenci.maksimum_sure_yariyil, 0)) * 100;
    
    -- Risk skoru hesaplama (0-100)
    v_risk_skoru := 0;
    
    -- Azami süreye yakınlık: %40 ağırlık
    v_risk_skoru := v_risk_skoru + LEAST(40, v_azami_sureye_yakinlik * 0.4);
    
    -- Not ortalaması: %30 ağırlık
    IF v_ogrenci.not_ortalamasi IS NOT NULL THEN
      IF v_ogrenci.not_ortalamasi < 2.0 THEN
        v_risk_skoru := v_risk_skoru + 30;
      ELSIF v_ogrenci.not_ortalamasi < 2.5 THEN
        v_risk_skoru := v_risk_skoru + 20;
      ELSIF v_ogrenci.not_ortalamasi < 3.0 THEN
        v_risk_skoru := v_risk_skoru + 10;
      END IF;
    END IF;
    
    -- Başarısız ders sayısı: %20 ağırlık
    SELECT COUNT(*) INTO v_basarisiz_ders_sayisi
    FROM public.ogrenci_dersleri
    WHERE ogrenci_id = v_ogrenci.ogrenci_id
      AND not_kodu IN ('DC', 'DD', 'FD', 'FF');
    
    v_risk_skoru := v_risk_skoru + LEAST(20, v_basarisiz_ders_sayisi * 5);
    
    -- Aşama gecikmesi: %10 ağırlık
    SELECT COALESCE(MAX(gecikme_yariyil), 0) INTO v_asama_gecikmesi
    FROM public.ogrenci_asamalari
    WHERE ogrenci_id = v_ogrenci.ogrenci_id
      AND durum = 'Devam_Ediyor';
    
    v_risk_skoru := v_risk_skoru + LEAST(10, v_asama_gecikmesi * 2);
    
    -- Risk skorunu 0-100 arasında sınırla
    v_risk_skoru := LEAST(100, GREATEST(0, v_risk_skoru));
    
    -- Risk seviyesi belirleme
    IF v_risk_skoru >= 76 THEN
      v_risk_seviyesi := 'Kritik';
    ELSIF v_risk_skoru >= 51 THEN
      v_risk_seviyesi := 'Yuksek';
    ELSIF v_risk_skoru >= 26 THEN
      v_risk_seviyesi := 'Orta';
    ELSE
      v_risk_seviyesi := 'Dusuk';
    END IF;
    
    -- Risk skoru kaydı ekle
    INSERT INTO public.ogrenci_risk_skorlari (
      ogrenci_id, risk_skoru, risk_seviyesi, azami_sureye_yakinlik_yuzdesi,
      risk_faktorleri
    ) VALUES (
      v_ogrenci.ogrenci_id, v_risk_skoru, v_risk_seviyesi, v_azami_sureye_yakinlik,
      jsonb_build_object(
        'azami_sureye_yakinlik', v_azami_sureye_yakinlik,
        'not_ortalamasi', v_ogrenci.not_ortalamasi,
        'basarisiz_ders_sayisi', (SELECT COUNT(*) FROM public.ogrenci_dersleri WHERE ogrenci_id = v_ogrenci.ogrenci_id AND not_kodu IN ('DC', 'DD', 'FD', 'FF')),
        'asama_gecikmesi', (SELECT COALESCE(MAX(gecikme_yariyil), 0) FROM public.ogrenci_asamalari WHERE ogrenci_id = v_ogrenci.ogrenci_id AND durum = 'Devam_Ediyor')
      )
    ) ON CONFLICT (ogrenci_id) DO UPDATE SET
      risk_skoru = v_risk_skoru,
      risk_seviyesi = v_risk_seviyesi,
      azami_sureye_yakinlik_yuzdesi = v_azami_sureye_yakinlik,
      risk_faktorleri = jsonb_build_object(
        'azami_sureye_yakinlik', v_azami_sureye_yakinlik,
        'not_ortalamasi', v_ogrenci.not_ortalamasi,
        'basarisiz_ders_sayisi', (SELECT COUNT(*) FROM public.ogrenci_dersleri WHERE ogrenci_id = v_ogrenci.ogrenci_id AND not_kodu IN ('DC', 'DD', 'FD', 'FF')),
        'asama_gecikmesi', (SELECT COALESCE(MAX(gecikme_yariyil), 0) FROM public.ogrenci_asamalari WHERE ogrenci_id = v_ogrenci.ogrenci_id AND durum = 'Devam_Ediyor')
      ),
      hesaplama_tarihi = now(),
      updated_at = now();
  END LOOP;
END $$;

-- ============================================
-- 10. KRİTİK AŞAMA KAYITLARI
-- ============================================
-- Yeterlik sınavları, tez önerileri, tez savunmaları, TİK toplantıları

DO $$
DECLARE
  v_ogrenci RECORD;
  v_program_kodu TEXT;
  v_asama_kodu TEXT;
BEGIN
  FOR v_ogrenci IN 
    SELECT o.ogrenci_id, o.program_turu_id, pt.program_kodu
    FROM public.ogrenci o
    JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  LOOP
    v_program_kodu := v_ogrenci.program_kodu;
    
    -- DOKTORA ÖĞRENCİLERİ İÇİN
    IF v_program_kodu = 'DOKTORA' THEN
      -- Yeterlik sınavları (bazı öğrenciler için)
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'YETERLIK_SINAVI' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.yeterlik_sinavlari (ogrenci_id, sinav_tarihi, deneme_no, sonuc, notu) VALUES
          (v_ogrenci.ogrenci_id, '2023-06-15'::DATE, 1, 
           CASE WHEN RANDOM() > 0.2 THEN 'Basarili' ELSE 'Basarisiz' END,
           CASE WHEN RANDOM() > 0.2 THEN 80 + (RANDOM() * 20)::INTEGER ELSE 60 + (RANDOM() * 15)::INTEGER END)
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- Tez önerileri (bazı öğrenciler için)
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'TEZ_ONERISI' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.tez_onerileri (ogrenci_id, oneri_tarihi, sonuc, tez_konusu) VALUES
          (v_ogrenci.ogrenci_id, '2023-09-15'::DATE,
           CASE WHEN RANDOM() > 0.15 THEN 'Kabul' WHEN RANDOM() > 0.5 THEN 'Revizyon_Gerekli' ELSE 'Ret' END,
           'Yönetim Bilişim Sistemlerinde ' || (ARRAY['Yapay Zeka', 'Büyük Veri', 'Bulut Bilişim', 'Siber Güvenlik'])[1 + (RANDOM() * 4)::INTEGER])
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- TİK toplantıları (bazı öğrenciler için)
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'TEZ_CALISMASI' AND oa.durum = 'Devam_Ediyor') > 0 THEN
        INSERT INTO public.tik_toplantilari (ogrenci_id, toplanti_tarihi, toplanti_no, sonuc, degerlendirme) VALUES
          (v_ogrenci.ogrenci_id, '2024-01-15'::DATE, 1,
           CASE WHEN RANDOM() > 0.2 THEN 'Basarili' WHEN RANDOM() > 0.5 THEN 'Basarisiz' ELSE 'Yetersiz' END,
           'Tez çalışması ilerleme değerlendirmesi yapıldı')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- Tez savunmaları (mezun öğrenciler için)
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'TEZ_SAVUNMA' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.tez_savunmalari (ogrenci_id, savunma_tarihi, sonuc, jüri_uyeleri) VALUES
          (v_ogrenci.ogrenci_id, '2024-06-15'::DATE,
           CASE WHEN RANDOM() > 0.1 THEN 'Kabul' WHEN RANDOM() > 0.5 THEN 'Duzeltme_Gerekli' ELSE 'Red' END,
           ARRAY['Prof. Dr. Vahap Tecim', 'Prof. Dr. Kaan Yaralıoğlu', 'Doç. Dr. Can Aydın'])
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- TEZLİ YL ÖĞRENCİLERİ İÇİN
    IF v_program_kodu = 'TEZLI_YL' THEN
      -- Tez önerileri
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'TEZ_ONERISI' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.tez_onerileri (ogrenci_id, oneri_tarihi, sonuc, tez_konusu) VALUES
          (v_ogrenci.ogrenci_id, '2023-09-15'::DATE,
           CASE WHEN RANDOM() > 0.15 THEN 'Kabul' WHEN RANDOM() > 0.5 THEN 'Revizyon_Gerekli' ELSE 'Ret' END,
           'Yönetim Bilişim Sistemlerinde ' || (ARRAY['Veri Analizi', 'Sistem Tasarımı', 'Proje Yönetimi'])[1 + (RANDOM() * 3)::INTEGER])
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- Tez savunmaları
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'TEZ_SAVUNMA' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.tez_savunmalari (ogrenci_id, savunma_tarihi, sonuc, jüri_uyeleri) VALUES
          (v_ogrenci.ogrenci_id, '2024-06-15'::DATE,
           CASE WHEN RANDOM() > 0.1 THEN 'Kabul' WHEN RANDOM() > 0.5 THEN 'Duzeltme_Gerekli' ELSE 'Red' END,
           ARRAY['Prof. Dr. Çiğdem Tarhan', 'Doç. Dr. Can Aydın'])
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- TEZSIZ PROGRAMLAR İÇİN YETERLİK SINAVLARI
    IF v_program_kodu IN ('TEZSIZ_IO', 'TEZSIZ_UZAKTAN') THEN
      IF (SELECT COUNT(*) FROM public.ogrenci_asamalari oa 
          JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
          WHERE oa.ogrenci_id = v_ogrenci.ogrenci_id AND at.asama_kodu = 'YETERLIK_SINAVI' AND oa.durum = 'Tamamlandi') > 0 THEN
        INSERT INTO public.yeterlik_sinavlari (ogrenci_id, sinav_tarihi, deneme_no, sonuc, notu) VALUES
          (v_ogrenci.ogrenci_id, '2024-06-15'::DATE, 1,
           CASE WHEN RANDOM() > 0.2 THEN 'Basarili' ELSE 'Basarisiz' END,
           CASE WHEN RANDOM() > 0.2 THEN 75 + (RANDOM() * 25)::INTEGER ELSE 50 + (RANDOM() * 25)::INTEGER END)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- TAMAMLANDI
-- ============================================
-- Eklenen veriler:
-- 1. Referans veriler (Program türleri, Anabilim dalları, Durum türleri)
-- 2. Dersler (JSON'dan, program_turu_id ile)
-- 3. Aşama tanımları (Her program için)
-- 4. Akademik personel (Sadece JSON'dan, 8 kişi)
-- 5. Adminler (3 kişi)
-- 6. 50 Öğrenci (8 Doktora, 10 Tezli YL, 15 Tezsiz İÖ, 17 Tezsiz Uzaktan)
-- 7. Öğrenci dersleri ve notları
-- 8. Öğrenci aşamaları
-- 9. Risk skorları
-- 10. Kritik aşama kayıtları (yeterlik, tez önerisi, tez savunma, TİK)
-- ============================================

