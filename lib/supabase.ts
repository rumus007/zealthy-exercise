import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          about_me: string | null;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          birthdate: string | null;
          current_step: number;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          about_me?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          birthdate?: string | null;
          current_step?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          about_me?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          birthdate?: string | null;
          current_step?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      onboarding_config: {
        Row: {
          id: string;
          page_number: number;
          component_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_number: number;
          component_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_number?: number;
          component_type?: string;
          created_at?: string;
        };
      };
    };
  };
};