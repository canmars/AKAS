"""
Milestone Seeder
Akademik milestone'lar üretir
"""

import os
import sys
import random
from datetime import datetime, timedelta

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase

def seed_milestones(ogrenci_ids):
    """Akademik milestone'ları üret"""
    print("📅 Akademik milestone'lar üretiliyor...")
    
    milestone_sayisi = 0
    
    for ogrenci in ogrenci_ids:
        program_kodu = ogrenci.get('program_kodu', '')
        ogrenci_id = ogrenci.get('ogrenci_id')
        
        if not ogrenci_id:
            continue
        
        if program_kodu == 'Doktora':
            # Doktora için: Yeterlik sınavı ve Tez önerisi
            # Yeterlik sınavı (3-5 yarıyıl arası)
            yeterlik_yariyil = random.randint(3, 5)
            yeterlik_tarih = datetime.now() - timedelta(days=random.randint(30, 180))
            
            try:
                response = supabase.table('akademik_milestone').insert({
                    'ogrenci_id': ogrenci_id,
                    'milestone_turu': 'Yeterlik_Sinavi',
                    'hedef_tarih': yeterlik_tarih.isoformat().split('T')[0],
                    'gerceklesme_tarihi': yeterlik_tarih.isoformat().split('T')[0],
                    'durum': 'Tamamlandi',
                    'savunma_sonucu': random.choice(['Onaylandi', 'Revizyon_Gerekli'])
                }).execute()
                
                if response.data:
                    milestone_sayisi += 1
                
                # Tez önerisi (yeterlikten sonra)
                if random.random() < 0.7:  # %70 ihtimal
                    tez_onersi_tarih = yeterlik_tarih + timedelta(days=random.randint(60, 180))
                    try:
                        response = supabase.table('akademik_milestone').insert({
                            'ogrenci_id': ogrenci_id,
                            'milestone_turu': 'Tez_Onersi',
                            'hedef_tarih': tez_onersi_tarih.isoformat().split('T')[0],
                            'gerceklesme_tarihi': tez_onersi_tarih.isoformat().split('T')[0],
                            'durum': 'Tamamlandi',
                            'savunma_sonucu': random.choice(['Onaylandi', 'Revizyon_Gerekli'])
                        }).execute()
                        
                        if response.data:
                            milestone_sayisi += 1
                    except Exception as e:
                        # Sessizce atla, çok fazla mesaj yazdırmayalım
                        pass
            except Exception as e:
                # Sessizce atla, çok fazla mesaj yazdırmayalım
                pass
        
        elif program_kodu == 'Tezli_YL':
            # Tezli YL için: Dönem projesi
            if random.random() < 0.5:  # %50 ihtimal
                donem_projesi_tarih = datetime.now() - timedelta(days=random.randint(30, 120))
                try:
                    response = supabase.table('akademik_milestone').insert({
                        'ogrenci_id': ogrenci_id,
                        'milestone_turu': 'Donem_Projesi',
                        'hedef_tarih': donem_projesi_tarih.isoformat().split('T')[0],
                        'gerceklesme_tarihi': donem_projesi_tarih.isoformat().split('T')[0],
                        'durum': 'Tamamlandi'
                    }).execute()
                    
                    if response.data:
                        milestone_sayisi += 1
                except Exception as e:
                    # Sessizce atla
                    pass
        
        if milestone_sayisi > 0 and milestone_sayisi % 20 == 0:
            print(f"    ✅ {milestone_sayisi} milestone eklendi")
    
    print(f"✅ Toplam {milestone_sayisi} milestone eklendi")

if __name__ == '__main__':
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")
