# AKAS (Akademik Karar Analiz Sistemi)

> **Dokuz Eylül Üniversitesi Yönetim Bilişim Sistemleri Bölümü Lisansüstü Süreçleri için Web Tabanlı Karar Destek Sistemi**

**AKAS**, Dokuz Eylül Üniversitesi YBS Bölümü'nün lisansüstü eğitim süreçlerinde karşılaşılan kritik yönetim problemlerine çözüm olarak geliştirilen, **yarı-yapısal, taktiksel ve stratejik seviye kararlara** destek olmayı hedefleyen bir **Karar Destek Sistemi (KDS)** projesidir.

Projenin temel amacı kararları tamamen otomatize etmek değil; Bölüm Başkanı'na veriye dayalı, proaktif ve şeffaf stratejik kararlar almasını sağlayan bir **"yardımcı pilot" (co-pilot)** rolü üstlenmektir.

---

## 🎓 Ders Projesi Bilgileri (Sunucu Tabanlı Programlama)

**Ders:** YBS 3015 - Karar Destek Sistemleri / Sunucu Tabanlı Programlama  
**Geliştirici:** 2023469138 - Muhammet Can Arslan  
**Öğretim Üyesi:** Prof. Dr. Vahap Tecim  

Bu proje, **Sunucu Tabanlı Programlama** dersi kapsamında **MVC Mimarisi** ve **RESTful API** standartlarına uygun olarak geliştirilmiş; **Karar Destek Sistemleri** dersi kapsamında ise teorik çerçevesi ve yönetimsel analizleri (Problem Tanımı, Teşhis, Çözüm) yapılandırılmıştır.

---

## � Problemin Tanımı ve Kapsam

Mevcut sistemin analizinde, karar alma süreçlerini tıkayan üç temel problem saptanmıştır:

### 1. Öğrenci Risk Takibindeki Yetersizlikler
Öğrencilerin "Kritik" durumda olduğu (Örn: GNO < 2.50 veya TİK başarısızlığı) ancak dönem sonlarında fark edilebilmektedir. Manuel takipler riskin zamanında yönetilmesini engellemektedir.

### 2. Danışman İş Yükü ve Kota Yönetimi
"Tezli Program" (Kota: 14) ve "Tezsiz Program" (Kota: 16) havuzlarının manuel takibi hatalara ve dengesiz yük dağılımına yol açmaktadır. Pasif veya yetkisiz personele (Arş. Gör.) atama yapılması riski bulunmaktadır.

### 3. Veri Bütünlüğü Eksikliği
Öğrenci verileri, ders kayıtları ve tez durumlarının farklı listelerde tutulması "Bütünleşik Karar Almayı" engellemektedir.

---

## 💡 Çözüm Yaklaşımı: Karar Destek Sistemi (KDS)

AKAS, ham veriyi işleyerek "karar bilgisine" dönüştürür. Sistem, akademik yönetmelikleri (YÖK ve DEÜ SBE kuralları) yazılım algoritmalarına dönüştürür.

### Temel Özellikler
1. **Şeffaflık ve Açıklanabilirlik (Explainability):** Sistemdeki her hesaplama (örn: bir öğrencinin neden riskli olduğu), arayüzdeki `(i)` ikonları ile açıklanır. Karar verici "neden" sorusunun cevabını sistemden alabilir.
2. **Proaktif Yönetim:** Risk oluştuğu anda (örn: TİK başarısızlığı) sistem yöneticiyi uyarır.
3. **Thick Database, Thin Backend:** İş mantığı ve veri bütünlüğü veritabanı seviyesinde (SQL Fonksiyonları ve Triggerlar) garanti altına alınmıştır.

---

## 🚀 Sistem Modülleri (Bulgular)

### 1. 📊 Yönetim Kokpiti (Dashboard)
Yöneticinin anlık durum analizi yapabildiği ana ekrandır.
- **KPI Kartları:** Toplam öğrenci, aktif tezler, mezuniyet oranları.
- **Akademik Huni:** Öğrencilerin aşama dağılımı.
- **Kritik Alarmlar:** Atılma riski olan öğrencilerin otomatik tespiti.

