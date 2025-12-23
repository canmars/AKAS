/**
 * API Client
 * Supabase ve Express API çağrıları için merkezi client
 */

import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Frontend için Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export class ApiClient {
  /**
   * Express API'ye istek gönder
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   */
  static async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET isteği
   */
  static async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.fetch(url, { method: 'GET' });
  }

  /**
   * POST isteği
   */
  static async post(endpoint, data = {}) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT isteği
   */
  static async put(endpoint, data = {}) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE isteği
   */
  static async delete(endpoint) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }

  /**
   * Supabase'den veri çek (direkt view'lerden)
   * @param {string} viewName - View adı
   * @param {Object} filters - Filtreler
   */
  static async getFromView(viewName, filters = {}) {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      let query = supabase.from(viewName).select('*');

      // Filtreleri uygula
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  }

  /**
   * Supabase'den tek bir kayıt çek
   */
  static async getOneFromTable(tableName, id, idColumn = 'id') {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idColumn, id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  }
}

export default ApiClient;

