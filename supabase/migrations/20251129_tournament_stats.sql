-- Add tournament statistics to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tournaments_won integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_played integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournament_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_tournament_finish integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournament_badges jsonb DEFAULT '[]'::jsonb;

-- Create tournament_participations table to track user tournament history
CREATE TABLE IF NOT EXISTS public.tournament_participations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  final_position integer,
  points_earned integer DEFAULT 0,
  matches_won integer DEFAULT 0,
  matches_lost integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tournament_participations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournament_participations
CREATE POLICY "Users can view their own tournament history" 
ON public.tournament_participations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert tournament participations" 
ON public.tournament_participations FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "System can update tournament participations" 
ON public.tournament_participations FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournament_participations_user_id 
ON public.tournament_participations(user_id);

CREATE INDEX IF NOT EXISTS idx_tournament_participations_tournament_id 
ON public.tournament_participations(tournament_id);

COMMENT ON COLUMN public.profiles.tournaments_won IS 'Total number of tournaments won by the user';
COMMENT ON COLUMN public.profiles.tournaments_played IS 'Total number of tournaments participated in';
COMMENT ON COLUMN public.profiles.tournament_points IS 'Total tournament points earned';
COMMENT ON COLUMN public.profiles.best_tournament_finish IS 'Best finish position (1 = winner, 2 = runner-up, etc.)';
COMMENT ON COLUMN public.profiles.tournament_badges IS 'Array of earned tournament badges/achievements';
