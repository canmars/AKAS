# AKAS - Akademik Karar Analiz Sistemi

> **Lisansüstü Süreç Yönetimi ve Veri Odaklı Karar Destek Sistemi**

AKAS, Dokuz Eylül Üniversitesi Yönetim Bilişim Sistemleri Bölümü için geliştirilmiş; lisansüstü eğitim süreçlerini izleyen, analiz eden ve Bölüm Başkanı'na stratejik karar alma konusunda destek olan yeni nesil bir web uygulamasıdır.

## 🚀 Proje Hakkında

Bu proje, geleneksel öğrenci işleri otomasyonlarından farklı olarak **operasyonel veri girişinden çok stratejik analize** odaklanır. Bölüm başkanının danışman atamaları, kontenjan planlaması, riskli öğrencilerin tespiti ve ders başarı analizleri gibi konularda veri odaklı kararlar almasını sağlar.

### Öne Çıkan Özellikler
- 📊 **İnteraktif Dashboard**: Tüm kritik metriklerin tek ekranda takibi.
- 🎓 **Aşama Takibi**: Tez, yeterlik ve dönem projesi süreçlerinin gecikme analizi.
- ⚠️ **Risk Analizi**: Başarısızlık riski taşıyan öğrencilerin yapay zeka destekli tespiti.
- 👥 **Danışman Yük Yönetimi**: Akademik personel iş yükü dengesinin optimizasyonu.

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

## 📝 Dokümantasyon
Detaylı proje özeti, veritabanı şeması ve mimari kararlar için [PROJE_OZETI.md](./PROJE_OZETI.md) dosyasını inceleyebilirsiniz.

---

## 👥 Katkıda Bulunanlar
- **Geliştirici**: canmars
- **Kurum**: Dokuz Eylül Üniversitesi - Yönetim Bilişim Sistemleri

---
*© 2025 AKAS Project.*

