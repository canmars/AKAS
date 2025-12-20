-- Migration 004: Indexes and System Tables
-- İndeksler ve sistem tabloları

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- BILDIRIMLER TABLOSU
CREATE TABLE IF NOT EXISTS public.bildirimler (
  bildirim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bildirim_turu_id UUID REFERENCES public.bildirim_turleri(bildirim_turu_id) NOT NULL,
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  alici_kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id) NOT NULL,
  alici_rol TEXT NOT NULL,
  mesaj TEXT NOT NULL,
  bildirim_onceligi TEXT NOT NULL CHECK (bildirim_onceligi IN ('Dusuk', 'Orta', 'Yuksek', 'Kritik')),
  bildirim_durumu TEXT NOT NULL CHECK (bildirim_durumu IN ('Olusturuldu', 'Gonderildi', 'Okundu', 'Arsivlendi')),
  okundu_mi BOOLEAN DEFAULT false,
  okunma_tarihi TIMESTAMP WITH TIME ZONE,
  olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OGRENCI RISK ANALIZI TABLOSU
CREATE TABLE IF NOT EXISTS public.ogrenci_risk_analizi (
  analiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  risk_skoru INT NOT NULL CHECK (risk_skoru >= 0 AND risk_skoru <= 100),
  risk_seviyesi TEXT NOT NULL CHECK (risk_seviyesi IN ('Dusuk', 'Orta', 'Yuksek', 'Kritik')),
  tehlike_turu TEXT NOT NULL,
  hayalet_ogrenci_mi BOOLEAN DEFAULT false,
  risk_faktorleri JSONB,
  hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_ogrenci_risk UNIQUE (ogrenci_id, hesaplama_tarihi)
);

