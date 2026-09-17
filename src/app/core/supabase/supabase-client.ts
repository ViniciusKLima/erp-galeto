import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from '../types/database.types';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient<Database>>('SUPABASE_CLIENT');

export function createSupabaseClient(): SupabaseClient<Database> {
  return createClient<Database>(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
