-- Migration 010: Bölüm Başkanı Kullanıcısı Oluşturma
-- Bu migration, bildirim seeder'ının çalışması için gerekli Bölüm Başkanı kullanıcısını oluşturur

-- ============================================
-- YÖNTEM 1: Supabase Dashboard Kullanarak (Önerilen)
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users'a gidin
-- 2. "Add user" butonuna tıklayın
-- 3. Email: bolum.baskani@deu.edu.tr
-- 4. Password: Güvenli bir şifre belirleyin
-- 5. "Auto Confirm User" seçeneğini işaretleyin
-- 6. "Create user" butonuna tıklayın
-- 7. Oluşturulan kullanıcının ID'sini kopyalayın
-- 8. Aşağıdaki SQL'i çalıştırın (KULLANICI_ID'yi değiştirin)

-- ============================================
-- YÖNTEM 2: SQL ile Direkt Oluşturma (Test/Development)
-- ============================================
-- ⚠️  DİKKAT: Bu yöntem sadece test/development ortamında kullanılmalıdır!
-- Production'da Supabase Dashboard kullanın (Yöntem 1)

-- Önce auth.users'a kullanıcı ekle
DO $$
DECLARE
    new_user_id UUID;
    user_password TEXT := 'BolumBaskani2024!';  -- ⚠️  ŞİFREYİ DEĞİŞTİRİN!
BEGIN
    -- Kullanıcı zaten var mı kontrol et
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = 'bolum.baskani@deu.edu.tr';
    
    -- Eğer kullanıcı yoksa oluştur
    IF new_user_id IS NULL THEN
        -- UUID oluştur
        new_user_id := gen_random_uuid();
        
        -- Auth.users'a ekle
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'bolum.baskani@deu.edu.tr',
            crypt(user_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false,
            'authenticated'
        );
        
        RAISE NOTICE '✅ Auth.users tablosuna kullanıcı eklendi: %', new_user_id;
    ELSE
        RAISE NOTICE 'ℹ️  Kullanıcı zaten mevcut: %', new_user_id;
    END IF;
    
    -- kullanicilar tablosuna ekle veya güncelle
    INSERT INTO public.kullanicilar (
        kullanici_id,
        rol,
        email,
        ad,
        soyad,
        aktif_mi
    ) VALUES (
        new_user_id,
        'Bolum_Baskani',
        'bolum.baskani@deu.edu.tr',
        'Bölüm',
        'Başkanı',
        true
    )
    ON CONFLICT (kullanici_id) DO UPDATE
    SET rol = 'Bolum_Baskani',
        email = 'bolum.baskani@deu.edu.tr',
        ad = 'Bölüm',
        soyad = 'Başkanı',
        aktif_mi = true;
    
    RAISE NOTICE '✅ kullanicilar tablosuna Bölüm Başkanı eklendi/güncellendi';
END $$;

-- ============================================
-- KONTROL: Kullanıcının oluşturulduğunu doğrula
-- ============================================
SELECT 
    k.kullanici_id,
    k.email,
    k.ad,
    k.soyad,
    k.rol,
    k.aktif_mi
FROM public.kullanicilar k
WHERE k.rol = 'Bolum_Baskani'
AND k.email = 'bolum.baskani@deu.edu.tr';

-- ============================================
-- NOTLAR
-- ============================================
-- 1. Bu migration'ı çalıştırdıktan sonra bildirim_seeder.py çalıştırılabilir
-- 2. Şifre: BolumBaskani2024! (değiştirilmesi önerilir)
-- 3. Email: bolum.baskani@deu.edu.tr (değiştirilebilir)
-- 4. Production'da Yöntem 1 (Supabase Dashboard) kullanılmalıdır