### 2. 👥 Danışman Analiz Modülü
Danışman yüklerinin dengeli dağıtılmasını sağlar.
- **Yük Dağılım Grafikleri:** Tezli/Tezsiz ve Ders/Tez aşaması ayrımıyla görselleştirme.
- **Kapasite Kontrolü:** Yönetmelik kotalarına (14/16) göre doluluk analizi.
- **Danışman Atama (CRUD):** Kapasite ve aktiflik kontrolleriyle güvenli atama işlemi.

### 3. 🎓 Öğrenci Analiz Modülü
- **Risk Skorlama:** GNO, dönem uzatma ve başarısız ders sayılarına göre otomatik risk puanı (0-100).
- **Profil Yönetimi:** Öğrencinin tüm akademik geçmişinin tek ekranda görüntülenmesi.

### 4. 📚 Ders Analiz Modülü (Darboğaz Matrisi)
- **Başarı Analizi:** Derslerin başarı oranları ve kayıt sayılarına göre "Darboğaz Derslerin" tespiti.

---

## 🛠️ Teknik Mimari

Proje, **Model-View-Controller (MVC)** mimarisine sadık kalınarak geliştirilmiştir.

- **Frontend:** React.js (Vite)
- **Backend:** Node.js (Express)
- **Veritabanı:** PostgreSQL (Supabase)
- **Veri Erişim Katmanı:** SQL Stored Procedures & Triggers (Business Logic buradadır)

---

## 📡 API Endpoints (Özet)

### 👥 Danışman ve Karar Destek API'leri

#### Danışman Atama (Karar Destek Destekli)
```http
POST /api/advisors/assign
```
*Sadece kapasitesi uygun ve aktif danışmanlara atama yapılmasına izin vererek hatalı kararları engeller.*

#### Karar Destek Metrikleri
- `GET /api/dashboard/kpis` - Kritik KPI'lar
- `GET /api/dashboard/risk-distribution` - Risk Analizi
- `GET /api/advisors/load-distribution` - Danışman Yük Analizi

---

## 📋 İş Kuralları (Business Rules)

Sistem aşağıdaki kuralları **otomatik değil, denetleyici** olarak uygular. Yöneticiye "bunu yapamazsın" veya "bunu yaparsan şu riskler oluşur" şeklinde geri bildirim verir.

### Kural 1: Danışman Yük Denetimi
Bir danışmanın tezli/tezsiz öğrenci yükü yönetmelik sınırını (14/16) aşıyorsa, sistem atamaya onay vermez veya uyarı üretir.

### Kural 2: Risk Algoritması
`hesapla_ogrenci_riski_detayli()` fonksiyonu ile:
- GNO < 2.50 ise **+20 Puan**
- TİK Başarısızlığı varsa **+30 Puan**
- Azami süreye 1 dönem kaldıysa **+15 Puan**
risk puanı eklenir ve öğrenci "Kritik" seviyeye taşınır.

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
Manuel yapılan atamalarda yaşanan kapasite aşımları ve pasif danışmanlara atama hatalarını engellemek.

**Çözüm & İş Kuralları:**
1. **Danışman Yük Limiti Kontrolü**: Bir danışmanın mevcut öğrenci sayısı maksimum kapasitesini aşamaz.
2. **Aktif Danışman Kontrolü**: Sadece aktif statüdeki danışmanlar öğrencilere atanabilir.

**Özellikler:**
- ✅ **CRUD Operasyonları**: Atama (Create), Değiştirme (Update), Listeleme (Read)
- ✅ **Robust Error Handling**: İş kurallarına aykırı durumlarda 400 Bad Request
- ✅ **Transaction**: Atama yapılırken geçmiş kaydı oluşturulur ve sayaçlar güncellenir

---

## 🚀 Tüm Proje Modülleri ve Özellikleri

AKAS projesi sadece danışman atama ile sınırlı olmayıp, aşağıdaki kapsamlı modülleri de içermektedir:

### 1. 📊 Yönetici Dashboard (Karar Destek)
Bölüm başkanı için kritik metriklerin tek ekranda sunulduğu modül.
- **KPI Takibi**: Toplam öğrenci, aktif tezler, mezuniyet oranları.
- **Akademik Huni (Funnel)**: Öğrencilerin aşamalara (Ders, Yeterlik, Tez) göre dağılımı.
- **Kritik Alarmlar**: Atılma riski olan veya süresi dolan öğrencilerin otomatik tespiti.
- **Risk Analizi**: Yapay zeka destekli başarı tahminlemesi.

