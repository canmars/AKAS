# AKAS - Akademik Karar Analiz Sistemi
## Proje Özeti Dokümantasyonu

### 1. 📝 Proje Özeti
**AKAS (Akademik Karar Analiz Sistemi)**, Dokuz Eylül Üniversitesi Yönetim Bilişim Sistemleri (YBS) Bölümü için özel olarak geliştirilmiş bir Karar Destek Sistemidir (KDS). Özellikle lisansüstü eğitim süreçlerini (Tezli/Tezsiz Yüksek Lisans ve Doktora) kapsayan bu sistem, operasyonel veri takibinden ziyade **stratejik karar alma süreçlerine** odaklanmaktadır.

Sistem; öğrencilerin akademik ilerleyişini, danışman performanslarını, ders başarılarını ve risk faktörlerini analiz ederek Bölüm Başkanı'nın veri odaklı kararlar almasını sağlayan interaktif bir dashboard sunar.

### 2. 🎯 Amaç
Projenin temel amacı; bölümdeki akademik süreçlerin verimliliğini artırmak ve olası aksaklıkları (öğrenci başarısızlığı, atılma, danışman yük dengesizliği vb.) önceden tespit etmektir. Geleneksel Öğrenci İşleri Otomasyonlarından farklı olarak, AKAS **"Ne oldu?"** sorusundan çok **"Neden oldu?"** ve **"Ne olacak?"** sorularına cevap vermeyi hedefler.

### 3. 🚀 Hedefler ve Karar Alanları
Sistem, Bölüm Başkanı'nın aşağıdaki 6 temel alanda karar vermesini kolaylaştırmayı hedefler:

1.  **Danışman Atama ve Yük Yönetimi**: Yeni öğrencilere en uygun danışmanın atanması ve akademik personel arasındaki yük dengesinin sağlanması.
2.  **Risk Altındaki Öğrencilerin Tespiti**: Başarısızlık veya atılma riski taşıyan öğrencilerin erken tespiti ve müdahale stratejilerinin belirlenmesi.
3.  **Program Kontenjan ve Kaynak Planlaması**: Hangi programa ne kadar kontenjan ayrılacağı ve akademik kaynakların nasıl dağıtılacağı.
4.  **Aşama Takibi ve Süreç Yönetimi**: Öğrencilerin tez, yeterlik, dönem projesi gibi kritik aşamalardaki gecikmelerinin analizi.
5.  **Performans Analizi**: Öğrenci ve danışman bazlı başarı metriklerinin takibi ve mezuniyet tahminleri.
6.  **Eğitim Kalitesi ve Ders Analizi**: Başarısızlık oranlarının yüksek olduğu derslerin tespiti ve not yığılmalarının analizi.

---

### 4. 🏗️ Proje Mimarisi ve Klasör Yapısı (MVC)

Proje, **Model-View-Controller (MVC)** tasarım desenine sadık kalınarak yapılandırılmıştır. Bu yapı, hem Backend hem de Frontend tarafında kodun sürdürülebilirliğini, okunabilirliğini ve geliştirilebilirliğini artırmayı hedefler.

#### **Mimari Yaklaşım**
*   **Model**: Veritabanı şeması ve veri erişim katmanı (Supabase/PostgreSQL).
*   **View**: Kullanıcının etkileşime girdiği arayüz (React Frontend).
*   **Controller**: İş mantığının (Business Logic) işlendiği ve Model-View arasındaki iletişimi sağlayan katman (Node.js Backend).

#### **Teknoloji Yığını (Tech Stack)**
*   **Frontend**: React.js, Vite, Tailwind CSS, Chart.js
*   **Backend**: Node.js, Express.js
*   **Veritabanı**: PostgreSQL (Supabase)

#### **Detaylı Klasör Yapısı**
Aşağıda, projenin hedeflediği **tam klasör yapısı** yer almaktadır. Bazı klasörler henüz boş olabilir ancak yapısal bütünlük için oluşturulmuştur.

