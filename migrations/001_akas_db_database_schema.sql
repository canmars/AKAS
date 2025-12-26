/* =============================================================================
AKAS (AKADEMİK KARAR DESTEK SİSTEMİ) - MASTER DATABASE SCHEMA
Kaynak: Supabase Export + Logic Layer
Durum: Live (Production Ready)
=============================================================================
*/

-- ==========================================
-- 1. KURUMSAL TANIMLAR (BASE TABLES)
-- ==========================================

-- 1.1. ENSTİTÜLER
CREATE TABLE public.enstituler (
  enstitu_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enstitu_adi text NOT NULL,
  enstitu_kodu text NOT NULL,
  universite_adi text DEFAULT 'Dokuz Eylül Üniversitesi',
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 1.2. ANABİLİM DALLARI
CREATE TABLE public.anabilim_dallari (
  anabilim_dali_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anabilim_dali_adi text NOT NULL,
  anabilim_dali_kodu text NOT NULL,
  aktif_mi boolean DEFAULT true,
  enstitu_id uuid REFERENCES public.enstituler(enstitu_id),
  bolum_kodu text,
  created_at timestamp with time zone DEFAULT now()
);

-- 1.3. PROGRAM TÜRLERİ
-- NOT: program_kodu alanında şu değerler kullanılır:
-- 'TEZLI_YL', 'TEZSIZ_YL_IO', 'TEZSIZ_YL_UZAKTAN', 'DOKTORA'
CREATE TABLE public.program_turleri (
  program_turu_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_adi text NOT NULL,
  program_kodu text NOT NULL, 
  maksimum_sure_yil integer NOT NULL,
  maksimum_sure_yariyil integer NOT NULL,
  normal_sure_yariyil integer DEFAULT 4,
  anabilim_dali_id uuid REFERENCES public.anabilim_dallari(anabilim_dali_id),
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 1.4. DURUM TÜRLERİ (Öğrenci Statüleri)
CREATE TABLE public.durum_turleri (
  durum_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  durum_adi text NOT NULL,
  durum_kodu text NOT NULL, -- Örn: DERS_ASAMASI, TEZ_ASAMASI, MEZUN
  sira_no integer NOT NULL,
  aciklama text
);

-- 1.5. AKADEMİK TAKVİM
CREATE TABLE public.akademik_takvim (
  takvim_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  akademik_yil_adi text NOT NULL UNIQUE, -- Örn: 2025-2026
  guz_ders_baslangic date NOT NULL,
  guz_ders_bitis date NOT NULL,
  guz_sinav_baslangic date NOT NULL,
  guz_sinav_bitis date NOT NULL,
  ara_tatil_baslangic date NOT NULL,
  ara_tatil_bitis date NOT NULL,
  bahar_ders_baslangic date NOT NULL,
  bahar_ders_bitis date NOT NULL,
  bahar_sinav_baslangic date NOT NULL,
  bahar_sinav_bitis date NOT NULL,
  aktif_mi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 1.6. SİSTEM AYARLARI
CREATE TABLE public.sistem_ayarlari (
  ayar_kodu text NOT NULL PRIMARY KEY,
  ayar_degeri text NOT NULL,
  aciklama text,
  guncelleyen_user_id uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 2. KULLANICILAR VE PERSONEL
-- ==========================================

-- 2.1. ADMİNLER
CREATE TABLE public.adminler (
  admin_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL UNIQUE,
  ad text NOT NULL,
  soyad text NOT NULL,
  telefon text,
  avatar_url text,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- 2.2. AKADEMİK PERSONEL (Hocalar)
CREATE TABLE public.akademik_personel (
  personel_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  anabilim_dali_id uuid REFERENCES public.anabilim_dallari(anabilim_dali_id),
  ad text NOT NULL,
  soyad text NOT NULL,
  email text NOT NULL,
  telefon text,
  dahili_no text,
  avatar_url text,
  unvan text NOT NULL CHECK (unvan = ANY (ARRAY['Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Arş. Gör.', 'Öğr. Gör.', 'Öğr. Gör. Dr.'])),
  rol text CHECK (rol = ANY (ARRAY['Danisman', 'Bolum_Baskani'])),
  anabilim_dali_baskani_mi boolean DEFAULT false,
  aktif_danisman_mi boolean DEFAULT true,
  mevcut_danismanlik_sayisi integer DEFAULT 0, -- Trigger ile otomatik yönetilir
  tezli_kotasi integer DEFAULT 14,
  tezsiz_kotasi integer DEFAULT 16,
  aktif_mi boolean DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2.3. PERSONEL UZMANLIKLARI
CREATE TABLE public.akademik_personel_uzmanlik (
  personel_uzmanlik_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personel_id uuid NOT NULL REFERENCES public.akademik_personel(personel_id),
  uzmanlik_alani text NOT NULL,
  ana_uzmanlik_mi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 3. MÜFREDAT VE DERSLER
-- ==========================================

-- 3.1. DERS KATALOĞU
CREATE TABLE public.dersler (
  ders_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_turu_id uuid REFERENCES public.program_turleri(program_turu_id),
  ders_kodu text NOT NULL UNIQUE,
  ders_adi text NOT NULL,
  ders_turu text NOT NULL,
  akts integer NOT NULL DEFAULT 0,
  kritik_darbogaz_mi boolean DEFAULT false,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3.2. AÇILAN DERSLER (Dönemlik)
CREATE TABLE public.acilan_dersler (
  acilan_ders_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ders_id uuid NOT NULL REFERENCES public.dersler(ders_id),
  akademik_donem_id uuid REFERENCES public.akademik_takvim(takvim_id),
  ogretim_uyesi_id uuid REFERENCES public.akademik_personel(personel_id),
  kontenjan integer DEFAULT 50,
  derslik_bilgisi text,
  ders_programi_saati text,
  donem_tipi text NOT NULL CHECK (donem_tipi = ANY (ARRAY['Guz', 'Bahar', 'Yaz'])),
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 4. ÖĞRENCİ VERİLERİ (CORE DATA)
-- ==========================================

-- 4.1. ÖĞRENCİ (Ana Tablo)
CREATE TABLE public.ogrenci (
  ogrenci_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  ogrenci_no text,
  tc_kimlik_no text,
  ad text NOT NULL,
  soyad text NOT NULL,
  email text, -- Özel mail
  kurumsal_email text, -- @ogr.deu.edu.tr
  telefon text,
  adres text,
  cinsiyet text,
  dogum_tarihi date,
  avatar_url text,
  -- İlişkiler
  program_turu_id uuid NOT NULL REFERENCES public.program_turleri(program_turu_id),
  danisman_id uuid REFERENCES public.akademik_personel(personel_id),
  durum_id uuid NOT NULL REFERENCES public.durum_turleri(durum_id),
  -- Akademik
  kayit_tarihi date NOT NULL,
  kabul_tarihi date,
  mezuniyet_tarihi date,
  kabul_turu text CHECK (kabul_turu = ANY (ARRAY['Lisans', 'Yuksek_Lisans'])),
  gno numeric DEFAULT 0.00,
  ales_puani numeric,
  yd_puani numeric,
  lisans_mezuniyet_notu numeric,
  aktif_mi boolean DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4.2. ÖĞRENCİ TRANSKRİPTİ
CREATE TABLE public.ogrenci_dersleri (
  ders_kayit_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  acilan_ders_id uuid REFERENCES public.acilan_dersler(acilan_ders_id),
  ders_kodu text NOT NULL,
  ders_adi text NOT NULL,
  yariyil integer NOT NULL,
  akademik_yil integer NOT NULL,
  donem_tipi text NOT NULL CHECK (donem_tipi = ANY (ARRAY['Guz', 'Bahar', 'Yaz'])),
  -- Notlandırma
  not_kodu text CHECK (not_kodu = ANY (ARRAY['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'NA', 'G', 'M', 'YT', 'YZ'])),
  vize_notu numeric,
  final_notu numeric,
  butunleme_notu numeric,
  basari_katsayisi numeric, -- 4.00, 3.50 vb.
  basarili_mi boolean DEFAULT false,
  devamsiz_mi boolean DEFAULT false,
  tekrar_sayisi integer DEFAULT 1,
  akts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4.3. AKADEMİK DURUM ÖZETİ
CREATE TABLE public.ogrenci_akademik_durum (
  ogrenci_id uuid NOT NULL PRIMARY KEY REFERENCES public.ogrenci(ogrenci_id),
  mevcut_asama_id uuid, -- ogrenci_asamalari tablosuna referans (Circular dependency yüzünden FK eklenebilir)
  mevcut_yariyil integer NOT NULL DEFAULT 1,
  not_ortalamasi numeric,
  tamamlanan_ders_sayisi integer DEFAULT 0,
  tamamlanan_akts integer DEFAULT 0,
  ders_tamamlandi_mi boolean DEFAULT false,
  guncelleme_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4.4. RİSK SKORLARI
CREATE TABLE public.ogrenci_risk_skorlari (
  risk_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  risk_skoru integer NOT NULL CHECK (risk_skoru >= 0 AND risk_skoru <= 100),
  risk_seviyesi text NOT NULL CHECK (risk_seviyesi = ANY (ARRAY['Dusuk', 'Orta', 'Yuksek', 'Kritik'])),
  risk_faktorleri jsonb,
  oneri_aksiyon text,
  tahmini_mezuniyet_tarihi date,
  azami_sureye_yakinlik_yuzdesi numeric,
  hesaplama_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4.5. RİSK TARİHÇESİ
CREATE TABLE public.risk_tarihcesi (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  akademik_yil_id uuid REFERENCES public.akademik_takvim(takvim_id),
  risk_skoru integer NOT NULL,
  risk_seviyesi text,
  ana_faktorler jsonb,
  donem_tipi text NOT NULL CHECK (donem_tipi = ANY (ARRAY['Guz', 'Bahar', 'Yaz'])),
  hesaplama_tarihi timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 5. AKADEMİK AŞAMALAR VE TEZLER
-- ==========================================

-- 5.1. AŞAMA TANIMLARI (Müfredat Kuralları)
CREATE TABLE public.asama_tanimlari (
  asama_tanimi_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_turu_id uuid NOT NULL REFERENCES public.program_turleri(program_turu_id),
  asama_kodu text NOT NULL,
  asama_adi text NOT NULL,
  sira_no integer NOT NULL,
  azami_sure_yariyil integer,
  azami_sure_yil integer,
  gecis_kosullari jsonb,
  kontrol_verileri ARRAY,
  aciklama text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5.2. ÖĞRENCİ AŞAMA İLERLEMESİ
CREATE TABLE public.ogrenci_asamalari (
  asama_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  asama_tanimi_id uuid NOT NULL REFERENCES public.asama_tanimlari(asama_tanimi_id),
  baslangic_tarihi date NOT NULL,
  bitis_tarihi date,
  durum text NOT NULL CHECK (durum = ANY (ARRAY['Devam_Ediyor', 'Tamamlandi', 'Basarisiz', 'Iptal'])),
  tamamlanma_nedeni text,
  gecikme_yariyil integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5.3. TEZLER (Ana Tablo)
CREATE TABLE public.tezler (
  tez_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  danisman_id uuid REFERENCES public.akademik_personel(personel_id),
  baslik text,
  konu_ozeti text,
  tez_dili text DEFAULT 'Turkce',
  durum text CHECK (durum = ANY (ARRAY['Oneri', 'Yazim', 'Juri', 'Tamamlandi', 'Basarisiz', 'Iptal'])),
  baslangic_tarihi date DEFAULT CURRENT_DATE,
  bitis_tarihi date,
  tez_dosya_url text,
  intihal_raporu_url text,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5.4. TEZ ALT SÜREÇLERİ (Detaylar)
-- Not: Bu tablolar şimdilik veri basılmasa da şema bütünlüğü için vardır.
CREATE TABLE public.tez_onerileri (
  oneri_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  tez_id uuid REFERENCES public.tezler(tez_id),
  tez_konusu text,
  dosya_url text,
  oneri_tarihi date NOT NULL,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Kabul', 'Ret', 'Revizyon_Gerekli'])),
  revizyon_tarihi date,
  nihai_sonuc text CHECK (nihai_sonuc = ANY (ARRAY['Kabul', 'Ret'])),
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.tez_donem_kayitlari (
  kayit_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  tez_id uuid REFERENCES public.tezler(tez_id),
  yariyil integer NOT NULL,
  akademik_yil integer NOT NULL,
  danisman_degerlendirmesi text,
  degerlendirme_tarihi date,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.tez_savunmalari (
  savunma_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  tez_id uuid REFERENCES public.tezler(tez_id),
  savunma_tarihi date NOT NULL,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Kabul', 'Duzeltme_Gerekli', 'Red'])),
  nihai_sonuc text CHECK (nihai_sonuc = ANY (ARRAY['Kabul', 'Red'])),
  duzeltme_tarihi date,
  jüri_uyeleri ARRAY,
  tutanak_dosya_url text,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.tez_juri_uyelikleri (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  savunma_id uuid NOT NULL REFERENCES public.tez_savunmalari(savunma_id),
  personel_id uuid REFERENCES public.akademik_personel(personel_id),
  dis_juri_ad_soyad text,
  kurum_bilgisi text,
  rol text CHECK (rol = ANY (ARRAY['Baskan', 'Asil_Uye', 'Yedek_Uye'])),
  katildi_mi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 5.5. DİĞER AKADEMİK ETKİNLİKLER
CREATE TABLE public.yeterlik_sinavlari (
  sinav_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  sinav_tarihi date NOT NULL,
  deneme_no integer NOT NULL DEFAULT 1,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Basarili', 'Basarisiz'])),
  notu numeric,
  aciklama text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.tik_toplantilari (
  toplanti_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  toplanti_no integer,
  toplanti_tarihi date NOT NULL,
  katilim_durumu text,
  rapor_verildi_mi boolean DEFAULT false,
  rapor_tarihi date,
  rapor_icerigi text,
  sonuc text CHECK (sonuc = ANY (ARRAY['Basarili', 'Basarisiz', 'Yetersiz'])),
  degerlendirme text,
  uyari_gonderildi_mi boolean DEFAULT false,
  uyari_tarihi date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 6. İDARİ VE LOG TABLOLARI
-- ==========================================

-- 6.1. DANIŞMAN GEÇMİŞİ
CREATE TABLE public.danisman_gecmisi (
  gecmis_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  danisman_id uuid NOT NULL REFERENCES public.akademik_personel(personel_id),
  atama_tarihi date NOT NULL,
  ayrilma_tarihi date,
  aktif_mi boolean DEFAULT true,
  degisiklik_nedeni text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6.2. ÖĞRENCİ DURUM GEÇMİŞİ
CREATE TABLE public.ogrenci_durum_gecmisi (
  gecmis_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  eski_durum_id uuid REFERENCES public.durum_turleri(durum_id),
  yeni_durum_id uuid NOT NULL REFERENCES public.durum_turleri(durum_id),
  degistiren_admin_id uuid REFERENCES public.adminler(admin_id),
  degistiren_personel_id uuid REFERENCES public.akademik_personel(personel_id),
  degisiklik_nedeni text NOT NULL,
  otomatik_mi boolean DEFAULT false,
  degisiklik_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- 6.3. AKADEMİK GÖREVLER
CREATE TABLE public.akademik_gorevler (
  gorev_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  atanan_ogrenci_id uuid NOT NULL REFERENCES public.ogrenci(ogrenci_id),
  atayan_personel_id uuid REFERENCES public.akademik_personel(personel_id),
  tez_id uuid REFERENCES public.tezler(tez_id),
  baslik text NOT NULL,
  aciklama text,
  son_tarih timestamp with time zone,
  durum text DEFAULT 'Bekliyor' CHECK (durum = ANY (ARRAY['Bekliyor', 'Yapiliyor', 'Tamamlandi', 'Gecikti', 'Iptal'])),
  oncelik text DEFAULT 'Orta' CHECK (oncelik = ANY (ARRAY['Dusuk', 'Orta', 'Yuksek'])),
  tamamlanma_tarihi timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6.4. BİLDİRİMLER
CREATE TABLE public.bildirimler (
  bildirim_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  baslik text NOT NULL,
  mesaj text NOT NULL,
  tip text CHECK (tip = ANY (ARRAY['Bilgi', 'Uyari', 'Tehlike', 'Gorev'])),
  okundu_mu boolean DEFAULT false,
  link text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6.5. SİSTEM LOGLARI
CREATE TABLE public.sistem_loglari (
  log_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  islem_yapan_user_id uuid REFERENCES auth.users(id),
  islem_turu text NOT NULL CHECK (islem_turu = ANY (ARRAY['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'ERROR'])),
  tablo_adi text NOT NULL,
  kayit_id uuid,
  eski_veri jsonb,
  yeni_veri jsonb,
  ip_adresi text,
  aciklama text,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 7. OTOMASYON (ACTIVE TRIGGERS & FUNCTIONS)
-- ==========================================
-- (Bu fonksiyonlar ve triggerlar veritabanında halihazırda mevcuttur)

-- Function: fn_otomatik_gno_hesapla()
-- Trigger: trg_gno_guncelle (ON ogrenci_dersleri)

-- Function: fn_guncelle_danisman_sayisi()
-- Trigger: trg_danisman_sayisi_guncelle (ON ogrenci)

-- Function: fn_otomatik_durum_logla()
-- Trigger: trg_durum_logla (ON ogrenci)

-- Function: fn_update_timestamp()
-- Trigger: trg_update_time_* (ON Tüm ana tablolar)

-- Analitik Fonksiyonlar (RPC):
-- 1. get_dashboard_counts() -> JSON Özeti döner
-- 2. get_riskli_ogrenciler() -> Tablo döner
-- 3. get_donem_basarisi(yil, donem) -> Tablo döner