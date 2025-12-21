-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.akademik_milestone (
  milestone_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  milestone_turu text NOT NULL,
  hedef_tarih date NOT NULL,
  gerceklesme_tarihi date,
  savunma_sonucu text,
  ek_sure_ay integer DEFAULT 0,
  yeni_hedef_tarih date,
  durum text NOT NULL,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT akademik_milestone_pkey PRIMARY KEY (milestone_id),
  CONSTRAINT akademik_milestone_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.akademik_personel (
  personel_id uuid NOT NULL DEFAULT gen_random_uuid(),
  kullanici_id uuid,
  anabilim_dali_id uuid,
  unvan text NOT NULL,
  ad text NOT NULL,
  soyad text NOT NULL,
  email text NOT NULL,
  telefon text,
  maksimum_kapasite integer NOT NULL DEFAULT 10,
  sert_limit integer,
  yumusak_limit integer,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT akademik_personel_pkey PRIMARY KEY (personel_id),
  CONSTRAINT akademik_personel_kullanici_id_fkey FOREIGN KEY (kullanici_id) REFERENCES public.kullanicilar(kullanici_id),
  CONSTRAINT fk_akademik_personel_anabilim_dali FOREIGN KEY (anabilim_dali_id) REFERENCES public.anabilim_dallari(anabilim_dali_id)
);
CREATE TABLE public.akademik_personel_uzmanlik (
  personel_uzmanlik_id uuid NOT NULL DEFAULT gen_random_uuid(),
  personel_id uuid NOT NULL,
  uzmanlik_alani text NOT NULL,
  ana_uzmanlik_mi boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT akademik_personel_uzmanlik_pkey PRIMARY KEY (personel_uzmanlik_id),
  CONSTRAINT akademik_personel_uzmanlik_personel_id_fkey FOREIGN KEY (personel_id) REFERENCES public.akademik_personel(personel_id)
);
CREATE TABLE public.akademik_takvim (
  takvim_id uuid NOT NULL DEFAULT gen_random_uuid(),
  akademik_yil integer NOT NULL,
  donem text NOT NULL,
  yariyil_no integer NOT NULL,
  baslangic_tarihi date NOT NULL,
  bitis_tarihi date NOT NULL,
  kayit_baslangic_tarihi date,
  kayit_bitis_tarihi date,
  ders_baslangic_tarihi date,
  ders_bitis_tarihi date,
  sinav_baslangic_tarihi date,
  sinav_bitis_tarihi date,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT akademik_takvim_pkey PRIMARY KEY (takvim_id)
);
CREATE TABLE public.anabilim_dallari (
  anabilim_dali_id uuid NOT NULL DEFAULT gen_random_uuid(),
  anabilim_dali_adi text NOT NULL,
  anabilim_dali_kodu text NOT NULL,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT anabilim_dallari_pkey PRIMARY KEY (anabilim_dali_id)
);
CREATE TABLE public.bildirim_turleri (
  bildirim_turu_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bildirim_turu_adi text NOT NULL,
  bildirim_turu_kodu text NOT NULL,
  varsayilan_oncelik text NOT NULL,
  varsayilan_alici_roller ARRAY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bildirim_turleri_pkey PRIMARY KEY (bildirim_turu_id)
);
CREATE TABLE public.bildirimler (
  bildirim_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bildirim_turu_id uuid NOT NULL,
  ogrenci_id uuid,
  alici_kullanici_id uuid NOT NULL,
  alici_rol text NOT NULL,
  mesaj text NOT NULL,
  bildirim_onceligi text NOT NULL,
  bildirim_durumu text NOT NULL,
  okundu_mi boolean DEFAULT false,
  okunma_tarihi timestamp with time zone,
  olusturma_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bildirimler_pkey PRIMARY KEY (bildirim_id),
  CONSTRAINT bildirimler_bildirim_turu_id_fkey FOREIGN KEY (bildirim_turu_id) REFERENCES public.bildirim_turleri(bildirim_turu_id),
  CONSTRAINT bildirimler_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT bildirimler_alici_kullanici_id_fkey FOREIGN KEY (alici_kullanici_id) REFERENCES public.kullanicilar(kullanici_id)
);
CREATE TABLE public.danisman_gecmisi (
  gecmis_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  danisman_id uuid NOT NULL,
  atama_tarihi date NOT NULL,
  ayrilma_tarihi date,
  aktif_mi boolean DEFAULT true,
  degisiklik_nedeni text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT danisman_gecmisi_pkey PRIMARY KEY (gecmis_id),
  CONSTRAINT danisman_gecmisi_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT danisman_gecmisi_danisman_id_fkey FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id)
);
CREATE TABLE public.danisman_performans_metrikleri (
  metrik_id uuid NOT NULL DEFAULT gen_random_uuid(),
  danisman_id uuid NOT NULL,
  akademik_yil integer NOT NULL,
  mezun_ettigi_ogrenci_sayisi integer DEFAULT 0,
  ortalama_mezuniyet_suresi_ay numeric,
  riskli_ogrenci_sayisi integer DEFAULT 0,
  kritik_riskli_ogrenci_sayisi integer DEFAULT 0,
  aktif_ogrenci_sayisi integer DEFAULT 0,
  pasif_ogrenci_sayisi integer DEFAULT 0,
  ortalama_risk_skoru numeric,
  basari_orani numeric,
  hesaplama_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT danisman_performans_metrikleri_pkey PRIMARY KEY (metrik_id),
  CONSTRAINT danisman_performans_metrikleri_danisman_id_fkey FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id)
);
CREATE TABLE public.dersler (
  ders_kodu text NOT NULL,
  ders_adi text NOT NULL,
  ders_turu text NOT NULL,
  akts integer NOT NULL DEFAULT 0,
  kritik_darbogaz_mi boolean DEFAULT false,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dersler_pkey PRIMARY KEY (ders_kodu)
);
CREATE TABLE public.durum_turleri (
  durum_id uuid NOT NULL DEFAULT gen_random_uuid(),
  durum_adi text NOT NULL,
  durum_kodu text NOT NULL,
  sira_no integer NOT NULL,
  aciklama text,
  CONSTRAINT durum_turleri_pkey PRIMARY KEY (durum_id)
);
CREATE TABLE public.kullanici_aktiviteleri (
  aktivite_id uuid NOT NULL DEFAULT gen_random_uuid(),
  kullanici_id uuid,
  ogrenci_id uuid,
  aktivite_turu text NOT NULL,
  aktivite_tarihi timestamp with time zone DEFAULT now(),
  ip_adresi text,
  user_agent text,
  ek_bilgi jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kullanici_aktiviteleri_pkey PRIMARY KEY (aktivite_id),
  CONSTRAINT kullanici_aktiviteleri_kullanici_id_fkey FOREIGN KEY (kullanici_id) REFERENCES public.kullanicilar(kullanici_id),
  CONSTRAINT kullanici_aktiviteleri_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.kullanicilar (
  kullanici_id uuid NOT NULL,
  akademik_personel_id uuid,
  rol text NOT NULL,
  email text NOT NULL,
  ad text NOT NULL,
  soyad text NOT NULL,
  aktif_mi boolean DEFAULT true,
  son_giris_tarihi timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ogrenci_id uuid,
  CONSTRAINT kullanicilar_pkey PRIMARY KEY (kullanici_id),
  CONSTRAINT kullanicilar_kullanici_id_fkey FOREIGN KEY (kullanici_id) REFERENCES auth.users(id),
  CONSTRAINT fk_kullanicilar_akademik_personel FOREIGN KEY (akademik_personel_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT fk_kullanicilar_ogrenci FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.ogrenci (
  ogrenci_id uuid NOT NULL DEFAULT gen_random_uuid(),
  kullanici_id uuid,
  program_turu_id uuid NOT NULL,
  durum_id uuid NOT NULL,
  tc_kimlik_no text,
  ad text NOT NULL,
  soyad text NOT NULL,
  dogum_tarihi date,
  cinsiyet text,
  email text,
  telefon text,
  adres text,
  kayit_tarihi date NOT NULL,
  kabul_tarihi date,
  ogrenci_no text,
  danisman_id uuid,
  son_login timestamp with time zone,
  soft_delete boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  program_kabul_turu uuid,
  CONSTRAINT ogrenci_pkey PRIMARY KEY (ogrenci_id),
  CONSTRAINT ogrenci_kullanici_id_fkey FOREIGN KEY (kullanici_id) REFERENCES public.kullanicilar(kullanici_id),
  CONSTRAINT ogrenci_danisman_id_fkey FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT fk_ogrenci_program_turu FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id),
  CONSTRAINT fk_ogrenci_durum FOREIGN KEY (durum_id) REFERENCES public.durum_turleri(durum_id),
  CONSTRAINT fk_ogrenci_danisman FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT fk_ogrenci_program_kabul_turu FOREIGN KEY (program_kabul_turu) REFERENCES public.program_turleri(program_turu_id)
);
CREATE TABLE public.ogrenci_akademik_durum (
  ogrenci_id uuid NOT NULL,
  mevcut_asinama text,
  mevcut_yariyil integer NOT NULL DEFAULT 1,
  ders_tamamlandi_mi boolean DEFAULT false,
  tamamlanan_ders_sayisi integer DEFAULT 0,
  guncelleme_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_akademik_durum_pkey PRIMARY KEY (ogrenci_id),
  CONSTRAINT ogrenci_akademik_durum_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.ogrenci_basari_trendi (
  trend_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  akademik_yil integer NOT NULL,
  yariyil integer NOT NULL,
  ortalama_not numeric,
  tamamlanan_ders_sayisi integer DEFAULT 0,
  toplam_akts integer DEFAULT 0,
  basarili_ders_sayisi integer DEFAULT 0,
  basarisiz_ders_sayisi integer DEFAULT 0,
  tekrar_alinan_ders_sayisi integer DEFAULT 0,
  hesaplama_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_basari_trendi_pkey PRIMARY KEY (trend_id),
  CONSTRAINT ogrenci_basari_trendi_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.ogrenci_dersleri (
  ders_kayit_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  ders_kodu text NOT NULL,
  ders_adi text NOT NULL,
  yariyil integer NOT NULL,
  akademik_yil integer NOT NULL,
  not_kodu text,
  ts integer DEFAULT 1,
  akts integer NOT NULL DEFAULT 0,
  vize_notu numeric,
  final_notu numeric,
  butunleme_notu numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_dersleri_pkey PRIMARY KEY (ders_kayit_id),
  CONSTRAINT ogrenci_dersleri_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT fk_ogrenci_dersleri_dersler FOREIGN KEY (ders_kodu) REFERENCES public.dersler(ders_kodu)
);
CREATE TABLE public.ogrenci_durum_gecmisi (
  gecmis_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  eski_durum_id uuid,
  yeni_durum_id uuid NOT NULL,
  degisiklik_nedeni text NOT NULL,
  degistiren_kullanici_id uuid,
  otomatik_mi boolean DEFAULT false,
  degisiklik_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_durum_gecmisi_pkey PRIMARY KEY (gecmis_id),
  CONSTRAINT ogrenci_durum_gecmisi_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT ogrenci_durum_gecmisi_eski_durum_id_fkey FOREIGN KEY (eski_durum_id) REFERENCES public.durum_turleri(durum_id),
  CONSTRAINT ogrenci_durum_gecmisi_yeni_durum_id_fkey FOREIGN KEY (yeni_durum_id) REFERENCES public.durum_turleri(durum_id),
  CONSTRAINT ogrenci_durum_gecmisi_degistiren_kullanici_id_fkey FOREIGN KEY (degistiren_kullanici_id) REFERENCES public.kullanicilar(kullanici_id)
);
CREATE TABLE public.ogrenci_risk_analizi (
  analiz_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  risk_skoru integer NOT NULL,
  risk_seviyesi text NOT NULL,
  tehlike_turu text NOT NULL,
  hayalet_ogrenci_mi boolean DEFAULT false,
  risk_faktorleri jsonb,
  hesaplama_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_risk_analizi_pkey PRIMARY KEY (analiz_id),
  CONSTRAINT ogrenci_risk_analizi_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.ogrenci_son_login (
  ogrenci_id uuid NOT NULL,
  son_login timestamp with time zone,
  son_login_ip text,
  son_login_user_agent text,
  guncelleme_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_son_login_pkey PRIMARY KEY (ogrenci_id),
  CONSTRAINT ogrenci_son_login_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.program_turleri (
  program_turu_id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_adi text NOT NULL,
  program_kodu text NOT NULL,
  maksimum_sure_yil integer NOT NULL,
  maksimum_sure_yariyil integer NOT NULL,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_turleri_pkey PRIMARY KEY (program_turu_id)
);
CREATE TABLE public.simulasyon_senaryolari (
  senaryo_id uuid NOT NULL DEFAULT gen_random_uuid(),
  senaryo_adi text NOT NULL,
  hedef_yeni_ogrenci_sayisi integer NOT NULL,
  program_turu_dagilimi jsonb,
  simulasyon_sonucu jsonb,
  olusturan_kullanici_id uuid,
  olusturma_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT simulasyon_senaryolari_pkey PRIMARY KEY (senaryo_id),
  CONSTRAINT simulasyon_senaryolari_olusturan_kullanici_id_fkey FOREIGN KEY (olusturan_kullanici_id) REFERENCES public.kullanicilar(kullanici_id)
);
CREATE TABLE public.sistem_ayarlari (
  ayar_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ayar_anahtari text NOT NULL,
  ayar_degeri text NOT NULL,
  ayar_turu text NOT NULL,
  aciklama text,
  guncellenebilir_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sistem_ayarlari_pkey PRIMARY KEY (ayar_id)
);
CREATE TABLE public.surec_darbogaz_analizi (
  analiz_id uuid NOT NULL DEFAULT gen_random_uuid(),
  asama text NOT NULL,
  program_turu_id uuid,
  takilan_ogrenci_sayisi integer DEFAULT 0,
  ortalama_takilma_suresi_ay numeric,
  maksimum_takilma_suresi_ay numeric,
  minimum_takilma_suresi_ay numeric,
  kritik_darbogaz_mi boolean DEFAULT false,
  darbogaz_seviyesi text,
  analiz_tarihi timestamp with time zone DEFAULT now(),
  akademik_yil integer,
  yariyil integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT surec_darbogaz_analizi_pkey PRIMARY KEY (analiz_id),
  CONSTRAINT surec_darbogaz_analizi_program_turu_id_fkey FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id)
);
CREATE TABLE public.tez_donem_kayitlari (
  kayit_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  yariyil integer NOT NULL,
  akademik_yil integer NOT NULL,
  danisman_degerlendirmesi text,
  degerlendirme_tarihi date,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tez_donem_kayitlari_pkey PRIMARY KEY (kayit_id),
  CONSTRAINT tez_donem_kayitlari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.tik_toplantilari (
  toplanti_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  toplanti_tarihi date NOT NULL,
  katilim_durumu text,
  rapor_verildi_mi boolean DEFAULT false,
  rapor_tarihi date,
  rapor_icerigi text,
  uyari_gonderildi_mi boolean DEFAULT false,
  uyari_tarihi date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tik_toplantilari_pkey PRIMARY KEY (toplanti_id),
  CONSTRAINT tik_toplantilari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.veri_degisiklik_logu (
  log_id uuid NOT NULL DEFAULT gen_random_uuid(),
  tablo_adi text NOT NULL,
  kayit_id uuid NOT NULL,
  eski_deger jsonb,
  yeni_deger jsonb,
  degisiklik_turu text NOT NULL,
  degistiren_kullanici_id uuid,
  degisiklik_tarihi timestamp with time zone DEFAULT now(),
  ip_adresi text,
  user_agent text,
  degisiklik_notu text,
  CONSTRAINT veri_degisiklik_logu_pkey PRIMARY KEY (log_id),
  CONSTRAINT veri_degisiklik_logu_degistiren_kullanici_id_fkey FOREIGN KEY (degistiren_kullanici_id) REFERENCES public.kullanicilar(kullanici_id)
);
CREATE TABLE public.veri_yukleme_gecmisi (
  yukleme_id uuid NOT NULL DEFAULT gen_random_uuid(),
  dosya_adi text NOT NULL,
  dosya_boyutu_kb integer,
  yuklenen_satir_sayisi integer NOT NULL DEFAULT 0,
  basarili_satir_sayisi integer NOT NULL DEFAULT 0,
  hatali_satir_sayisi integer NOT NULL DEFAULT 0,
  hata_detaylari jsonb DEFAULT '[]'::jsonb,
  yukleyen_kullanici_id uuid,
  yukleme_tarihi timestamp with time zone DEFAULT now(),
  yukleme_durumu text,
  islem_suresi_saniye numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT veri_yukleme_gecmisi_pkey PRIMARY KEY (yukleme_id),
  CONSTRAINT veri_yukleme_gecmisi_yukleyen_kullanici_id_fkey FOREIGN KEY (yukleyen_kullanici_id) REFERENCES public.kullanicilar(kullanici_id)
);