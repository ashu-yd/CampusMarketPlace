import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  name: string;
  hostel: string;
  room: string;
  gender: string;
  branch: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: 'available' | 'sold';
  created_at: string;
}

export interface Negotiation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  offered_price: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Request {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
}
