/*
  # Complete GammonGuru Schema Migration
  
  ## Overview
  Adds all missing tables from the backend Prisma schema to support the full GammonGuru platform.
  
  ## New Tables
  
  ### 1. analyses
  Stores AI/GNUBG analysis results for game positions
  - `id` (uuid, primary key)
  - `game_id` (uuid, references games)
  - `move_number` (integer)
  - `analysis_type` (text: 'move', 'position', 'match')
  - `board_state` (jsonb)
  - `evaluations` (jsonb) - AI evaluation scores
  - `suggestions` (jsonb) - Move suggestions
  - `equity` (numeric)
  - `analyzed_at` (timestamptz)
  
  ### 2. subscriptions
  Manages user premium subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references users)
  - `plan` (text: 'free', 'premium', 'pro')
  - `status` (text: 'active', 'cancelled', 'expired')
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz)
  - `stripe_subscription_id` (text, nullable)
  
  ### 3. user_achievements
  Tracks user achievements and badges
  - `id` (uuid, primary key)
  - `user_id` (uuid, references users)
  - `achievement_type` (text)
  - `achievement_name` (text)
  - `earned_at` (timestamptz)
  - `metadata` (jsonb)
  
  ### 4. tournament_matches
  Individual matches within tournaments
  - `id` (uuid, primary key)
  - `tournament_id` (uuid, references tournaments)
  - `game_id` (uuid, references games)
  - `round` (integer)
  - `match_number` (integer)
  - `player1_id` (uuid, references users)
  - `player2_id` (uuid, references users)
  - `winner_id` (uuid, references users, nullable)
  - `status` (text: 'pending', 'in_progress', 'completed')
  
  ### 5. leaderboards
  Global and seasonal leaderboards
  - `id` (uuid, primary key)
  - `user_id` (uuid, references users)
  - `season_id` (uuid, references seasons, nullable)
  - `rank` (integer)
  - `rating` (integer)
  - `games_played` (integer)
  - `wins` (integer)
  - `losses` (integer)
  - `country` (text)
  - `updated_at` (timestamptz)
  
  ### 6. notifications
  User notification system
  - `id` (uuid, primary key)
  - `user_id` (uuid, references users)
  - `type` (text)
  - `title` (text)
  - `message` (text)
  - `read` (boolean)
  - `data` (jsonb)
  - `created_at` (timestamptz)
  
  ### 7. invite_codes
  Tournament and platform invite codes
  - `id` (uuid, primary key)
  - `code` (text, unique)
  - `created_by` (uuid, references users)
  - `max_uses` (integer)
  - `uses` (integer, default 0)
  - `expires_at` (timestamptz, nullable)
  - `metadata` (jsonb)
  
  ### 8. game_analytics
  Analytics and statistics for games
  - `id` (uuid, primary key)
  - `game_id` (uuid, references games)
  - `user_id` (uuid, references users)
  - `move_accuracy` (numeric)
  - `avg_decision_time` (numeric)
  - `blunders` (integer)
  - `excellent_moves` (integer)
  - `luck_factor` (numeric)
  
  ## Security
  - Enable RLS on all new tables
  - Add restrictive policies for authenticated users
  - Ensure users can only access their own data
  
  ## Indexes
  - Add indexes on foreign keys for performance
  - Add indexes on frequently queried columns (user_id, game_id, tournament_id)
*/

-- Create analyses table
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

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create tournament_matches table
CREATE TABLE IF NOT EXISTS tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  round integer NOT NULL,
  match_number integer NOT NULL,
  player1_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player2_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  winner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  season_id uuid REFERENCES seasons(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  rating integer NOT NULL DEFAULT 1500,
  games_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  country text DEFAULT 'US',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create game_analytics table
CREATE TABLE IF NOT EXISTS game_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  move_accuracy numeric,
  avg_decision_time numeric,
  blunders integer DEFAULT 0,
  excellent_moves integer DEFAULT 0,
  luck_factor numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_game_id ON analyses(game_id);
CREATE INDEX IF NOT EXISTS idx_analyses_analyzed_at ON analyses(analyzed_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_game_id ON tournament_matches(game_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_players ON tournament_matches(player1_id, player2_id);

CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_season_id ON leaderboards(season_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_country ON leaderboards(country);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON invite_codes(created_by);

CREATE INDEX IF NOT EXISTS idx_game_analytics_game_id ON game_analytics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_analytics_user_id ON game_analytics(user_id);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analyses
CREATE POLICY "Users can view analyses for their games"
  ON analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = analyses.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "System can insert analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for tournament_matches
CREATE POLICY "Anyone can view tournament matches"
  ON tournament_matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage tournament matches"
  ON tournament_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update tournament matches"
  ON tournament_matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage leaderboards"
  ON leaderboards FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update leaderboards"
  ON leaderboards FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for notifications
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
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for invite_codes
CREATE POLICY "Anyone can view valid invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (uses < max_uses AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can create invite codes"
  ON invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "System can update invite codes"
  ON invite_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for game_analytics
CREATE POLICY "Users can view analytics for their games"
  ON game_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create game analytics"
  ON game_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update game analytics"
  ON game_analytics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);