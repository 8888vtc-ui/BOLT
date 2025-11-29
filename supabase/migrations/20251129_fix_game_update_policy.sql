-- Fix RLS policy for games update to allow participants to update the game
DROP POLICY IF EXISTS "Players can update their games" ON public.games;

CREATE POLICY "Participants can update games" 
ON public.games FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.room_participants rp 
    WHERE rp.room_id = public.games.room_id 
    AND rp.user_id = auth.uid()
  )
  OR
  auth.uid() = white_player_id 
  OR 
  auth.uid() = black_player_id
);
