/*
  # Campus Marketplace Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `hostel` (text, not null)
      - `room` (text, not null)
      - `gender` (text, not null)
      - `branch` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `products`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references users, not null)
      - `name` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, not null)
      - `image_url` (text, not null)
      - `status` (text, default 'available', not null)
      - `created_at` (timestamptz, default now())
    
    - `negotiations`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products, not null)
      - `buyer_id` (uuid, references users, not null)
      - `seller_id` (uuid, references users, not null)
      - `offered_price` (numeric, not null)
      - `status` (text, default 'pending', not null)
      - `created_at` (timestamptz, default now())
    
    - `requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users, not null)
      - `text` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Users can only view and edit their own profile
    - Sellers can only edit/delete their own products
    - Buyers can view all available products
    - Negotiations restricted to involved parties
    - Requests viewable by all authenticated users
    
  3. Important Notes
    - Email validation for @nitj.ac.in domain handled at application level
    - Anonymous display implemented in frontend
    - Product status: 'available' or 'sold'
    - Negotiation status: 'pending', 'accepted', or 'rejected'
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  hostel text NOT NULL,
  room text NOT NULL,
  gender text NOT NULL,
  branch text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  image_url text NOT NULL,
  status text DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'sold')),
  created_at timestamptz DEFAULT now()
);

-- Create negotiations table
CREATE TABLE IF NOT EXISTS negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  offered_price numeric NOT NULL CHECK (offered_price > 0),
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Negotiations policies
CREATE POLICY "Parties can view own negotiations"
  ON negotiations FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create negotiations"
  ON negotiations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update negotiations"
  ON negotiations FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Requests policies
CREATE POLICY "Anyone can view requests"
  ON requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own requests"
  ON requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer_id ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller_id ON negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_product_id ON negotiations(product_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);