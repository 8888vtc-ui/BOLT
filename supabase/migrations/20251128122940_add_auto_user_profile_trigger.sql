/*
  # Add automatic user profile creation trigger

  1. Changes
    - Create a trigger function that automatically creates a user profile when a new auth user signs up
    - This eliminates the "User profile not found" error
    - Handles both email/password and OAuth sign-ups
    
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profile if one doesn't exist
*/

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role, rating, premium)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || substring(NEW.id::text from 1 for 8)),
    'player',
    1500,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();