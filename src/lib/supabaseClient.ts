// TODO: LEGACY CODE - This file should be removed after full migration to PostgreSQL
// The application should use direct PostgreSQL queries instead of Supabase client
import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.warn('⚠️  Missing Supabase credentials. Using mock implementation for testing.');
  console.warn('📝 Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  supabase = mockSupabase;
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    console.warn('🔄 Falling back to mock implementation');
    supabase = mockSupabase;
  }
}

export { supabase };