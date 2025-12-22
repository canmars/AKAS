-- Migration 028: Create Indexes
-- Performans optimizasyonu için indeksler
-- ============================================

-- ============================================
-- OGRENCI TABLOSU İNDEKSLERİ
-- ============================================

-- Danışman bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_danisman_durum ON public.ogrenci(danisman_id, durum_id) WHERE danisman_id IS NOT NULL;

-- Program bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_program_turu ON public.ogrenci(program_turu_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_durum ON public.ogrenci(durum_id);

-- Kayıt tarihi bazlı sorgular için (trend analizleri)
CREATE INDEX IF NOT EXISTS idx_ogrenci_kayit_tarihi ON public.ogrenci(kayit_tarihi);

-- ============================================
-- OGRENCI ASAMALARI İNDEKSLERİ
-- ============================================

-- Aktif aşamaları hızlı bulmak için (zaten 023'te eklendi, burada kontrol)
-- CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_ogrenci_durum ON public.ogrenci_asamalari(ogrenci_id, durum);
-- CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_durum_devam ON public.ogrenci_asamalari(ogrenci_id, durum) WHERE durum = 'Devam_Ediyor';

-- Aşama bazlı sorgular için (zaten 023'te eklendi)
-- CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_asama_tanimi ON public.ogrenci_asamalari(asama_tanimi_id);
-- CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_asama_durum ON public.ogrenci_asamalari(asama_tanimi_id, durum);

-- ============================================
-- OGRENCI DERSLERİ İNDEKSLERİ
-- ============================================

-- Ders başarısızlık analizi için
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ogrenci_not ON public.ogrenci_dersleri(ogrenci_id, not_kodu);

-- Ders bazlı analiz için
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ders_not ON public.ogrenci_dersleri(ders_kodu, not_kodu);

-- Öğrenci bazlı ders sorguları için
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ogrenci ON public.ogrenci_dersleri(ogrenci_id);

-- Yarıyıl bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_yariyil ON public.ogrenci_dersleri(ogrenci_id, yariyil, akademik_yil);

-- ============================================
-- OGRENCI RISK SKORLARI İNDEKSLERİ
-- ============================================

-- Risk bazlı filtreleme için (zaten 025'te eklendi, burada kontrol)
-- CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_seviye_skor ON public.ogrenci_risk_skorlari(risk_seviyesi, risk_skoru);

-- ============================================
-- AKADEMIK PERSONEL İNDEKSLERİ
-- ============================================

-- Rol bazlı sorgular için (zaten 021'de eklendi)
-- CREATE INDEX IF NOT EXISTS idx_akademik_personel_rol ON public.akademik_personel(rol);

-- Aktif personel sorguları için
CREATE INDEX IF NOT EXISTS idx_akademik_personel_aktif ON public.akademik_personel(aktif_mi) WHERE aktif_mi = true;

-- Anabilim dalı bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_akademik_personel_anabilim_dali ON public.akademik_personel(anabilim_dali_id) WHERE anabilim_dali_id IS NOT NULL;

-- ============================================
-- DANISMAN GECMISI İNDEKSLERİ
-- ============================================

-- Aktif danışman atamaları için
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_aktif ON public.danisman_gecmisi(ogrenci_id, aktif_mi) WHERE aktif_mi = true;

-- Danışman bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_danisman_gecmisi_danisman ON public.danisman_gecmisi(danisman_id);

-- ============================================
-- ASAMA TANIMLARI İNDEKSLERİ
-- ============================================

-- Program ve aşama kodu kombinasyonu (zaten 022'de unique constraint var)
-- Program bazlı aşama sorguları için (zaten 022'de eklendi)
-- CREATE INDEX IF NOT EXISTS idx_asama_tanimlari_program_turu ON public.asama_tanimlari(program_turu_id);

-- ============================================
-- YETERLIK SINAVLARI İNDEKSLERİ
-- ============================================

-- Öğrenci ve deneme bazlı sorgular için (zaten 024'te unique constraint var)
-- Öğrenci bazlı sorgular için (zaten 024'te eklendi)
-- CREATE INDEX IF NOT EXISTS idx_yeterlik_sinavlari_ogrenci ON public.yeterlik_sinavlari(ogrenci_id);

-- ============================================
-- TEZ ONERILERI İNDEKSLERİ
-- ============================================

-- Öğrenci bazlı sorgular için (zaten 024'te eklendi)
-- CREATE INDEX IF NOT EXISTS idx_tez_onerileri_ogrenci ON public.tez_onerileri(ogrenci_id);

-- ============================================
-- TEZ SAVUNMALARI İNDEKSLERİ
-- ============================================

-- Öğrenci bazlı sorgular için (zaten 024'te eklendi)
-- CREATE INDEX IF NOT EXISTS idx_tez_savunmalari_ogrenci ON public.tez_savunmalari(ogrenci_id);

-- ============================================
-- TİK TOPLANTILARI İNDEKSLERİ
-- ============================================

-- Öğrenci bazlı sorgular için (zaten 024'te eklendi)
-- CREATE INDEX IF NOT EXISTS idx_tik_toplantilari_ogrenci ON public.tik_toplantilari(ogrenci_id);

-- ============================================
-- COMMENTS
-- ============================================

-- İndeksler performans optimizasyonu için oluşturuldu
-- Her indeks belirli sorgu türleri için optimize edilmiştir

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Oluşturulan indeksler:
-- 1. ogrenci tablosu: danisman_durum, program_turu, durum, kayit_tarihi
-- 2. ogrenci_dersleri tablosu: ogrenci_not, ders_not, ogrenci, yariyil
-- 3. akademik_personel tablosu: aktif, anabilim_dali
-- 4. danisman_gecmisi tablosu: aktif, danisman

-- NOT: Bazı indeksler önceki migration'larda zaten oluşturuldu (022, 023, 024, 025)
-- Bu migration'da eksik olanlar ve performans için kritik olanlar eklendi

