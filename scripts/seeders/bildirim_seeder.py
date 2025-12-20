"""
Bildirim Seeder
Risk altındaki öğrenciler için bildirimler üretir
"""

import os
import sys
from datetime import datetime

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase

def seed_bildirimler(ogrenci_ids):
    """Bildirimler üret"""
    print("🔔 Bildirimler oluşturuluyor...")
    
    # Bildirim türleri ID'lerini al
    bildirim_turleri = {}
    response = supabase.table('bildirim_turleri').select('bildirim_turu_id, bildirim_turu_kodu').execute()
    
    for tur in response.data:
        bildirim_turleri[tur['bildirim_turu_kodu']] = tur['bildirim_turu_id']
    
    # Bölüm Başkanı kullanıcı ID'sini al (varsa)
    response = supabase.table('kullanicilar').select('kullanici_id').eq('rol', 'Bolum_Baskani').limit(1).execute()
    bolum_baskani_id = response.data[0]['kullanici_id'] if response.data else None
    
    if not bolum_baskani_id:
        print("⚠️  Bölüm Başkanı kullanıcısı bulunamadı. Bildirimler oluşturulamadı.")
        return
    
    bildirim_sayisi = 0
    
    # Kritik risk altındaki öğrenciler için bildirim
    for ogrenci in ogrenci_ids:
        if ogrenci.get('hayalet_mi', False):
            ogrenci_id = ogrenci.get('ogrenci_id')
            
            if not ogrenci_id:
                continue
            
            try:
                response = supabase.table('bildirimler').insert({
                    'bildirim_turu_id': bildirim_turleri.get('Hayalet_Ogrenci'),
                    'ogrenci_id': ogrenci_id,
                    'alici_kullanici_id': bolum_baskani_id,
                    'alici_rol': 'Bolum_Baskani',
                    'mesaj': f'Öğrenci {str(ogrenci_id)[:8]} 6+ aydır login olmamış (Hayalet öğrenci)',
                    'bildirim_onceligi': 'Kritik',
                    'bildirim_durumu': 'Olusturuldu',
                    'okundu_mi': False
                }).execute()
                
                if response.data:
                    bildirim_sayisi += 1
            except Exception as e:
                # Sessizce atla
                pass
    
    print(f"✅ Toplam {bildirim_sayisi} bildirim eklendi")

if __name__ == '__main__':
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")
