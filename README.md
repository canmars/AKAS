# DEÜ YBS Lisansüstü Karar Destek Sistemi (KDS)

Bölüm Başkanı Dashboard odaklı karar destek sistemi.

## Teknoloji Stack

- **Frontend:** Vanilla JavaScript (ES6+), Vite, Chart.js
- **Backend:** Node.js, Express.js
- **Veritabanı:** Supabase (PostgreSQL)
- **Mock Veri:** Python 3.9+, Faker

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
# Node.js bağımlılıkları
npm install

# Python bağımlılıkları
pip install -r scripts/requirements.txt
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

### 3. Veritabanı Migration'ları

Supabase SQL Editor'de migration dosyalarını sırayla çalıştırın:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_reference_tables.sql`
3. `migrations/003_relationships.sql`
4. `migrations/004_indexes.sql`
5. `migrations/005_triggers.sql`
6. `migrations/006_functions.sql`
7. `migrations/007_rls_policies.sql`
8. `migrations/008_seed_data.sql`

### 4. Mock Veri Üretimi

```bash
npm run seed
# veya
python scripts/seed.py
```

### 5. Uygulamayı Başlat

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
│   ├── db/          # Veritabanı
│   ├── middlewares/ # Middleware'ler
│   ├── models/      # Modeller
│   ├── routers/     # API route'ları
│   └── utils/       # Yardımcı fonksiyonlar
├── src/             # Frontend
│   ├── views/       # Görünümler
│   ├── controllers/ # Controller'lar
│   ├── services/     # Servisler
│   └── styles/      # CSS dosyaları
├── scripts/         # Python mock veri üretimi
└── migrations/      # SQL migration dosyaları
```

## API Endpoints

- `GET /api/dashboard/kpi` - KPI metrikleri
- `GET /api/dashboard/risk-dagilimi` - Risk skoru dağılımı
- `GET /api/dashboard/program-dagilimi` - Program bazında dağılım
- `GET /api/dashboard/kritik-ogrenciler` - Kritik risk altındaki öğrenciler
- `GET /api/dashboard/danisman-yuk` - Danışman yük dağılımı
- `GET /api/dashboard/bildirimler` - Bildirimler
- `GET /api/ogrenci` - Tüm öğrenciler
- `GET /api/ogrenci/:id` - Öğrenci detayı
- `POST /api/what-if/simulasyon` - What-If simülasyonu

## Özellikler

- ✅ Bölüm Başkanı Dashboard
- ✅ Risk Skoru Dağılımı Grafikleri
- ✅ Program Bazında Dağılım
- ✅ Kritik Risk Altındaki Öğrenciler Listesi
- ✅ Danışman Yük Dağılımı
- ✅ Bildirimler
- ✅ What-If Simülasyonu
- ✅ Drill-Down Özelliği

## Geliştirme

Proje MVC mimarisi ile yapılandırılmıştır. Tüm dosyalar plana uygun olarak oluşturulmuştur.
