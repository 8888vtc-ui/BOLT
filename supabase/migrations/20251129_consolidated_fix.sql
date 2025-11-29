-- CONSOLIDATED FIX FOR BACKGAMMON DB
-- Run this in Supabase SQL Editor to fix permissions and schema issues.

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  elo_rating integer DEFAULT 1200,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;
CREATE POLICY "Rooms are viewable by everyone" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.rooms;
CREATE POLICY "Room creators can update their rooms" ON public.rooms FOR UPDATE USING (auth.uid() = created_by);

-- 3. ROOM PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.room_participants (
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants are viewable by everyone" ON public.room_participants;
CREATE POLICY "Participants are viewable by everyone" ON public.room_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join rooms" ON public.room_participants;
CREATE POLICY "Authenticated users can join rooms" ON public.room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_participants;
CREATE POLICY "Users can leave rooms" ON public.room_participants FOR DELETE USING (auth.uid() = user_id);

-- 4. GAMES (CRITICAL FIXES HERE)
CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  white_player_id uuid REFERENCES public.profiles(id),
  black_player_id uuid REFERENCES public.profiles(id),
  board_state jsonb NOT NULL,
  current_turn uuid REFERENCES public.profiles(id),
  winner_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);

-- FIX: Allow participants to update the game (was blocking moves)
DROP POLICY IF EXISTS "Players can update their games" ON public.games;
DROP POLICY IF EXISTS "Participants can update games" ON public.games;

CREATE POLICY "Participants can update games" 
ON public.games FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.room_participants rp 
    WHERE rp.room_id = public.games.room_id 
    AND rp.user_id = auth.uid()
  )
  OR auth.uid() = white_player_id 
  OR auth.uid() = black_player_id
);

DROP POLICY IF EXISTS "System can create games" ON public.games;
CREATE POLICY "System can create games" ON public.games FOR INSERT TO authenticated WITH CHECK (true);

-- 5. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages are viewable by everyone in the room" ON public.messages;
CREATE POLICY "Messages are viewable by everyone in the room" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
