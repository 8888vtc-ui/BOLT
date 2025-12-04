/*
  ============================================
  GURUGAMMON - SETUP COMPLET SUPABASE
  ============================================
  
  Ce fichier contient TOUTES les migrations nécessaires pour configurer
  complètement la base de données Supabase pour GuruGammon.
  
  IMPORTANT: Exécutez ce fichier dans l'ordre dans Supabase SQL Editor.
  
  Tables créées:
  - profiles (utilisateurs)
  - rooms (salles de jeu)
  - room_participants (participants aux salles)
  - games (parties)
  - messages (messages de chat)
  - tournaments (tournois)
  - tournament_participants (participants aux tournois)
  - tournament_matches (matchs de tournois)
  - leaderboards (classements)
  - analyses (analyses IA)
  - game_analytics (statistiques de jeu)
  - notifications (notifications utilisateurs)
  
  ============================================
*/

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. PROFILES TABLE (Utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 3. ROOMS TABLE (Salles de jeu)
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policies pour rooms (PERMISSIONS OUVERTES pour éviter erreur 42501)
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- ============================================
-- 4. ROOM_PARTICIPANTS TABLE (Participants)
-- ============================================
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Policies pour room_participants (PERMISSIONS OUVERTES)
CREATE POLICY "Anyone can view room participants"
  ON room_participants FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can join rooms"
  ON room_participants FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can leave rooms"
  ON room_participants FOR DELETE
  TO authenticated, anon
  USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);

-- ============================================
-- 5. GAMES TABLE (Parties)
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  white_player_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  black_player_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  player1_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  player2_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  board_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'finished', 'abandoned')),
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policies pour games (PERMISSIONS OUVERTES)
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_games_room_id ON games(room_id);
CREATE INDEX IF NOT EXISTS idx_games_white_player_id ON games(white_player_id);
CREATE INDEX IF NOT EXISTS idx_games_black_player_id ON games(black_player_id);
CREATE INDEX IF NOT EXISTS idx_games_player1_id ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2_id ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- ============================================
-- 6. MESSAGES TABLE (Chat)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies pour messages (PERMISSIONS OUVERTES)
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ============================================
-- 7. TOURNAMENTS TABLE (Tournois)
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'finished', 'cancelled')),
  max_participants integer DEFAULT 32,
  entry_fee numeric DEFAULT 0,
  prize_pool numeric DEFAULT 0,
  format text DEFAULT 'single_elimination' CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  starts_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policies pour tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Index
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);

-- ============================================
-- 8. TOURNAMENT_PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'eliminated', 'winner')),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Policies pour tournament_participants
CREATE POLICY "Anyone can view tournament participants"
  ON tournament_participants FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments"
  ON tournament_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);

-- ============================================
-- 9. TOURNAMENT_MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  round integer NOT NULL,
  match_number integer NOT NULL,
  player1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

-- Policies pour tournament_matches
CREATE POLICY "Anyone can view tournament matches"
  ON tournament_matches FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage tournament matches"
  ON tournament_matches FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_game_id ON tournament_matches(game_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_players ON tournament_matches(player1_id, player2_id);

-- ============================================
-- 10. LEADERBOARDS TABLE (Classements)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  season_id uuid,
  rank integer NOT NULL,
  rating integer NOT NULL DEFAULT 1500,
  games_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  country text DEFAULT 'FR',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Enable RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Policies pour leaderboards
CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage leaderboards"
  ON leaderboards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rating ON leaderboards(rating);

-- ============================================
-- 11. ANALYSES TABLE (Analyses IA)
-- ============================================
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  move_number integer NOT NULL,
  analysis_type text NOT NULL DEFAULT 'position',
  board_state jsonb NOT NULL,
  evaluations jsonb DEFAULT '{}'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  equity numeric,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policies pour analyses
CREATE POLICY "Anyone can view analyses"
  ON analyses FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can create analyses"
  ON analyses FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_analyses_game_id ON analyses(game_id);
CREATE INDEX IF NOT EXISTS idx_analyses_analyzed_at ON analyses(analyzed_at);

-- ============================================
-- 12. GAME_ANALYTICS TABLE (Statistiques)
-- ============================================
CREATE TABLE IF NOT EXISTS game_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  move_accuracy numeric,
  avg_decision_time numeric,
  blunders integer DEFAULT 0,
  excellent_moves integer DEFAULT 0,
  luck_factor numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE game_analytics ENABLE ROW LEVEL SECURITY;

-- Policies pour game_analytics
CREATE POLICY "Users can view own analytics"
  ON game_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create analytics"
  ON game_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_game_analytics_game_id ON game_analytics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_analytics_user_id ON game_analytics(user_id);

-- ============================================
-- 13. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- 14. TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 15. FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DU SETUP
-- ============================================
-- Toutes les tables sont créées avec les permissions nécessaires.
-- Les politiques RLS sont configurées pour permettre l'accès anonyme
-- aux tables principales (rooms, games, messages) pour éviter l'erreur 42501.




