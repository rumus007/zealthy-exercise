/*
  # Custom Onboarding Flow Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `about_me` (text, nullable)
      - `street_address` (text, nullable)
      - `city` (text, nullable)
      - `state` (text, nullable)
      - `zip` (text, nullable)
      - `birthdate` (date, nullable)
      - `current_step` (integer, default 1)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `onboarding_config`
      - `id` (uuid, primary key)
      - `page_number` (integer, 2 or 3)
      - `component_type` (text: 'about_me', 'address', 'birthdate')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since no auth required per specs)

  3. Initial Data
    - Set up default configuration with components distributed across pages 2 and 3
*/

-- Users table to store onboarding data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  about_me text,
  street_address text,
  city text,
  state text,
  zip text,
  birthdate date,
  current_step integer DEFAULT 1,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configuration table for admin settings
CREATE TABLE IF NOT EXISTS onboarding_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_number integer NOT NULL CHECK (page_number IN (2, 3)),
  component_type text NOT NULL CHECK (component_type IN ('about_me', 'address', 'birthdate')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(component_type)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_config ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required per specs)
CREATE POLICY "Allow public access to users"
  ON users
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to onboarding_config"
  ON onboarding_config
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default configuration
INSERT INTO onboarding_config (page_number, component_type) VALUES
  (2, 'about_me'),
  (2, 'address'),
  (3, 'birthdate')
ON CONFLICT (component_type) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();