/*
  # Enhanced RLS Policies for Existing Tables
  
  ## Overview
  Adds comprehensive Row Level Security policies for all existing tables.
  
  ## Tables Updated
  - users: Own profile access, public profile viewing
  - games: Player-specific and public finished games
  - game_moves: View moves for participating games
  - tournaments: Public viewing, creator management
  - tournament_participants: Public viewing, self-join/leave
  - seasons: Public read-only
  - refresh_tokens: Own tokens only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view other profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can register" ON users;

DROP POLICY IF EXISTS "Players can view their games" ON games;
DROP POLICY IF EXISTS "Anyone can view finished games" ON games;
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Players can update their games" ON games;

DROP POLICY IF EXISTS "Players can view game moves" ON game_moves;
DROP POLICY IF EXISTS "Players can create moves" ON game_moves;

DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Creator can update tournament" ON tournaments;

DROP POLICY IF EXISTS "Anyone can view participants" ON tournament_participants;
DROP POLICY IF EXISTS "Users can join tournaments" ON tournament_participants;
DROP POLICY IF EXISTS "Users can leave tournaments" ON tournament_participants;

DROP POLICY IF EXISTS "Anyone can view seasons" ON seasons;
DROP POLICY IF EXISTS "Users can view own tokens" ON refresh_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON refresh_tokens;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can register"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Players can view their games"
  ON games FOR SELECT
  TO authenticated
  USING (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id OR
    status = 'finished'
  );

CREATE POLICY "Users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id
  )
  WITH CHECK (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id
  );

-- Game moves policies
CREATE POLICY "Players can view game moves"
  ON game_moves FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_moves.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can create moves"
  ON game_moves FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_moves.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Tournaments policies
CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update tournament"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Tournament participants policies
CREATE POLICY "Anyone can view participants"
  ON tournament_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments"
  ON tournament_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seasons policies
CREATE POLICY "Anyone can view seasons"
  ON seasons FOR SELECT
  TO authenticated
  USING (true);

-- Refresh tokens policies
CREATE POLICY "Users can view own tokens"
  ON refresh_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON refresh_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);