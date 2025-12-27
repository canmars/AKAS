-- 1. Önce Tablolarda RLS'i Aktif Edelim (Kapıları Kilitliyoruz)
ALTER TABLE public.akademik_personel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ogrenci_risk_skorlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tezler ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- YARDIMCI FONKSİYON (Performans ve Kolaylık İçin)
-- Giriş yapan kişinin rolünü döndürür.
-- =======================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT rol FROM public.akademik_personel WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =======================================================
-- TABLO 1: AKADEMİK PERSONEL (Hocalar Listesi)
-- =======================================================

-- Kural 1: Bölüm Başkanı herkesi görür.
CREATE POLICY "Baskan Personeli Gorur"
ON public.akademik_personel
FOR ALL
USING ( public.get_my_role() = 'Bolum_Baskani' );

-- Kural 2: Her hoca sadece kendi profilini görür (veya herkesi görebilir, rehber amaçlı).
-- Genelde hocalar birbirini görebilmeli (rehber için), o yüzden 'TRUE' veriyoruz ama düzenleyemezler.
CREATE POLICY "Herkes Personel Listesini Gorur"
ON public.akademik_personel
FOR SELECT
USING ( true );

-- =======================================================
-- TABLO 2: ÖĞRENCİLER (En Kritik Yer)
-- =======================================================

-- Kural 1: Bölüm Başkanı tüm öğrencileri görür ve yönetir.
CREATE POLICY "Baskan Ogrencileri Yonetir"
ON public.ogrenci
FOR ALL
USING ( public.get_my_role() = 'Bolum_Baskani' );

-- Kural 2: Danışman SADECE kendi danışmanı olduğu öğrenciyi görür.
CREATE POLICY "Danisman Kendi Ogrencisini Gorur"
ON public.ogrenci
FOR SELECT
USING ( 
  danisman_id IN (
    SELECT personel_id FROM public.akademik_personel WHERE user_id = auth.uid()
  )
);

-- =======================================================
-- TABLO 3: RİSK SKORLARI
-- =======================================================

-- Kural 1: Başkan hepsini görür.
CREATE POLICY "Baskan Riskleri Gorur"
ON public.ogrenci_risk_skorlari
FOR ALL
USING ( public.get_my_role() = 'Bolum_Baskani' );

-- Kural 2: Danışman sadece kendi öğrencisinin riskini görür.
CREATE POLICY "Danisman Ogrenci Riskini Gorur"
ON public.ogrenci_risk_skorlari
FOR SELECT
USING (
  ogrenci_id IN (
    SELECT ogrenci_id FROM public.ogrenci 
    WHERE danisman_id IN (
      SELECT personel_id FROM public.akademik_personel WHERE user_id = auth.uid()
    )
  )
);

-- =======================================================
-- TABLO 4: TEZLER
-- =======================================================

-- Kural 1: Başkan hepsini görür.
CREATE POLICY "Baskan Tezleri Gorur"
ON public.tezler
FOR ALL
USING ( public.get_my_role() = 'Bolum_Baskani' );

-- Kural 2: Danışman sadece kendi öğrencisinin tezini görür.
CREATE POLICY "Danisman Tezleri Gorur"
ON public.tezler
FOR SELECT
USING (
  danisman_id IN (
    SELECT personel_id FROM public.akademik_personel WHERE user_id = auth.uid()
  )
);