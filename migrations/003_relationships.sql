-- Migration 003: Relationship Tables
-- İlişki tabloları: danisman_gecmisi, akademik_personel_uzmanlik

-- ============================================
-- DANISMAN GECMISI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.danisman_gecmisi (
  gecmis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  danisman_id UUID REFERENCES public.akademik_personel(personel_id) NOT NULL,
  atama_tarihi DATE NOT NULL,
  ayrilma_tarihi DATE,
  aktif_mi BOOLEAN DEFAULT true,
  degisiklik_nedeni TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Partial Unique Index: Her öğrenci için sadece bir aktif danışman olabilir
CREATE UNIQUE INDEX IF NOT EXISTS unique_aktif_danisman 
ON public.danisman_gecmisi(ogrenci_id) 
WHERE aktif_mi = true;

-- ============================================
-- AKADEMIK PERSONEL UZMANLIK TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.akademik_personel_uzmanlik (
  personel_uzmanlik_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personel_id UUID REFERENCES public.akademik_personel(personel_id) ON DELETE CASCADE NOT NULL,
  uzmanlik_alani TEXT NOT NULL,
  ana_uzmanlik_mi BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_personel_uzmanlik UNIQUE (personel_id, uzmanlik_alani)
);

-- ============================================
-- AKADEMIK MILESTONE TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.akademik_milestone (
  milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  milestone_turu TEXT NOT NULL CHECK (milestone_turu IN ('Yeterlik_Sinavi', 'Tez_Onersi', 'Tez_Savunmasi', 'Donem_Projesi')),
  hedef_tarih DATE NOT NULL,
  gerceklesme_tarihi DATE,
  savunma_sonucu TEXT CHECK (savunma_sonucu IN ('Onaylandi', 'Revizyon_Gerekli', 'Red')),
  ek_sure_ay INT DEFAULT 0,
  yeni_hedef_tarih DATE,
  durum TEXT NOT NULL CHECK (durum IN ('Beklemede', 'Tamamlandi', 'Gecikmis', 'Iptal')),
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TIK TOPLANTILARI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.tik_toplantilari (
  toplanti_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  toplanti_tarihi DATE NOT NULL,
  katilim_durumu TEXT CHECK (katilim_durumu IN ('Katildi', 'Katilmadi', 'Raporlu', 'Mazeretli')),
  rapor_verildi_mi BOOLEAN DEFAULT false,
  rapor_tarihi DATE,
  rapor_icerigi TEXT,
  uyari_gonderildi_mi BOOLEAN DEFAULT false,
  uyari_tarihi DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TEZ DONEM KAYITLARI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.tez_donem_kayitlari (
  kayit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  yariyil INT NOT NULL,
  akademik_yil INT NOT NULL,
  danisman_degerlendirmesi TEXT CHECK (danisman_degerlendirmesi IN ('Basarili', 'Basarisiz', 'Gelismekte_Olan', 'Yetersiz')),
  degerlendirme_tarihi DATE,
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_ogrenci_yariyil UNIQUE (ogrenci_id, yariyil, akademik_yil)
);

-- ============================================
-- OGRENCI AKADEMIK DURUM TABLOSU
-- Normalizasyon: ogrenci tablosundan taşınan akademik durum bilgileri
-- ============================================
CREATE TABLE IF NOT EXISTS public.ogrenci_akademik_durum (
  ogrenci_id UUID PRIMARY KEY REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  mevcut_asinama TEXT CHECK (mevcut_asinama IN ('Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi')),
  mevcut_yariyil INT NOT NULL DEFAULT 1, -- Mevcut yarıyıl (view ile hesaplanır, burada cache olarak tutulur)
  ders_tamamlandi_mi BOOLEAN DEFAULT false, -- Tezli YL için
  tamamlanan_ders_sayisi INT DEFAULT 0, -- Tezsiz YL için
  guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- KULLANICI AKTIVITELERI TABLOSU
-- Normalizasyon: Kullanıcı aktivite logları
-- ============================================
CREATE TABLE IF NOT EXISTS public.kullanici_aktiviteleri (
  aktivite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id) ON DELETE CASCADE,
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  aktivite_turu TEXT NOT NULL CHECK (aktivite_turu IN ('Login', 'Logout', 'Sayfa_Ziyareti', 'Veri_Guncelleme', 'Rapor_Goruntuleme')),
  aktivite_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_adresi TEXT,
  user_agent TEXT,
  ek_bilgi JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_kullanici_or_ogrenci CHECK (
    (kullanici_id IS NOT NULL AND ogrenci_id IS NULL) OR
    (kullanici_id IS NULL AND ogrenci_id IS NOT NULL)
  )
);

-- ============================================
-- OGRENCI SON LOGIN TABLOSU
-- Normalizasyon: Öğrenci son login bilgisi (1:1 ilişki)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ogrenci_son_login (
  ogrenci_id UUID PRIMARY KEY REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  son_login TIMESTAMP WITH TIME ZONE,
  son_login_ip TEXT,
  son_login_user_agent TEXT,
  guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- OGRENCI DERSLERI TABLOSU
-- Normalizasyon: Öğrenci ders kayıtları ve notları (BCNF uyumlu)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ogrenci_dersleri (
  ders_kayit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  ders_kodu TEXT NOT NULL, -- Ders kodu (örn: YBS501, YBS502)
  ders_adi TEXT NOT NULL, -- Ders adı
  yariyil INT NOT NULL, -- Hangi yarıyılda alındı
  akademik_yil INT NOT NULL, -- Hangi akademik yılda alındı
  not_kodu TEXT CHECK (not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'B', 'Y', 'H', 'M', 'D', 'E', 'K', 'P', 'T', 'Z')),
  -- Not kodları: AA-FF (harf notları), B (Başarılı), Y (Yetersiz), H (Hak Dondurma), 
  -- M (Mazeretli), D (Devamsız), E (Eksik), K (Kaldırıldı), P (Pas), T (Tekrar), Z (Zayıf)
  ts INT DEFAULT 1, -- Tekrar Sayısı (1 = ilk alış, 2+ = tekrar)
  akts INT NOT NULL DEFAULT 0, -- AKTS kredisi
  vize_notu NUMERIC(5,2), -- Vize notu (opsiyonel)
  final_notu NUMERIC(5,2), -- Final notu (opsiyonel)
  butunleme_notu NUMERIC(5,2), -- Bütünleme notu (opsiyonel)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_ogrenci_ders_yariyil UNIQUE (ogrenci_id, ders_kodu, yariyil, akademik_yil, ts)
);

-- Ogrenci dersleri -> dersler (Foreign Key Constraint)
-- NOT: Bu constraint 002_reference_tables.sql'de eklenemezdi çünkü ogrenci_dersleri tablosu henüz oluşturulmamıştı
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_ogrenci_dersleri_dersler'
  ) THEN
    ALTER TABLE public.ogrenci_dersleri
    ADD CONSTRAINT fk_ogrenci_dersleri_dersler
    FOREIGN KEY (ders_kodu) REFERENCES public.dersler(ders_kodu);
  END IF;
END $$;

-- ============================================
-- AKADEMIK TAKVIM TABLOSU
-- Güz/Bahar başlangıç tarihleri ve yarıyıl sınırları
-- ============================================
CREATE TABLE IF NOT EXISTS public.akademik_takvim (
  takvim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  akademik_yil INT NOT NULL, -- Akademik yıl (örn: 2024)
  donem TEXT NOT NULL CHECK (donem IN ('Guz', 'Bahar', 'Yaz')), -- Dönem türü
  yariyil_no INT NOT NULL, -- Yarıyıl numarası (1, 2, 3, ...)
  baslangic_tarihi DATE NOT NULL, -- Dönem başlangıç tarihi
  bitis_tarihi DATE NOT NULL, -- Dönem bitiş tarihi
  kayit_baslangic_tarihi DATE, -- Kayıt başlangıç tarihi
  kayit_bitis_tarihi DATE, -- Kayıt bitiş tarihi
  ders_baslangic_tarihi DATE, -- Ders başlangıç tarihi
  ders_bitis_tarihi DATE, -- Ders bitiş tarihi
  sinav_baslangic_tarihi DATE, -- Sınav başlangıç tarihi
  sinav_bitis_tarihi DATE, -- Sınav bitiş tarihi
  aktif_mi BOOLEAN DEFAULT true, -- Aktif dönem mi?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_akademik_yil_donem UNIQUE (akademik_yil, donem, yariyil_no)
);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.danisman_gecmisi IS 'Öğrenci-danışman ilişki geçmişi';
COMMENT ON TABLE public.akademik_personel_uzmanlik IS 'Akademik personel uzmanlık alanları';
COMMENT ON TABLE public.akademik_milestone IS 'Akademik kilometre taşları (Yeterlik, Tez Önerisi, vb.)';
COMMENT ON TABLE public.tik_toplantilari IS 'TİK (Tez İzleme Komitesi) toplantı kayıtları';
COMMENT ON TABLE public.tez_donem_kayitlari IS 'Tez dönem kayıtları ve değerlendirmeleri';
COMMENT ON TABLE public.ogrenci_akademik_durum IS 'Öğrenci akademik durum bilgileri (normalizasyon tablosu)';
COMMENT ON TABLE public.kullanici_aktiviteleri IS 'Kullanıcı aktivite logları (normalizasyon tablosu)';
COMMENT ON TABLE public.ogrenci_son_login IS 'Öğrenci son login bilgisi (normalizasyon tablosu)';
COMMENT ON TABLE public.ogrenci_dersleri IS 'Öğrenci ders kayıtları ve notları (BCNF normalizasyonu)';
COMMENT ON COLUMN public.ogrenci_dersleri.ts IS 'Tekrar Sayısı (1 = ilk alış, 2+ = tekrar) - TS çarpanlı risk formülü için';
COMMENT ON COLUMN public.ogrenci_dersleri.akts IS 'AKTS kredisi - 7 ders + 60 AKTS kuralı için';
COMMENT ON COLUMN public.ogrenci_dersleri.not_kodu IS 'H (Hak Dondurma) notu azami süre hesabından düşülür';
COMMENT ON TABLE public.akademik_takvim IS 'Akademik takvim: Güz/Bahar başlangıç tarihleri ve yarıyıl sınırları';