```
AKAS/
├── backend/                        # 🧠 BACKEND (Node.js/Express)
│   ├── server/
│   │   ├── config/                 # Konfigürasyon dosyaları (db, cors vb.)
│   │   ├── controllers/            # İş mantığı (Business Logic)
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   └── studentController.js
│   │   ├── middlewares/            # Ara katman yazılımları (Auth, Error Handling)
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/                 # Veri modelleri ve DB sorguları (Supabase)
│   │   │   ├── studentModel.js
│   │   │   └── userModel.js
│   │   ├── routers/                # API Rotaları (URL Yönlendirmeleri)
│   │   │   ├── authRouters.js
│   │   │   └── dashboardRouters.js
│   │   ├── utils/                  # Yardımcı fonksiyonlar
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   └── server.js               # Entry Point (Uygulama Giriş Noktası)
│   ├── scripts/                    # Veri tohumlama/bakım scriptleri
│   ├── .env                        # Hassas ortam değişkenleri
│   └── package.json                # Backend bağımlılıkları
│
├── frontend/                       # 🎨 FRONTEND (React)
│   ├── src/
│   │   ├── assets/                 # Statik dosyalar (Görseller, ikonlar)
│   │   ├── components/             # Tekrar kullanılabilir UI bileşenleri
│   │   │   ├── common/             # Genel bileşenler (Button, Input)
│   │   │   ├── dashboard/          # Dashboard'a özel bileşenler
│   │   │   └── layout/             # Header, Sidebar vb.
│   │   ├── contexts/               # React Context (Global State)
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── layouts/                # Sayfa şablonları (MainLayout, AuthLayout)
│   │   ├── pages/                  # Sayfa Görünümleri (Views)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── StageTracking.jsx
│   │   ├── services/               # API Servisleri (Backend ile iletişim)
│   │   │   ├── api.js              # Axios instance
│   │   │   └── authService.js
│   │   ├── styles/                 # Global stiller ve Tailwind ayarları
│   │   ├── utils/                  # Frontend yardımcı fonksiyonları
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx                 # Ana React Bileşeni ve Router Tanımları
│   │   └── main.jsx                # React Entry Point
│   ├── index.html                  # Ana HTML Dosyası
│   ├── vite.config.js              # Vite Konfigürasyonu
│   ├── tailwind.config.js          # Tailwind Konfigürasyonu
│   └── package.json                # Frontend bağımlılıkları
│
└── package.json                    # Root orkestrasyon dosyası
```

---

### 5. 🗄️ Güncel Veritabanı Şeması