-- OGRENCI DURUM GECMISI TABLOSU
CREATE TABLE IF NOT EXISTS public.ogrenci_durum_gecmisi (
  gecmis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE NOT NULL,
  eski_durum_id UUID REFERENCES public.durum_turleri(durum_id),
  yeni_durum_id UUID REFERENCES public.durum_turleri(durum_id) NOT NULL,
  degisiklik_nedeni TEXT NOT NULL,
  degistiren_kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  otomatik_mi BOOLEAN DEFAULT false,
  degisiklik_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SISTEM AYARLARI TABLOSU
CREATE TABLE IF NOT EXISTS public.sistem_ayarlari (
  ayar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayar_anahtari TEXT NOT NULL UNIQUE,
  ayar_degeri TEXT NOT NULL,
  ayar_turu TEXT NOT NULL CHECK (ayar_turu IN ('String', 'Integer', 'Boolean', 'JSON')),
  aciklama TEXT,
  guncellenebilir_mi BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SIMULASYON SENARYOLARI TABLOSU
CREATE TABLE IF NOT EXISTS public.simulasyon_senaryolari (
  senaryo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senaryo_adi TEXT NOT NULL,
  hedef_yeni_ogrenci_sayisi INT NOT NULL,
  program_turu_dagilimi JSONB,
  simulasyon_sonucu JSONB,
  olusturan_kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- INDEXES - KULLANICILAR
-- ============================================
CREATE INDEX IF NOT EXISTS idx_kullanicilar_email ON public.kullanicilar(email);
CREATE INDEX IF NOT EXISTS idx_kullanicilar_rol ON public.kullanicilar(rol);
CREATE INDEX IF NOT EXISTS idx_kullanicilar_aktif ON public.kullanicilar(aktif_mi) WHERE aktif_mi = true;
CREATE INDEX IF NOT EXISTS idx_kullanicilar_personel ON public.kullanicilar(akademik_personel_id) WHERE akademik_personel_id IS NOT NULL;

-- ============================================
-- INDEXES - AKADEMIK PERSONEL
-- ============================================
CREATE INDEX IF NOT EXISTS idx_akademik_personel_email ON public.akademik_personel(email);
CREATE INDEX IF NOT EXISTS idx_akademik_personel_unvan ON public.akademik_personel(unvan);
CREATE INDEX IF NOT EXISTS idx_akademik_personel_aktif ON public.akademik_personel(aktif_mi) WHERE aktif_mi = true;
CREATE INDEX IF NOT EXISTS idx_akademik_personel_anabilim_dali ON public.akademik_personel(anabilim_dali_id);

-- ============================================
-- INDEXES - OGRENCI
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ogrenci_program_turu ON public.ogrenci(program_turu_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_durum ON public.ogrenci(durum_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_kayit_tarihi ON public.ogrenci(kayit_tarihi);
-- idx_ogrenci_son_login kaldırıldı (ogrenci_son_login tablosuna taşındı)
-- idx_ogrenci_risk_skoru kaldırıldı (ogrenci_risk_analizi tablosunda zaten var)
CREATE INDEX IF NOT EXISTS idx_ogrenci_soft_delete ON public.ogrenci(soft_delete) WHERE soft_delete = false;
CREATE INDEX IF NOT EXISTS idx_ogrenci_program_durum ON public.ogrenci(program_turu_id, durum_id);

-- ============================================
-- INDEXES - REFERENCE TABLES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_program_turleri_kod ON public.program_turleri(program_kodu);
CREATE INDEX IF NOT EXISTS idx_program_turleri_aktif ON public.program_turleri(aktif_mi) WHERE aktif_mi = true;
CREATE INDEX IF NOT EXISTS idx_anabilim_dallari_kod ON public.anabilim_dallari(anabilim_dali_kodu);
CREATE INDEX IF NOT EXISTS idx_durum_turleri_kod ON public.durum_turleri(durum_kodu);
CREATE INDEX IF NOT EXISTS idx_bildirim_turleri_kod ON public.bildirim_turleri(bildirim_turu_kodu);

-- ============================================
-- INDEXES - DERSLER
-- ============================================
CREATE INDEX IF NOT EXISTS idx_dersler_ders_turu ON public.dersler(ders_turu);
CREATE INDEX IF NOT EXISTS idx_dersler_kritik_darbogaz ON public.dersler(kritik_darbogaz_mi) WHERE kritik_darbogaz_mi = true;
CREATE INDEX IF NOT EXISTS idx_dersler_aktif ON public.dersler(aktif_mi) WHERE aktif_mi = true;

-- ============================================
-- INDEXES - RELATIONSHIP TABLES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_ogrenci ON public.danisman_gecmisi(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_aktif ON public.danisman_gecmisi(aktif_mi) WHERE aktif_mi = true;
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_danisman ON public.danisman_gecmisi(danisman_id);
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_danisman_durum ON public.danisman_gecmisi(danisman_id, aktif_mi) WHERE aktif_mi = true;

CREATE INDEX IF NOT EXISTS idx_personel_uzmanlik_personel ON public.akademik_personel_uzmanlik(personel_id);
CREATE INDEX IF NOT EXISTS idx_personel_uzmanlik_alani ON public.akademik_personel_uzmanlik(uzmanlik_alani);

CREATE INDEX IF NOT EXISTS idx_milestone_ogrenci ON public.akademik_milestone(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_milestone_ogrenci_tur ON public.akademik_milestone(ogrenci_id, milestone_turu);
CREATE INDEX IF NOT EXISTS idx_milestone_hedef_tarih ON public.akademik_milestone(hedef_tarih) WHERE durum = 'Beklemede';
CREATE INDEX IF NOT EXISTS idx_milestone_tur ON public.akademik_milestone(milestone_turu);

CREATE INDEX IF NOT EXISTS idx_tik_ogrenci ON public.tik_toplantilari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_tik_ogrenci_tarih ON public.tik_toplantilari(ogrenci_id, toplanti_tarihi);
CREATE INDEX IF NOT EXISTS idx_tik_tarih ON public.tik_toplantilari(toplanti_tarihi);
CREATE INDEX IF NOT EXISTS idx_tik_katilim ON public.tik_toplantilari(katilim_durumu) WHERE katilim_durumu = 'Katilmadi';

CREATE INDEX IF NOT EXISTS idx_tez_donem_ogrenci ON public.tez_donem_kayitlari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_tez_donem_yariyil ON public.tez_donem_kayitlari(yariyil, akademik_yil);

-- ============================================
-- INDEXES - SYSTEM TABLES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bildirim_alici ON public.bildirimler(alici_kullanici_id);
CREATE INDEX IF NOT EXISTS idx_bildirim_okunmadi ON public.bildirimler(okundu_mi) WHERE okundu_mi = false;
CREATE INDEX IF NOT EXISTS idx_bildirim_oncelik ON public.bildirimler(bildirim_onceligi, bildirim_durumu);
CREATE INDEX IF NOT EXISTS idx_bildirim_tarih ON public.bildirimler(olusturma_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_bildirim_ogrenci ON public.bildirimler(ogrenci_id) WHERE ogrenci_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_risk_ogrenci ON public.ogrenci_risk_analizi(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_risk_ogrenci_tarih ON public.ogrenci_risk_analizi(ogrenci_id, hesaplama_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_risk_skoru ON public.ogrenci_risk_analizi(risk_skoru DESC) WHERE risk_skoru >= 70;
CREATE INDEX IF NOT EXISTS idx_risk_seviyesi ON public.ogrenci_risk_analizi(risk_seviyesi);

CREATE INDEX IF NOT EXISTS idx_durum_gecmisi_ogrenci ON public.ogrenci_durum_gecmisi(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_durum_gecmisi_tarih ON public.ogrenci_durum_gecmisi(degisiklik_tarihi DESC);

CREATE INDEX IF NOT EXISTS idx_sistem_ayarlari_anahtar ON public.sistem_ayarlari(ayar_anahtari);

CREATE INDEX IF NOT EXISTS idx_simulasyon_kullanici ON public.simulasyon_senaryolari(olusturan_kullanici_id);
CREATE INDEX IF NOT EXISTS idx_simulasyon_tarih ON public.simulasyon_senaryolari(olusturma_tarihi DESC);

-- ============================================
-- INDEXES - NORMALIZASYON TABLOLARI
-- ============================================

-- OGRENCI AKADEMIK DURUM
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_ogrenci ON public.ogrenci_akademik_durum(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_asinama ON public.ogrenci_akademik_durum(mevcut_asinama) WHERE mevcut_asinama IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_yariyil ON public.ogrenci_akademik_durum(mevcut_yariyil);
CREATE INDEX IF NOT EXISTS idx_ogrenci_akademik_durum_ders_tamamlandi ON public.ogrenci_akademik_durum(ders_tamamlandi_mi) WHERE ders_tamamlandi_mi = false;

-- KULLANICI AKTIVITELERI
CREATE INDEX IF NOT EXISTS idx_kullanici_aktiviteleri_kullanici ON public.kullanici_aktiviteleri(kullanici_id) WHERE kullanici_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kullanici_aktiviteleri_ogrenci ON public.kullanici_aktiviteleri(ogrenci_id) WHERE ogrenci_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kullanici_aktiviteleri_tarih ON public.kullanici_aktiviteleri(aktivite_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_kullanici_aktiviteleri_tur ON public.kullanici_aktiviteleri(aktivite_turu);
CREATE INDEX IF NOT EXISTS idx_kullanici_aktiviteleri_login ON public.kullanici_aktiviteleri(aktivite_turu, aktivite_tarihi DESC) WHERE aktivite_turu = 'Login';

-- OGRENCI SON LOGIN
CREATE INDEX IF NOT EXISTS idx_ogrenci_son_login_ogrenci ON public.ogrenci_son_login(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_son_login_tarih ON public.ogrenci_son_login(son_login) WHERE son_login IS NOT NULL;
-- NOT: idx_ogrenci_son_login_eski index'i kaldırıldı - CURRENT_DATE IMMUTABLE olmadığı için index predicate'inde kullanılamaz
-- Hayalet öğrenci sorguları için son_login üzerindeki genel index yeterlidir

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.bildirimler IS 'Sistem bildirimleri';
-- ============================================
-- INDEXES - OGRENCI DERSLERI
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ogrenci ON public.ogrenci_dersleri(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ders_kodu ON public.ogrenci_dersleri(ders_kodu);
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_yariyil ON public.ogrenci_dersleri(yariyil);
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_not_kodu ON public.ogrenci_dersleri(not_kodu) WHERE not_kodu IN ('H', 'M', 'D', 'E', 'K');
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ts ON public.ogrenci_dersleri(ogrenci_id, ts) WHERE ts > 1;
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_akts ON public.ogrenci_dersleri(ogrenci_id, akts);

-- ============================================
-- INDEXES - AKADEMIK TAKVIM
-- ============================================
CREATE INDEX IF NOT EXISTS idx_akademik_takvim_yil_donem ON public.akademik_takvim(akademik_yil, donem);
CREATE INDEX IF NOT EXISTS idx_akademik_takvim_yariyil ON public.akademik_takvim(yariyil_no);
CREATE INDEX IF NOT EXISTS idx_akademik_takvim_aktif ON public.akademik_takvim(aktif_mi) WHERE aktif_mi = true;
CREATE INDEX IF NOT EXISTS idx_akademik_takvim_tarih ON public.akademik_takvim(baslangic_tarihi, bitis_tarihi);

-- ============================================
-- INDEXES - OGRENCI (Demografik Bilgiler)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ogrenci_ogrenci_no ON public.ogrenci(ogrenci_no) WHERE ogrenci_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ogrenci_tc_kimlik ON public.ogrenci(tc_kimlik_no) WHERE tc_kimlik_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ogrenci_email ON public.ogrenci(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ogrenci_ad_soyad ON public.ogrenci(ad, soyad);
-- Kapasite Yönetimi: Danışman bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_danisman ON public.ogrenci(danisman_id) WHERE danisman_id IS NOT NULL;
-- Hayalet Takibi: Son giriş tarihi bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_son_login ON public.ogrenci(son_login) WHERE son_login IS NOT NULL;
-- NOT: idx_ogrenci_son_login_eski index'i kaldırıldı - CURRENT_DATE IMMUTABLE olmadığı için index predicate'inde kullanılamaz
-- Hayalet öğrenci sorguları için son_login üzerindeki genel index yeterlidir

COMMENT ON TABLE public.ogrenci_risk_analizi IS 'Öğrenci risk analizi kayıtları';
COMMENT ON TABLE public.ogrenci_durum_gecmisi IS 'Öğrenci durum değişiklik geçmişi';
COMMENT ON TABLE public.sistem_ayarlari IS 'Sistem ayarları';
COMMENT ON TABLE public.simulasyon_senaryolari IS 'What-If simülasyon senaryoları';
