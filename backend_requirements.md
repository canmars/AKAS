# Dashboard Backend Requirements & SQL

Bu doküman, yeni DASHBOARD tasarımı için gerekli olan API uç noktalarını, veri yapılarını ve veritabanı fonksiyonlarını (RPC) içermektedir.

## 1. Backend API Gereklilikleri

Aşağıdaki API uç noktalarının mevcut backend sistemine entegre edilmesi veya güncellenmesi gerekmektedir:

### `GET /api/dashboard/stats` (KPIs)
Üst kısımdaki 4 ana kart için verileri döner.
**Dönüş Formatı:**
```json
{
  "toplam_ogrenci": 342,
  "ogrenci_trend": "+5%",
  "mezuniyet_orani": 78,
  "mezuniyet_trend": "+2%",
  "riskli_ogrenci_sayisi": 24,
  "risk_durumu": "Kritik",
  "danisman_ogrenci_orani": "1:12"
}
```

### `GET /api/dashboard/funnel`
Hunideki (Funnel) her bir aşama için öğrenci sayılarını ve ek bilgileri döner.
**Dönüş Formatı:**
```json
[
  { "label": "Ders Dönemi", "value": 140, "subValue": "Avg: 3.2 GPA", "badge": null },
  { "label": "Yeterlik Sınavı", "value": 110, "subValue": null, "badge": { "text": "High Stress", "type": "warning" } },
  ...
]
```

### `GET /api/dashboard/critical-alarms`
En yüksek risk skoruna sahip 5 öğrenciyi döner.
**Dönüş Formatı:**
```json
[
  {
    "name": "Ahmet K.",
    "stage": "Tez Yazım - 6. Dönem",
    "risk_score": 92,
    "reason": "Devamsızlık",
    "avatar_url": "..."
  },
  ...
]
```

---

## 2. Veritabanı Değişiklikleri ve SQL Kodları

Tasarımın tam verimlilikle çalışması için aşağıdaki fonksiyonların (RPC) veritabanında tanımlanması veya güncellenmesi önerilir.

> [!IMPORTANT]
> Aşağıdaki SQL kodlarını veritabanınızda (Supabase SQL Editor üzerinden) sırayla çalıştırınız.

### 2.1. Huni Metrikleri Fonksiyonu (Funnel)
```sql
CREATE OR REPLACE FUNCTION get_dashboard_funnel_stats()
RETURNS TABLE (
    label text,
    value bigint,
    sub_value text,
    badge_text text,
    badge_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.durum_adi::text as label,
        COUNT(o.ogrenci_id) as value,
        NULL::text as sub_value,
        CASE 
            WHEN dt.durum_kodu = 'YETERLIK_ASAMASI' THEN 'High Stress'
            WHEN dt.durum_kodu = 'TEZ_YAZIM' THEN 'Delay Risk'
            ELSE NULL
        END::text as badge_text,
        CASE 
            WHEN dt.durum_kodu = 'YETERLIK_ASAMASI' THEN 'warning'
            WHEN dt.durum_kodu = 'TEZ_YAZIM' THEN 'danger'
            ELSE NULL
        END::text as badge_type
    FROM public.durum_turleri dt
    LEFT JOIN public.ogrenci o ON o.durum_id = dt.durum_id
    GROUP BY dt.durum_id, dt.durum_adi, dt.durum_kodu, dt.sira_no
    ORDER BY dt.sira_no ASC;
END;
$$ LANGUAGE plpgsql;
```

### 2.2. Kritik Alarmlar Fonksiyonu
```sql
CREATE OR REPLACE FUNCTION get_critical_student_alarms()
RETURNS TABLE (
    name text,
    stage text,
    risk_score integer,
    reason text,
    avatar_url text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (o.ad || ' ' || SUBSTRING(o.soyad, 1, 1) || '.') as name,
        dt.durum_adi::text as stage,
        rs.risk_skoru::integer as risk_score,
        rs.risk_faktorleri->>0 as reason, -- İlk risk faktörünü neden olarak alır
        o.avatar_url
    FROM public.ogrenci o
    JOIN public.ogrenci_risk_skorlari rs ON o.ogrenci_id = rs.ogrenci_id
    JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
    WHERE rs.risk_skoru > 70
    ORDER BY rs.risk_skoru DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
```

### 2.3. Genel KPI Metrikleri
```sql
CREATE OR REPLACE FUNCTION get_dashboard_kpis_v2()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'toplam_ogrenci', (SELECT COUNT(*) FROM public.ogrenci),
        'mezuniyet_orani', 78, -- Örnek sabit veya hesaplanmış değer
        'riskli_ogrenci_sayisi', (SELECT COUNT(*) FROM public.ogrenci_risk_skorlari WHERE risk_skoru > 50),
        'danisman_ogrenci_orani', '1:' || ROUND((SELECT COUNT(*)::numeric FROM public.ogrenci) / (SELECT COUNT(*)::numeric FROM public.akademik_personel WHERE rol = 'Danisman'), 0)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```
