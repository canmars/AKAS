"""
Date Helpers
Tarih yardımcı fonksiyonları
"""

from datetime import datetime, timedelta
import random

def get_random_date(start_year=2020, end_year=2024):
    """Rastgele tarih döndür"""
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    
    return start_date + timedelta(days=random_days)

def get_kayit_tarihi(program_turu_kodu):
    """Program türüne göre kayıt tarihi döndür"""
    # Doktora: 2020-2022 arası
    # Tezli YL: 2021-2023 arası
    # Tezsiz YL: 2022-2024 arası
    
    if program_turu_kodu == 'Doktora':
        return get_random_date(2020, 2022)
    elif program_turu_kodu == 'Tezli_YL':
        return get_random_date(2021, 2023)
    else:  # Tezsiz YL
        return get_random_date(2022, 2024)

def get_son_login_tarihi(kayit_tarihi, hayalet_mi=False):
    """Son login tarihi döndür"""
    if hayalet_mi:
        # Hayalet öğrenci: 180-365 gün önce (6-12 ay arası)
        # Kayıt tarihinden sonra ama 180+ gün önce olmalı
        min_days_ago = 180
        max_days_ago = 365
        days_ago = random.randint(min_days_ago, max_days_ago)
        return datetime.now() - timedelta(days=days_ago)
    else:
        # Normal öğrenci: Son 6 ay içinde (1-180 gün arası)
        return datetime.now() - timedelta(days=random.randint(1, 180))

