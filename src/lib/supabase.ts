import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipi condivisi con lo schema del database
export type UserRole = 'ospite' | 'gestore' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export type Track = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  indoor: boolean;
  kids_friendly: boolean;
  allows_minimoto: boolean;
  price_info: string | null;
  images: string[];
  distance_km?: number;
  owner_id?: string | null;
};

export type Post = {
  id: string;
  track_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};
