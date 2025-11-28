/*
  # GuruGammon Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique, required)
      - `email` (text, optional)
      - `avatar` (text, optional - URL to avatar image)
      - `role` (text, default 'user' - can be 'user', 'guest', 'admin')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable Row Level Security (RLS) on `users` table
    - Policy: Users can read their own data
    - Policy: Users can insert their own data (for guest signup)
    - Policy: Users can update their own data

  3. Important Notes
    - The `id` field references `auth.users` from Supabase Auth
    - Guest users will have role='guest'
    - Google OAuth users will have role='user' by default
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text,
  avatar text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'guest', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow anonymous users to read their own data (for guest mode)
CREATE POLICY "Anonymous users can read own data"
  ON users
  FOR SELECT
  TO anon
  USING (auth.uid() = id);

-- Policy: Allow anonymous users to insert their own data (for guest mode)
CREATE POLICY "Anonymous users can insert own data"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (auth.uid() = id);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
