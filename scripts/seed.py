"""
Ana Seed Script
Tüm seeder'ları sırayla çalıştırır
"""

import sys
import os

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(__file__))

from seeders.akademik_kadro_seeder import seed_akademik_kadro
from seeders.ogrenci_seeder import seed_ogrenciler
from seeders.danisman_atama_seeder import seed_danisman_atamalari
from seeders.milestone_seeder import seed_milestones
from seeders.tik_toplanti_seeder import seed_tik_toplantilari
from seeders.risk_analizi_seeder import seed_risk_analizi
from seeders.bildirim_seeder import seed_bildirimler

def main():
    """Ana seed fonksiyonu"""
    print("🌱 Mock veri üretimi başlıyor...\n")
    
    try:
        # 1. Akademik kadro import
        personel_ids = seed_akademik_kadro()
        print()
        
        # 2. Öğrenciler üret
        ogrenci_ids = seed_ogrenciler()
        print()
        
        # 3. Danışman atamaları
        seed_danisman_atamalari(ogrenci_ids)
        print()
        
        # 4. Akademik milestone'lar
        seed_milestones(ogrenci_ids)
        print()
        
        # 5. TİK toplantıları
        seed_tik_toplantilari(ogrenci_ids)
        print()
        
        # 6. Risk analizleri
        seed_risk_analizi(ogrenci_ids)
        print()
        
        # 7. Bildirimler
        seed_bildirimler(ogrenci_ids)
        print()
        
        print("✅ Mock veri üretimi tamamlandı!")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

