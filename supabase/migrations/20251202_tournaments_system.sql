-- Migration: Système de Tournois Complet
-- Description: Tables pour gérer les tournois, inscriptions, brackets et matchs

-- ============================================
-- 1. TABLE: tournaments
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    format TEXT NOT NULL CHECK (format IN ('single_elimination', 'double_elimination', 'swiss', 'round_robin')),
    match_length INTEGER NOT NULL DEFAULT 5 CHECK (match_length IN (3, 5, 7, 9, 11, 15)),
    max_players INTEGER NOT NULL DEFAULT 32 CHECK (max_players IN (8, 16, 32, 64, 128, 256)),
    
    -- Statut et timing
    status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('registration', 'in_progress', 'completed', 'cancelled')),
    registration_deadline TIMESTAMPTZ,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    
    -- Récompenses
    prize_pool INTEGER DEFAULT 0, -- Points à distribuer
    entry_fee INTEGER DEFAULT 0,  -- Coût d'inscription (0 = gratuit)
    
    -- Métadonnées
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Règles spéciales
    allow_late_registration BOOLEAN DEFAULT false,
    crawford_rule BOOLEAN DEFAULT true,
    jacoby_rule BOOLEAN DEFAULT false
);

-- Index pour performances
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);

-- ============================================
-- 2. TABLE: tournament_participants
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'eliminated', 'withdrawn', 'winner')),
    seed INTEGER, -- Position de départ (pour brackets)
    
    -- Statistiques
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    
    -- Placement final
    final_rank INTEGER,
    prize_won INTEGER DEFAULT 0,
    
    -- Métadonnées
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    eliminated_at TIMESTAMPTZ,
    
    UNIQUE(tournament_id, user_id)
);

-- Index
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX idx_tournament_participants_status ON tournament_participants(status);

-- ============================================
-- 3. TABLE: tournament_matches
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- Joueurs
    player1_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Bracket info
    round INTEGER NOT NULL, -- 1 = premier tour, 2 = deuxième tour, etc.
    match_number INTEGER NOT NULL, -- Numéro du match dans le tour
    bracket_position TEXT, -- Ex: "winners_bracket", "losers_bracket" (pour double elimination)
    
    -- Résultats
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'bye')),
    winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    
    -- Référence au jeu
    game_room_id TEXT, -- ID de la room de jeu
    
    -- Métadonnées
    scheduled_time TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    UNIQUE(tournament_id, round, match_number, bracket_position)
);

-- Index
CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_player1 ON tournament_matches(player1_id);
CREATE INDEX idx_tournament_matches_player2 ON tournament_matches(player2_id);
CREATE INDEX idx_tournament_matches_status ON tournament_matches(status);
CREATE INDEX idx_tournament_matches_round ON tournament_matches(tournament_id, round);

-- ============================================
-- 4. TABLE: tournament_brackets
-- ============================================
-- Stocke la structure du bracket (arbre)
CREATE TABLE IF NOT EXISTS tournament_brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- Structure JSON du bracket
    bracket_data JSONB NOT NULL,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tournament_id)
);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour tournaments
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour tournament_brackets
CREATE TRIGGER update_tournament_brackets_updated_at
    BEFORE UPDATE ON tournament_brackets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

-- Policies pour tournaments (lecture publique, création authentifiée)
CREATE POLICY "Tournaments are viewable by everyone"
    ON tournaments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create tournaments"
    ON tournaments FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can update their tournaments"
    ON tournaments FOR UPDATE
    USING (auth.uid() = created_by);

-- Policies pour tournament_participants
CREATE POLICY "Tournament participants are viewable by everyone"
    ON tournament_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can register themselves"
    ON tournament_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can withdraw themselves"
    ON tournament_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies pour tournament_matches
CREATE POLICY "Tournament matches are viewable by everyone"
    ON tournament_matches FOR SELECT
    USING (true);

CREATE POLICY "Tournament creators can manage matches"
    ON tournament_matches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_matches.tournament_id
            AND tournaments.created_by = auth.uid()
        )
    );

-- Policies pour tournament_brackets
CREATE POLICY "Tournament brackets are viewable by everyone"
    ON tournament_brackets FOR SELECT
    USING (true);

CREATE POLICY "Tournament creators can manage brackets"
    ON tournament_brackets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_brackets.tournament_id
            AND tournaments.created_by = auth.uid()
        )
    );

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Fonction pour générer un bracket single elimination
CREATE OR REPLACE FUNCTION generate_single_elimination_bracket(
    p_tournament_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_participants UUID[];
    v_bracket JSONB;
    v_num_players INTEGER;
    v_num_rounds INTEGER;
BEGIN
    -- Récupérer les participants
    SELECT ARRAY_AGG(user_id ORDER BY seed NULLS LAST, registered_at)
    INTO v_participants
    FROM tournament_participants
    WHERE tournament_id = p_tournament_id
    AND status = 'registered';
    
    v_num_players := ARRAY_LENGTH(v_participants, 1);
    v_num_rounds := CEIL(LOG(2, v_num_players));
    
    -- Générer la structure du bracket
    v_bracket := jsonb_build_object(
        'format', 'single_elimination',
        'rounds', v_num_rounds,
        'participants', v_participants
    );
    
    RETURN v_bracket;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. SAMPLE DATA (Optionnel - pour tests)
-- ============================================

-- Insérer un tournoi de test
-- INSERT INTO tournaments (name, format, match_length, max_players, start_date, created_by)
-- VALUES (
--     'Championship Hebdomadaire',
--     'single_elimination',
--     5,
--     32,
--     NOW() + INTERVAL '1 day',
--     (SELECT id FROM profiles LIMIT 1)
-- );

COMMENT ON TABLE tournaments IS 'Table principale des tournois';
COMMENT ON TABLE tournament_participants IS 'Participants inscrits aux tournois';
COMMENT ON TABLE tournament_matches IS 'Matchs individuels dans les tournois';
COMMENT ON TABLE tournament_brackets IS 'Structure des brackets (arbres d''élimination)';
