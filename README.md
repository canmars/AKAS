# AKAS - Akademik Karar Analiz Sistemi

> **Lisansüstü Süreç Yönetimi ve Veri Odaklı Karar Destek Sistemi**

AKAS, Dokuz Eylül Üniversitesi Yönetim Bilişim Sistemleri Bölümü için geliştirilmiş; lisansüstü eğitim süreçlerini izleyen, analiz eden ve Bölüm Başkanı'na stratejik karar alma konusunda destek olan yeni nesil bir web uygulamasıdır.

---

## 🎓 Ders Projesi Bilgileri

**Ders:** Sunucu Tabanlı Programlama (YBS 3. Sınıf)  
**Konu:** MVC Mimarisi ile RESTful API Tasarımı  
**Geliştirme:** Node.js (Express) + PostgreSQL (Supabase)

### 📌 Proje Senaryosu: Danışman Atama Yönetim Sistemi

**İş Problemi:**  
Lisansüstü programlarda öğrencilere danışman ataması, akademik yükün dengeli dağılımını gerektiren kritik bir süreçtir. Mevcut sistemde danışman atamaları manuel yapılmakta, bu da kapasite aşımları ve pasif danışmanlara yanlışlıkla atama yapılması gibi sorunlara yol açmaktadır.

**Çözüm:**  
AKAS'ın Danışman Atama Modülü, yeni öğrencilere danışman atanmasını ve mevcut danışman değişikliklerini otomatize eder. Sistem, iki temel iş kuralı ile süreç kontrolü sağlar:

1. **Danışman Yük Limiti Kontrolü**: Bir danışmanın maksimum öğrenci kapasitesi aşılmadan atama yapılır
2. **Aktif Danışman Kontrolü**: Sadece aktif statüdeki danışmanlar öğrencilere atanabilir

Bu modül sayesinde bölüm sekreteri ve yönetimi, hatasız ve dengeli bir danışman dağılımı sağlar.

### 🎯 Özellikler

- ✅ **CRUD Operasyonları**: Danışman atama (CREATE), danışman listesi (READ), danışman değiştirme (UPDATE)
- ✅ **İş Kuralları**: Kapasite ve aktiflik kontrolü ile süreç güvenliği
- ✅ **RESTful API**: HTTP metodları ve status code'lara uygun tasarım
- ✅ **MVC Mimarisi**: Model-View-Controller desenine tam uyum
- ✅ **Transaction Yönetimi**: Danışman geçmiş kaydı ve sayaç güncellemeleri

---

---

### 🏗️ Proje Mimarisi ve Klasör Yapısı (MVC)

Proje, **Model-View-Controller (MVC)** tasarım desenine sadık kalınarak yapılandırılmıştır. Bu yapı, hem Backend hem de Frontend tarafında kodun sürdürülebilirliğini, okunabilirliğini ve geliştirilebilirliğini artırmayı hedefler.

#### **Mimari Yaklaşım**
*   **Model**: Veritabanı şeması ve veri erişim katmanı (Supabase/PostgreSQL).
*   **View**: Kullanıcının etkileşime girdiği arayüz (React Frontend).
*   **Controller**: İş mantığının (Business Logic) işlendiği ve Model-View arasındaki iletişimi sağlayan katman (Node.js Backend).

#### **Teknoloji Yığını (Tech Stack)**
*   **Frontend**: React.js, Vite, Tailwind CSS, Chart.js
*   **Backend**: Node.js, Express.js
*   **Veritabanı**: PostgreSQL (Supabase). Extensions: pg_cron, pg_trgm, vector

#### **Detaylı Klasör Yapısı**
Aşağıda, projenin hedeflediği **tam klasör yapısı** yer almaktadır. Henüz boş olabilir yahut isimlerin ve dosyaların içeriği değişim gösterebilir ancak bu mimari yapısı bütünlük oluşturup proje anlaşılmasını kolaylaştırılması için oluşturulmuştur.

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

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Gereksinimler
- Node.js (v18 veya üzeri)
- NPM veya Yarn

### 2. Kurulum
Repoyu klonlayın ve bağımlılıkları yükleyin:

```bash
# Kök dizinde (Root)
npm install

# Backend bağımlılıklarını yükle
cd backend
npm install

# Frontend bağımlılıklarını yükle
cd ../frontend
npm install
```

### 3. Çevresel Değişkenler (.env)
`backend/.env` klasörü altında aşağıdaki değişkenlerin tanımlı olduğundan emin olun:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 4. Başlatma
Projenin ana dizininde (root) aşağıdaki komutu çalıştırarak **hem Backend hem Frontend** sunucularını aynı anda başlatabilirsiniz:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/auth/login` | Kullanıcı girişi | ❌ |

### 👥 Danışman Atama Modülü (CRUD)

#### CREATE - Danışman Atama
```http
POST /api/advisors/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "ogrenci_id": "uuid",
  "danisman_id": "uuid"
}
```

**Başarılı Response (201 Created):**
```json
{
  "success": true,
  "message": "Danışman başarıyla atandı",
  "data": {
    "ogrenci_id": "...",
    "danisman_id": "...",
    "ogrenci_ad_soyad": "Ahmet Yılmaz",
    "danisman_ad_soyad": "Prof. Dr. Ayşe Kaya",
    "atama_tarihi": "2026-01-17"
  }
}
```

**Hata Response (400 Bad Request - Kapasite Dolu):**
```json
{
  "success": false,
  "error": "Danışman kapasitesi dolu. Maksimum: 10, Mevcut: 10"
}
```

**Hata Response (400 Bad Request - Pasif Danışman):**
```json
{
  "success": false,
  "error": "Seçilen danışman aktif değil ve atama yapılamaz"
}
```

---

#### UPDATE - Danışman Değiştirme
```http
PUT /api/advisors/change/:studentId
Authorization: Bearer {token}
Content-Type: application/json

