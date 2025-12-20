"""
TİK Toplantı Seeder
TİK toplantı takvimleri üretir (sadece Doktora öğrencileri için)
"""

import os
import sys
import random
from datetime import datetime, timedelta

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase

def seed_tik_toplantilari(ogrenci_ids):
    """TİK toplantı takvimlerini üret"""
    print("📋 TİK toplantı takvimleri oluşturuluyor...")
    
    # Sadece Doktora öğrencileri için
    doktora_ogrenciler = [o for o in ogrenci_ids if o['program_kodu'] == 'Doktora']
    
    toplanti_sayisi = 0
    
    for ogrenci in doktora_ogrenciler:
        # Her öğrenci için 6 ayda bir toplantı (son 2 yıl için)
        kayit_tarihi = ogrenci['kayit_tarihi']
        if isinstance(kayit_tarihi, str):
            try:
                kayit_tarihi = datetime.fromisoformat(kayit_tarihi.split('T')[0])
            except:
                # Tarih formatı farklıysa parse et
                try:
                    kayit_tarihi = datetime.strptime(kayit_tarihi.split('T')[0], '%Y-%m-%d')
                except:
                    print(f"    ⚠️  Tarih parse edilemedi (ogrenci_id: {ogrenci['ogrenci_id']}), atlanıyor")
                    continue
        
        # İlk toplantı: Tez önerisi onaylandıktan sonra 6 ay içinde
        # Basitleştirilmiş: Kayıt tarihinden 1 yıl sonra başla
        ilk_toplanti = kayit_tarihi + timedelta(days=365)
        
        # Son 2 yıl için toplantılar (4 toplantı)
        for i in range(4):
            toplanti_tarihi = ilk_toplanti + timedelta(days=i * 180)  # 6 ay arayla
            
            # Geçmiş toplantılar için katılım durumu
            if toplanti_tarihi < datetime.now():
                katilim_durumu = random.choice(['Katildi', 'Katilmadi', 'Raporlu'])
                rapor_verildi_mi = katilim_durumu in ['Katildi', 'Raporlu']
            else:
                katilim_durumu = None
                rapor_verildi_mi = False
            
            try:
                response = supabase.table('tik_toplantilari').insert({
                    'ogrenci_id': ogrenci['ogrenci_id'],
                    'toplanti_tarihi': toplanti_tarihi.isoformat().split('T')[0],
                    'katilim_durumu': katilim_durumu,
                    'rapor_verildi_mi': rapor_verildi_mi,
                    'uyari_gonderildi_mi': False
                }).execute()
                
                if response.data:
                    toplanti_sayisi += 1
            except Exception as e:
                # Sessizce atla, çok fazla mesaj yazdırmayalım
                pass
        
        if toplanti_sayisi > 0 and toplanti_sayisi % 20 == 0:
            print(f"    ✅ {toplanti_sayisi} toplantı eklendi")
    
    print(f"✅ Toplam {toplanti_sayisi} TİK toplantısı eklendi")

if __name__ == '__main__':
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")

