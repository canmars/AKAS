-- Migration 007: Row Level Security Policies
-- RLS politikaları: Admin, Bölüm Başkanı, Danışman rolleri için

-- ============================================
-- RLS ENABLE
-- ============================================
ALTER TABLE public.kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akademik_personel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci_risk_analizi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bildirimler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tik_toplantilari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akademik_milestone ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tez_donem_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danisman_gecmisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci_durum_gecmisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sistem_ayarlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulasyon_senaryolari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci_dersleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akademik_takvim ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get Current User Role
-- ============================================
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
BEGIN
  -- Supabase auth.users'dan kullanıcı ID'sini al
  v_user_id := auth.uid();
  
  -- Kullanıcı rolünü al
  SELECT rol INTO v_role
  FROM public.kullanicilar
  WHERE kullanici_id = v_user_id;
  
  RETURN COALESCE(v_role, 'Anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get Current User Personel ID
-- ============================================
CREATE OR REPLACE FUNCTION get_current_user_personel_id()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_personel_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT akademik_personel_id INTO v_personel_id
  FROM public.kullanicilar
  WHERE kullanici_id = v_user_id;
  
  RETURN v_personel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OGRENCI RLS POLICIES
-- ============================================
-- Admin: Tüm öğrencileri görebilir
CREATE POLICY "Admin can view all students"
ON public.ogrenci FOR SELECT
USING (
  get_current_user_role() = 'Admin'
);

-- Bölüm Başkanı: Tüm öğrencileri görebilir
CREATE POLICY "Bolum_Baskani can view all students"
ON public.ogrenci FOR SELECT
USING (
  get_current_user_role() = 'Bolum_Baskani'
);

-- Danışman: Sadece kendi öğrencilerini görebilir
CREATE POLICY "Danisman can view own students"
ON public.ogrenci FOR SELECT
USING (
  get_current_user_role() = 'Danisman'
  AND ogrenci_id IN (
    SELECT ogrenci_id
    FROM public.danisman_gecmisi
    WHERE danisman_id = get_current_user_personel_id()
      AND aktif_mi = true
  )
);

-- Admin: Tüm öğrencileri düzenleyebilir
CREATE POLICY "Admin can update all students"
ON public.ogrenci FOR UPDATE
USING (get_current_user_role() = 'Admin');

-- ============================================
-- OGRENCI RISK ANALIZI RLS POLICIES
-- ============================================
-- Admin: Tüm risk analizlerini görebilir
CREATE POLICY "Admin can view all risk analysis"
ON public.ogrenci_risk_analizi FOR SELECT
USING (get_current_user_role() = 'Admin');

-- Bölüm Başkanı: Tüm risk analizlerini görebilir
CREATE POLICY "Bolum_Baskani can view all risk analysis"
ON public.ogrenci_risk_analizi FOR SELECT
USING (get_current_user_role() = 'Bolum_Baskani');

-- Danışman: Sadece kendi öğrencilerinin risk analizlerini görebilir
CREATE POLICY "Danisman can view own students risk analysis"
ON public.ogrenci_risk_analizi FOR SELECT
USING (
  get_current_user_role() = 'Danisman'
  AND ogrenci_id IN (
    SELECT ogrenci_id
    FROM public.danisman_gecmisi
    WHERE danisman_id = get_current_user_personel_id()
      AND aktif_mi = true
  )
);

-- ============================================
-- BILDIRIMLER RLS POLICIES
-- ============================================
-- Admin: Tüm bildirimleri görebilir
CREATE POLICY "Admin can view all notifications"
ON public.bildirimler FOR SELECT
USING (get_current_user_role() = 'Admin');

-- Bölüm Başkanı: Tüm bildirimleri görebilir
CREATE POLICY "Bolum_Baskani can view all notifications"
ON public.bildirimler FOR SELECT
USING (get_current_user_role() = 'Bolum_Baskani');

-- Danışman: Sadece kendi bildirimlerini görebilir
CREATE POLICY "Danisman can view own notifications"
ON public.bildirimler FOR SELECT
USING (
  get_current_user_role() = 'Danisman'
  AND alici_kullanici_id = auth.uid()
);

-- ============================================
-- TIK TOPLANTILARI RLS POLICIES
-- ============================================
-- Admin: Tüm TİK toplantılarını görebilir
CREATE POLICY "Admin can view all TIK meetings"
ON public.tik_toplantilari FOR SELECT
USING (get_current_user_role() = 'Admin');

-- Bölüm Başkanı: Tüm TİK toplantılarını görebilir
CREATE POLICY "Bolum_Baskani can view all TIK meetings"
ON public.tik_toplantilari FOR SELECT
USING (get_current_user_role() = 'Bolum_Baskani');

-- Danışman: Sadece kendi öğrencilerinin TİK toplantılarını görebilir ve girebilir
CREATE POLICY "Danisman can view and insert own students TIK meetings"
ON public.tik_toplantilari FOR ALL
USING (
  get_current_user_role() = 'Danisman'
  AND ogrenci_id IN (
    SELECT ogrenci_id
    FROM public.danisman_gecmisi
    WHERE danisman_id = get_current_user_personel_id()
      AND aktif_mi = true
  )
);

-- ============================================
-- AKADEMIK MILESTONE RLS POLICIES
-- ============================================
-- Admin: Tüm milestone'ları görebilir
CREATE POLICY "Admin can view all milestones"
ON public.akademik_milestone FOR SELECT
USING (get_current_user_role() = 'Admin');

-- Bölüm Başkanı: Tüm milestone'ları görebilir
CREATE POLICY "Bolum_Baskani can view all milestones"
ON public.akademik_milestone FOR SELECT
USING (get_current_user_role() = 'Bolum_Baskani');

-- Danışman: Sadece kendi öğrencilerinin milestone'larını görebilir
CREATE POLICY "Danisman can view own students milestones"
ON public.akademik_milestone FOR SELECT
USING (
  get_current_user_role() = 'Danisman'
  AND ogrenci_id IN (
    SELECT ogrenci_id
    FROM public.danisman_gecmisi
    WHERE danisman_id = get_current_user_personel_id()
      AND aktif_mi = true
  )
);

-- ============================================
-- TEZ DONEM KAYITLARI RLS POLICIES
-- ============================================
-- Admin: Tüm tez dönem kayıtlarını görebilir
CREATE POLICY "Admin can view all tez donem kayitlari"
ON public.tez_donem_kayitlari FOR SELECT
USING (get_current_user_role() = 'Admin');

-- Bölüm Başkanı: Tüm tez dönem kayıtlarını görebilir
CREATE POLICY "Bolum_Baskani can view all tez donem kayitlari"
ON public.tez_donem_kayitlari FOR SELECT
USING (get_current_user_role() = 'Bolum_Baskani');

-- Danışman: Sadece kendi öğrencilerinin tez dönem kayıtlarını görebilir ve girebilir
CREATE POLICY "Danisman can view and insert own students tez donem kayitlari"
ON public.tez_donem_kayitlari FOR ALL
USING (
  get_current_user_role() = 'Danisman'
  AND ogrenci_id IN (
    SELECT ogrenci_id
    FROM public.danisman_gecmisi
    WHERE danisman_id = get_current_user_personel_id()
      AND aktif_mi = true
  )
);

-- ============================================
-- SISTEM AYARLARI RLS POLICIES
-- ============================================
-- Sadece Admin sistem ayarlarını görebilir
CREATE POLICY "Only Admin can view system settings"
ON public.sistem_ayarlari FOR SELECT
USING (get_current_user_role() = 'Admin');

CREATE POLICY "Only Admin can update system settings"
ON public.sistem_ayarlari FOR UPDATE
USING (get_current_user_role() = 'Admin');

-- ============================================
-- SIMULASYON SENARYOLARI RLS POLICIES
-- ============================================
-- Admin ve Bölüm Başkanı simülasyon yapabilir
CREATE POLICY "Admin and Bolum_Baskani can use simulations"
ON public.simulasyon_senaryolari FOR ALL
USING (
  get_current_user_role() IN ('Admin', 'Bolum_Baskani')
);

-- ============================================
-- RLS POLICIES - OGRENCI DERSLERI
-- ============================================

-- Admin ve Bölüm Başkanı: Tüm ders kayıtlarını görebilir
CREATE POLICY policy_ogrenci_dersleri_select_admin_bolum_baskani
ON public.ogrenci_dersleri FOR SELECT
USING (
  get_current_user_role() IN ('Admin', 'Bolum_Baskani')
);

-- Danışman: Sadece kendi öğrencilerinin ders kayıtlarını görebilir
CREATE POLICY policy_ogrenci_dersleri_select_danisman
ON public.ogrenci_dersleri FOR SELECT
USING (
  get_current_user_role() = 'Danisman'
  AND EXISTS (
    SELECT 1 FROM public.danisman_gecmisi dg
    WHERE dg.ogrenci_id = ogrenci_dersleri.ogrenci_id
    AND dg.danisman_id = get_current_user_personel_id()
    AND dg.aktif_mi = true
  )
);

-- Admin: Ders kayıtlarını ekleyebilir, güncelleyebilir, silebilir
CREATE POLICY policy_ogrenci_dersleri_all_admin
ON public.ogrenci_dersleri FOR ALL
USING (get_current_user_role() = 'Admin')
WITH CHECK (get_current_user_role() = 'Admin');

-- ============================================
-- RLS POLICIES - AKADEMIK TAKVIM
-- ============================================

-- Tüm roller: Akademik takvimi görebilir (okuma)
CREATE POLICY policy_akademik_takvim_select_all
ON public.akademik_takvim FOR SELECT
USING (true);

-- Sadece Admin: Akademik takvimi ekleyebilir, güncelleyebilir, silebilir
CREATE POLICY policy_akademik_takvim_all_admin
ON public.akademik_takvim FOR ALL
USING (get_current_user_role() = 'Admin')
WITH CHECK (get_current_user_role() = 'Admin');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION get_current_user_role IS 'Mevcut kullanıcının rolünü döndürür';
COMMENT ON FUNCTION get_current_user_personel_id IS 'Mevcut kullanıcının akademik personel ID''sini döndürür';

