/*
  # Fix users table constraints

  1. Changes
    - Make `password_hash` column nullable (Supabase Auth handles passwords)
    - Make `email` column nullable (for guest users)
    
  2. Notes
    - This allows proper integration with Supabase Auth
    - Guest users don't need email or password_hash
*/

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;