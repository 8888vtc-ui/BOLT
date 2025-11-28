/*
  # Add role column to users table

  1. Changes
    - Add `role` column to `users` table with default value 'player'
    - Possible values: 'player', 'guest', 'admin'

  2. Security
    - No RLS changes needed, existing policies remain in effect
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text DEFAULT 'player' NOT NULL;
  END IF;
END $$;