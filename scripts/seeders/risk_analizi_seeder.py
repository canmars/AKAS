"""
Risk Analizi Seeder
Her öğrenci için risk analizi verileri üretir
"""

import os
import sys
from datetime import datetime

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase
from utils.risk_calculator import calculate_risk_skoru, get_risk_seviyesi

def seed_risk_analizi(ogrenci_ids):
    """Risk analizi verilerini üret"""
    print("⚠️  Risk analizleri hesaplanıyor...")
    
    # Program türleri kodlarını al
    program_turleri = {}
    response = supabase.table('program_turleri').select('program_turu_id, program_kodu').execute()
    
    for program in response.data:
        program_turleri[program['program_turu_id']] = program['program_kodu']
    
    analiz_sayisi = 0
    
    for ogrenci in ogrenci_ids:
        # Normalizasyon: ogrenci_mevcut_durum_view kullanılıyor
        # Öğrenci bilgilerini view'dan al
        response = supabase.table('ogrenci_mevcut_durum_view').select('ogrenci_id, mevcut_yariyil, son_login').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
        
        if response.error:
            # View yoksa, ogrenci tablosundan program_turu_id al
            ogrenci_response = supabase.table('ogrenci').select('program_turu_id').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
            if ogrenci_response.error:
                continue
            program_kodu = program_turleri.get(ogrenci_response.data['program_turu_id'])
            
            # Risk skoru hesapla (basit)
            risk_skoru = calculate_risk_skoru({
                'mevcut_yariyil': 1,  # Varsayılan
                'hayalet_mi': ogrenci.get('hayalet_mi', False)
            }, program_kodu)
        else:
            ogrenci_data = response.data
            # Program türünü al
            ogrenci_response = supabase.table('ogrenci').select('program_turu_id').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
            if ogrenci_response.error:
                continue
            program_kodu = program_turleri.get(ogrenci_response.data['program_turu_id'])
            
            # Risk skoru hesapla
            risk_skoru = calculate_risk_skoru({
                'mevcut_yariyil': ogrenci_data.get('mevcut_yariyil', 1),
                'hayalet_mi': ogrenci.get('hayalet_mi', False) or (ogrenci_data.get('son_login') is None)
            }, program_kodu)
        
        risk_seviyesi = get_risk_seviyesi(risk_skoru)
        
        # Risk analizi ekle (ogrenci tablosunda mevcut_risk_skoru yok, sadece risk_analizi tablosunda)
        response = supabase.table('ogrenci_risk_analizi').insert({
            'ogrenci_id': ogrenci['ogrenci_id'],
            'risk_skoru': risk_skoru,
            'risk_seviyesi': risk_seviyesi,
            'tehlike_turu': 'Genel',
            'hayalet_ogrenci_mi': ogrenci.get('hayalet_mi', False),
            'risk_faktorleri': {
                'hayalet_mi': ogrenci.get('hayalet_mi', False),
                'hesaplama_tarihi': datetime.now().isoformat()
            }
        }).execute()
        
        if response.error:
            continue
        
        analiz_sayisi += 1
        
        if analiz_sayisi % 20 == 0:
            print(f"    ✅ {analiz_sayisi} risk analizi eklendi")
    
    print(f"✅ Toplam {analiz_sayisi} risk analizi eklendi")

if __name__ == '__main__':
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")