Aşağıda projenin güncel veritabanı şeması (Entity-Relationship yapısı) yer almaktadır.

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.adminler (
  admin_id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  ad text NOT NULL,
  soyad text NOT NULL,
  telefon text,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT adminler_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.akademik_personel (
  personel_id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  rol text CHECK (rol = ANY (ARRAY['Danisman'::text, 'Bolum_Baskani'::text])),
  anabilim_dali_baskani_mi boolean DEFAULT false,
  CONSTRAINT akademik_personel_pkey PRIMARY KEY (personel_id),
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
CREATE TABLE public.asama_tanimlari (
  asama_tanimi_id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_turu_id uuid NOT NULL,
  asama_kodu text NOT NULL,
  asama_adi text NOT NULL,
  sira_no integer NOT NULL,
  azami_sure_yariyil integer,
  azami_sure_yil integer,
  gecis_kosullari jsonb,
  kontrol_verileri ARRAY,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT asama_tanimlari_pkey PRIMARY KEY (asama_tanimi_id),
  CONSTRAINT asama_tanimlari_program_turu_id_fkey FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id)
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
CREATE TABLE public.dersler (
  ders_kodu text NOT NULL,
  ders_adi text NOT NULL,
  ders_turu text NOT NULL,
  akts integer NOT NULL DEFAULT 0,
  kritik_darbogaz_mi boolean DEFAULT false,
  aktif_mi boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  program_turu_id uuid,
  CONSTRAINT dersler_pkey PRIMARY KEY (ders_kodu),
  CONSTRAINT dersler_program_turu_id_fkey FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id)
);
CREATE TABLE public.durum_turleri (
  durum_id uuid NOT NULL DEFAULT gen_random_uuid(),
  durum_adi text NOT NULL,
  durum_kodu text NOT NULL,
  sira_no integer NOT NULL,
  aciklama text,
  CONSTRAINT durum_turleri_pkey PRIMARY KEY (durum_id)
);
CREATE TABLE public.ogrenci (
  ogrenci_id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  soft_delete boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  program_kabul_turu uuid,
  kabul_turu text CHECK (kabul_turu = ANY (ARRAY['Lisans'::text, 'Yuksek_Lisans'::text])),
  CONSTRAINT ogrenci_pkey PRIMARY KEY (ogrenci_id),
  CONSTRAINT ogrenci_danisman_id_fkey FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT fk_ogrenci_program_turu FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id),
  CONSTRAINT fk_ogrenci_durum FOREIGN KEY (durum_id) REFERENCES public.durum_turleri(durum_id),
  CONSTRAINT fk_ogrenci_danisman FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT fk_ogrenci_program_kabul_turu FOREIGN KEY (program_kabul_turu) REFERENCES public.program_turleri(program_turu_id)
);
CREATE TABLE public.ogrenci_akademik_durum (
  ogrenci_id uuid NOT NULL,
  mevcut_yariyil integer NOT NULL DEFAULT 1,
  ders_tamamlandi_mi boolean DEFAULT false,
  tamamlanan_ders_sayisi integer DEFAULT 0,
  guncelleme_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  mevcut_asama_id uuid,
  not_ortalamasi numeric,
  tamamlanan_akts integer DEFAULT 0,
  CONSTRAINT ogrenci_akademik_durum_pkey PRIMARY KEY (ogrenci_id),
  CONSTRAINT ogrenci_akademik_durum_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT ogrenci_akademik_durum_mevcut_asama_id_fkey FOREIGN KEY (mevcut_asama_id) REFERENCES public.ogrenci_asamalari(asama_id)
);
CREATE TABLE public.ogrenci_asamalari (
  asama_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  asama_tanimi_id uuid NOT NULL,
  baslangic_tarihi date NOT NULL,
  bitis_tarihi date,
  durum text NOT NULL CHECK (durum = ANY (ARRAY['Devam_Ediyor'::text, 'Tamamlandi'::text, 'Basarisiz'::text, 'Iptal'::text])),
  tamamlanma_nedeni text,
  gecikme_yariyil integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_asamalari_pkey PRIMARY KEY (asama_id),
  CONSTRAINT ogrenci_asamalari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT ogrenci_asamalari_asama_tanimi_id_fkey FOREIGN KEY (asama_tanimi_id) REFERENCES public.asama_tanimlari(asama_tanimi_id)
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
  otomatik_mi boolean DEFAULT false,
  degisiklik_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  degistiren_admin_id uuid,
  degistiren_personel_id uuid,
  CONSTRAINT ogrenci_durum_gecmisi_pkey PRIMARY KEY (gecmis_id),
  CONSTRAINT ogrenci_durum_gecmisi_degistiren_admin_id_fkey FOREIGN KEY (degistiren_admin_id) REFERENCES public.adminler(admin_id),
  CONSTRAINT ogrenci_durum_gecmisi_degistiren_personel_id_fkey FOREIGN KEY (degistiren_personel_id) REFERENCES public.akademik_personel(personel_id),
  CONSTRAINT ogrenci_durum_gecmisi_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id),
  CONSTRAINT ogrenci_durum_gecmisi_eski_durum_id_fkey FOREIGN KEY (eski_durum_id) REFERENCES public.durum_turleri(durum_id),
  CONSTRAINT ogrenci_durum_gecmisi_yeni_durum_id_fkey FOREIGN KEY (yeni_durum_id) REFERENCES public.durum_turleri(durum_id)
);
CREATE TABLE public.ogrenci_risk_skorlari (
  risk_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL UNIQUE,
  risk_skoru integer NOT NULL CHECK (risk_skoru >= 0 AND risk_skoru <= 100),
  risk_seviyesi text NOT NULL CHECK (risk_seviyesi = ANY (ARRAY['Dusuk'::text, 'Orta'::text, 'Yuksek'::text, 'Kritik'::text])),
  risk_faktorleri jsonb,
  tahmini_mezuniyet_tarihi date,
  azami_sureye_yakinlik_yuzdesi numeric,
  hesaplama_tarihi timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ogrenci_risk_skorlari_pkey PRIMARY KEY (risk_id),
  CONSTRAINT ogrenci_risk_skorlari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
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
CREATE TABLE public.tez_onerileri (
  oneri_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  oneri_tarihi date NOT NULL,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Kabul'::text, 'Ret'::text, 'Revizyon_Gerekli'::text])),
  revizyon_tarihi date,
  nihai_sonuc text CHECK (nihai_sonuc = ANY (ARRAY['Kabul'::text, 'Ret'::text])),
  tez_konusu text,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tez_onerileri_pkey PRIMARY KEY (oneri_id),
  CONSTRAINT tez_onerileri_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.tez_savunmalari (
  savunma_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  savunma_tarihi date NOT NULL,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Kabul'::text, 'Duzeltme_Gerekli'::text, 'Red'::text])),
  duzeltme_tarihi date,
  nihai_sonuc text CHECK (nihai_sonuc = ANY (ARRAY['Kabul'::text, 'Red'::text])),
  jüri_uyeleri ARRAY,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tez_savunmalari_pkey PRIMARY KEY (savunma_id),
  CONSTRAINT tez_savunmalari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
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
  toplanti_no integer,
  sonuc text CHECK (sonuc = ANY (ARRAY['Basarili'::text, 'Basarisiz'::text, 'Yetersiz'::text])),
  degerlendirme text,
  CONSTRAINT tik_toplantilari_pkey PRIMARY KEY (toplanti_id),
  CONSTRAINT tik_toplantilari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
CREATE TABLE public.yeterlik_sinavlari (
  sinav_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ogrenci_id uuid NOT NULL,
  sinav_tarihi date NOT NULL,
  deneme_no integer NOT NULL DEFAULT 1,
  sonuc text NOT NULL CHECK (sonuc = ANY (ARRAY['Basarili'::text, 'Basarisiz'::text])),
  notu numeric,
  aciklama text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT yeterlik_sinavlari_pkey PRIMARY KEY (sinav_id),
  CONSTRAINT yeterlik_sinavlari_ogrenci_id_fkey FOREIGN KEY (ogrenci_id) REFERENCES public.ogrenci(ogrenci_id)
);
```
