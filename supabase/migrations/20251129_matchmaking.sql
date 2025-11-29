-- Matchmaking Queue Table
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  elo_rating INTEGER DEFAULT 1200
);

-- RLS Policies
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join queue"
  ON matchmaking_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave queue"
  ON matchmaking_queue FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view queue"
  ON matchmaking_queue FOR SELECT
  USING (true);

-- Matchmaking Function (Simple FIFO for now, can be enhanced)
CREATE OR REPLACE FUNCTION find_match(p_user_id UUID)
RETURNS TABLE (room_id UUID, opponent_id UUID) AS $$
DECLARE
  v_opponent_id UUID;
  v_room_id UUID;
BEGIN
  -- Find an opponent in the queue (excluding self)
  SELECT user_id INTO v_opponent_id
  FROM matchmaking_queue
  WHERE user_id != p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_opponent_id IS NOT NULL THEN
    -- Create a new room
    INSERT INTO rooms (name, status, created_by)
    VALUES ('Ranked Match', 'playing', p_user_id)
    RETURNING id INTO v_room_id;

    -- Add both players to the room
    INSERT INTO room_participants (room_id, user_id)
    VALUES (v_room_id, p_user_id), (v_room_id, v_opponent_id);

    -- Create initial game state
    INSERT INTO games (room_id, white_player_id, black_player_id, board_state)
    VALUES (
      v_room_id, 
      p_user_id, 
      v_opponent_id, 
      '{"board": {"points": [], "bar": {"player1": 0, "player2": 0}, "off": {"player1": 0, "player2": 0}}, "dice": [], "turn": "' || p_user_id || '", "score": {}, "cubeValue": 1}'::jsonb
    );

    -- Remove opponent from queue
    DELETE FROM matchmaking_queue WHERE user_id = v_opponent_id;
    
    -- Return the room info
    RETURN QUERY SELECT v_room_id, v_opponent_id;
  ELSE
    -- No opponent found, join queue
    INSERT INTO matchmaking_queue (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN QUERY SELECT NULL::UUID, NULL::UUID;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
