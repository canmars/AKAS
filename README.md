# YİSANS KDS

Lisansüstü Karar Destek Sistemi - Yeniden başlangıç

## Teknoloji Stack

- **Frontend:** Vanilla JavaScript (ES6+), Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Veritabanı:** Supabase (PostgreSQL)

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası oluşturun:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
VITE_API_URL=http://localhost:3000/api
```

### 3. Uygulamayı Başlat

```bash
# Frontend ve Backend birlikte
npm run dev

# Sadece backend
npm run dev:server

# Sadece frontend
npm run dev:client
```

## Proje Yapısı

```
yisans/
├── server/          # Backend (Node.js/Express)
│   ├── db/          # Veritabanı bağlantısı
│   ├── middlewares/ # Middleware'ler
│   └── routers/     # API route'ları
├── src/             # Frontend
│   ├── controllers/ # Controller'lar
│   ├── views/       # Görünümler
│   └── styles/      # CSS dosyaları
└── migrations/      # SQL migration dosyaları
```

## Notlar

- Proje köklü bir temizlik sonrası yeniden başlatılmıştır
- Veritabanı tabloları ve veriler korunmuştur
- Tüm fonksiyonlar, trigger'lar, view'ler ve indeksler temizlenmiştir
- Veritabanı temizliği için `migrations/999_drop_all_objects.sql` script'i kullanılabilir
