"""
Supabase Configuration
Supabase bağlantı yapılandırması
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Environment variables yükle
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError('Missing Supabase environment variables')

# Supabase client oluştur
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

