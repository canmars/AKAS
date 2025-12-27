-- 1. ADIM: Mevcut 'rol' sütununa varsayılan (default) değer atayalım.
-- Böylece sisteme yeni hoca eklendiğinde otomatik 'Danisman' olur.
ALTER TABLE public.akademik_personel
ALTER COLUMN rol SET DEFAULT 'Danisman';

-- 2. ADIM: Mevcut kayıtlarda rolü boş (NULL) olan hocaları 'Danisman' yapalım.
-- Şemanızdaki CHECK kısıtlamasına göre tam olarak 'Danisman' yazmalıyız.
UPDATE public.akademik_personel
SET rol = 'Danisman'
WHERE rol IS NULL;

-- 3. ADIM: Vahap Hoca'yı 'Bolum_Baskani' olarak yetkilendirelim.
-- Şemanızdaki CHECK kısıtlamasına göre tam olarak 'Bolum_Baskani' yazmalıyız.
UPDATE public.akademik_personel
SET rol = 'Bolum_Baskani'
WHERE email = 'vahap.tecim@deu.edu.tr';

-- 4. ADIM: Kontrol edelim.
SELECT ad, soyad, email, rol FROM public.akademik_personel;