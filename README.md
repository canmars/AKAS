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

## 🛠️ Teknoloji Yığını

Proje **Monorepo** yapısında olup, modern web teknolojileri ile geliştirilmiştir.

| Alan | Teknoloji |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v3, Chart.js, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | PostgreSQL (Supabase) |
| **Mimari** | Model-View-Controller (MVC) |

---

## 📂 Proje Yapısı

```bash
AKAS/
├── backend/                # Node.js API & Server
│   ├── server/
│   │   ├── controllers/    # İş Mantığı
│   │   ├── models/         # Veritabanı Modelleri
│   │   ├── routes/         # API Endpoint'leri
│   │   └── server.js       # Giriş Noktası
│   └── package.json
│
├── frontend/               # React UI
│   ├── src/
│   │   ├── components/     # UI Bileşenleri
│   │   ├── pages/          # Sayfalar (Dashboard, Login vb.)
│   │   ├── services/       # API İstekleri
│   │   └── App.jsx
│   └── package.json
│
└── package.json            # Root Orkestrasyon
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
