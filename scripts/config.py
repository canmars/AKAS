"""
Supabase Configuration
Supabase bağlantı yapılandırması
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Environment variables yükle
load_dotenv()

# VITE_ prefix'li veya prefix'siz değişkenleri destekle
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL:
    raise ValueError('Missing SUPABASE_URL or VITE_SUPABASE_URL environment variable')

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. '
                    'Please add it to your .env file. You can find it in Supabase Dashboard > Settings > API > service_role key')

# Supabase client oluştur
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

