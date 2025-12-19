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
        # 6+ ay önce
        return kayit_tarihi + timedelta(days=random.randint(1, 30))
    else:
        # Son 6 ay içinde
        return datetime.now() - timedelta(days=random.randint(1, 180))