{
  "yeni_danisman_id": "uuid",
  "degisiklik_nedeni": "Uzmanlık alanı uygunluğu"
}
```

**Başarılı Response (200 OK):**
```json
{
  "success": true,
  "message": "Danışman değişikliği başarılı",
  "data": {
    "ogrenci_id": "...",
    "ogrenci_ad_soyad": "Ahmet Yılmaz",
    "eski_danisman_id": "...",
    "eski_danisman_ad_soyad": "Prof. Dr. Mehmet Öz",
    "yeni_danisman_id": "...",
    "yeni_danisman_ad_soyad": "Prof. Dr. Ayşe Kaya",
    "degisiklik_tarihi": "2026-01-17",
    "degisiklik_nedeni": "Uzmanlık alanı uygunluğu"
  }
}
```

---

#### READ - Danışman Listesi
```http
GET /api/advisors/load-distribution
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "ad": "Ayşe",
    "soyad": "Kaya",
    "mevcut_danismanlik_sayisi": 8
  },
  ...
]
```

---

### 📊 Diğer API Endpoint'leri

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/dashboard/kpis` | Dashboard KPI'ları | ✅ |
| GET | `/api/students` | Öğrenci listesi (pagination) | ✅ |
| GET | `/api/students/:id/details` | Öğrenci detay bilgisi | ✅ |
| GET | `/api/courses/analysis` | Ders analizi verileri | ✅ |
| GET | `/api/advisors/kpis` | Danışman analizi KPI'ları | ✅ |
| GET | `/api/advisors/performance` | Danışman performans listesi | ✅ |

---

## 📋 İş Kuralları (Business Rules)

### İş Kuralı 1: Danışman Yük Limiti Kontrolü

**Tanım:** Bir danışmana öğrenci atanırken veya mevcut danışman değiştirilirken, danışmanın mevcut öğrenci sayısı (`mevcut_danismanlik_sayisi`) maksimum kapasitesini (`maksimum_kapasite`) aşmamalıdır.

**Kontrol Noktaları:**
- ✅ POST `/api/advisors/assign` - Yeni atama öncesi
- ✅ PUT `/api/advisors/change/:studentId` - Yeni danışman atanmadan önce

**Teknik Implementasyon:**
```javascript
// Model: advisorModel.checkAdvisorCapacity()
const hasCapacity = mevcut_danismanlik_sayisi < maksimum_kapasite;
if (!hasCapacity) {
    throw new Error('Danışman kapasitesi dolu');
}
```

**HTTP Yanıt:**
- Kapasite dolu ise → **400 Bad Request**
- Hata mesajı: "Danışman kapasitesi dolu. Maksimum: X, Mevcut: Y"

---

### İş Kuralı 2: Aktif Danışman Kontrolü

**Tanım:** Sadece aktif statüdeki danışmanlar (`aktif_danisman_mi = true` AND `aktif_mi = true`) öğrencilere atanabilir. Pasif, izinli veya emekli danışmanlara atama yapılamaz.

**Kontrol Noktaları:**
- ✅ POST `/api/advisors/assign` - Yeni atama öncesi
- ✅ PUT `/api/advisors/change/:studentId` - Yeni danışman atanmadan önce

**Teknik Implementasyon:**
```javascript
// Model: advisorModel.checkAdvisorStatus()
const isActive = aktif_danisman_mi === true && aktif_mi === true;
if (!isActive) {
    throw new Error('Seçilen danışman aktif değil');
}
```

**HTTP Yanıt:**
- Danışman pasif ise → **400 Bad Request**
- Hata mesajı: "Seçilen danışman aktif değil ve atama yapılamaz"

---

## 📝 Dokümantasyon

### Proje Dokümantasyonu
- **[PROJE_OZETI.md](./PROJE_OZETI.md)** - Detaylı proje özeti, veritabanı şeması ve mimari kararlar
- **[ER_DIAGRAM.md](./ER_DIAGRAM.md)** - Danışman Atama Modülü Entity-Relationship Diyagramı (31 tablo, tam schema)
- **[ER_DIAGRAM.png](./ER_DIAGRAM.png)** - ER Diyagramı (PNG versiyonu)

### Veritabanı
- **Danışman Atama RPC Functions** - `backend/database/supabase_rpc_functions.sql` dosyasındaki SQL fonksiyonları Supabase'de çalıştırılmalıdır
- **Tam Schema** - `backend/database/schema_final.sql` dosyasında güncel veritabanı şeması

---

## 👥 Katkıda Bulunanlar
- **Geliştirici**: canmars
- **Kurum**: Dokuz Eylül Üniversitesi - Yönetim Bilişim Sistemleri

---
*© 2025 AKAS Project.*