### 2. 🎓 Öğrenci Analiz Modülü
Öğrenci verilerinin derinlemesine incelendiği modül.
- **Detaylı Filtreleme**: Risk grubu, aşama, program türü bazlı listeleme.
- **Öğrenci Profili**: Not ortalaması, aldığı dersler, tez durumu ve geçmiş hareketleri.
- **Risk İzleme**: Başarısızlık ihtimali yüksek öğrencilerin takibi.

### 3. 👥 Danışman Yönetim Sistemi
Akademik personelin performans ve yük takibi.
- **Yük Dağılımı**: Hangi hocanın kaç öğrencisi var, kontenjan dolulukları.
- **Performans Metrikleri**: Danışmanlık yaptığı öğrencilerin başarı oranları.
- **Uzmanlık Alanları**: Hangi hocanın hangi alanda (Yapay Zeka, Veri Bilimi vb.) çalıştığı.
- **Danışman Atama**: (Ders kapsamında geliştirilen CRUD modülü).

### 4. 📚 Ders Analiz Modülü
Derslerin başarı ve verimlilik analizi.
- **Başarı Oranları**: Ders bazında geçme/kalma istatistikleri.
- **Kritik Darboğazlar**: Öğrencilerin en çok zorlandığı derslerin tespiti.

---

## 🛠️ Teknik Mimari

Proje **MVC (Model-View-Controller)** mimarisine sadık kalınarak geliştirilmiştir.

- **Backend**: Node.js, Express.js
- **Veritabanı**: PostgreSQL (Supabase) – 30+ Tablo
- **Authentication**: JWT (JSON Web Token)
- **API Yapısı**: RESTful Architecture

---

## 📡 API Endpoints (Özet)

### 🔐 Auth
- `POST /api/auth/login` - Kullanıcı girişi

### 👥 Danışman Modülü (Advisor)
- `POST /api/advisors/assign` - **Danışman Atama (Course Project)**
- `PUT /api/advisors/change/:studentId` - **Danışman Değiştirme (Course Project)**
- `GET /api/advisors/load-distribution` - Yük dağılımı
- `GET /api/advisors/kpis` - Danışman performans metrikleri
- `GET /api/advisors/:id/students` - Danışmanın öğrencileri

### 📊 Dashboard
- `GET /api/dashboard/kpis` - Genel istatistikler
- `GET /api/dashboard/funnel` - Akademik huni verileri
- `GET /api/dashboard/critical-alarms` - Sistem uyarıları
- `GET /api/dashboard/risk-distribution` - Risk dağılımı

### 🎓 Öğrenci Modülü (Student)
- `GET /api/students` - Filtreli öğrenci listesi
- `GET /api/students/:id/details` - Öğrenci detay profili
- `GET /api/students/stats` - İstatistiksel özetler
- `GET /api/students/stats/high-risk` - Yüksek riskli öğrenciler

### 📚 Ders Modülü (Course)
- `GET /api/courses/analysis` - Ders başarı analizleri
- `GET /api/courses/students` - Dersi alan öğrenciler

---

## 📋 İş Kuralları (Danışman Atama Modülü İçin)

### İş Kuralı 1: Danışman Yük Limiti Kontrolü

**Tanım:** Bir danışmana öğrenci atanırken veya mevcut danışman değiştirilirken, danışmanın mevcut öğrenci sayısı (`mevcut_danismanlik_sayisi`) maksimum kapasitesini (`maksimum_kapasite`) aşmamalıdır.

**Kontrol Noktaları:**
- ✅ POST `/api/advisors/assign`
- ✅ PUT `/api/advisors/change/:studentId`

**Teknik Kod:**
```javascript
const hasCapacity = mevcut_danismanlik_sayisi < maksimum_kapasite;
if (!hasCapacity) throw new Error('Danışman kapasitesi dolu');
```

---

### İş Kuralı 2: Aktif Danışman Kontrolü

**Tanım:** Sadece aktif statüdeki danışmanlar (`aktif_danisman_mi = true` AND `aktif_mi = true`) öğrencilere atanabilir.

**Kontrol Noktaları:**
- ✅ POST `/api/advisors/assign`
- ✅ PUT `/api/advisors/change/:studentId`

**Teknik Kod:**
```javascript
const isActive = aktif_danisman_mi === true && aktif_mi === true;
if (!isActive) throw new Error('Seçilen danışman aktif değil');
```

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

