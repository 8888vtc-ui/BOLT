-- 🔒 CORRECTION URGENTE DES PROBLÈMES DE SÉCURITÉ SUPABASE
-- Date: 2025-01-02
-- Problème: 43 tables publiques sans RLS activé

-- ============================================
-- 1. ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================

-- Tables identifiées dans le dashboard Supabase
ALTER TABLE IF EXISTS public.analysis_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.websocket_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournaments ENABLE ROW LEVEL SECURITY;

-- Tables standard du projet
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLITIQUES RLS POUR analysis_quotas
-- ============================================

-- Les utilisateurs peuvent voir leurs propres quotas
DROP POLICY IF EXISTS "Users can view own quotas" ON public.analysis_quotas;
CREATE POLICY "Users can view own quotas"
ON public.analysis_quotas
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres quotas
DROP POLICY IF EXISTS "Users can insert own quotas" ON public.analysis_quotas;
CREATE POLICY "Users can insert own quotas"
ON public.analysis_quotas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres quotas
DROP POLICY IF EXISTS "Users can update own quotas" ON public.analysis_quotas;
CREATE POLICY "Users can update own quotas"
ON public.analysis_quotas
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 3. POLITIQUES RLS POUR websocket_connections
-- ============================================

-- Les utilisateurs peuvent voir leurs propres connexions
DROP POLICY IF EXISTS "Users can view own connections" ON public.websocket_connections;
CREATE POLICY "Users can view own connections"
ON public.websocket_connections
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres connexions
DROP POLICY IF EXISTS "Users can insert own connections" ON public.websocket_connections;
CREATE POLICY "Users can insert own connections"
ON public.websocket_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres connexions
DROP POLICY IF EXISTS "Users can update own connections" ON public.websocket_connections;
CREATE POLICY "Users can update own connections"
ON public.websocket_connections
FOR UPDATE
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres connexions
DROP POLICY IF EXISTS "Users can delete own connections" ON public.websocket_connections;
CREATE POLICY "Users can delete own connections"
ON public.websocket_connections
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. POLITIQUES RLS POUR game_analyses
-- ============================================

-- Les utilisateurs peuvent voir les analyses de leurs propres parties
DROP POLICY IF EXISTS "Users can view own game analyses" ON public.game_analyses;
CREATE POLICY "Users can view own game analyses"
ON public.game_analyses
FOR SELECT
USING (
    auth.uid() = user_id 
    OR auth.uid() IN (
        SELECT player1_id FROM public.games WHERE id = game_id
        UNION
        SELECT player2_id FROM public.games WHERE id = game_id
    )
);

-- Les utilisateurs peuvent insérer des analyses pour leurs propres parties
DROP POLICY IF EXISTS "Users can insert own game analyses" ON public.game_analyses;
CREATE POLICY "Users can insert own game analyses"
ON public.game_analyses
FOR INSERT
WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IN (
        SELECT player1_id FROM public.games WHERE id = game_id
        UNION
        SELECT player2_id FROM public.games WHERE id = game_id
    )
);

-- ============================================
-- 5. POLITIQUES RLS POUR user_analytics
-- ============================================

-- Les utilisateurs peuvent voir leurs propres analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics"
ON public.user_analytics
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres analytics
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
CREATE POLICY "Users can insert own analytics"
ON public.user_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres analytics
DROP POLICY IF EXISTS "Users can update own analytics" ON public.user_analytics;
CREATE POLICY "Users can update own analytics"
ON public.user_analytics
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 6. POLITIQUES RLS POUR tournament_participants
-- ============================================

-- Les utilisateurs peuvent voir tous les participants (public)
DROP POLICY IF EXISTS "Anyone can view tournament participants" ON public.tournament_participants;
CREATE POLICY "Anyone can view tournament participants"
ON public.tournament_participants
FOR SELECT
USING (true);

-- Les utilisateurs peuvent s'inscrire eux-mêmes
DROP POLICY IF EXISTS "Users can register themselves" ON public.tournament_participants;
CREATE POLICY "Users can register themselves"
ON public.tournament_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent se désinscrire
DROP POLICY IF EXISTS "Users can unregister themselves" ON public.tournament_participants;
CREATE POLICY "Users can unregister themselves"
ON public.tournament_participants
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 7. POLITIQUES RLS POUR tournaments
-- ============================================

-- Les utilisateurs peuvent voir tous les tournois (public)
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
CREATE POLICY "Anyone can view tournaments"
ON public.tournaments
FOR SELECT
USING (true);

-- Les utilisateurs peuvent créer des tournois
DROP POLICY IF EXISTS "Users can create tournaments" ON public.tournaments;
CREATE POLICY "Users can create tournaments"
ON public.tournaments
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Les créateurs peuvent mettre à jour leurs tournois
DROP POLICY IF EXISTS "Creators can update own tournaments" ON public.tournaments;
CREATE POLICY "Creators can update own tournaments"
ON public.tournaments
FOR UPDATE
USING (auth.uid() = created_by);

-- Les créateurs peuvent supprimer leurs tournois
DROP POLICY IF EXISTS "Creators can delete own tournaments" ON public.tournaments;
CREATE POLICY "Creators can delete own tournaments"
ON public.tournaments
FOR DELETE
USING (auth.uid() = created_by);

-- ============================================
-- 8. VÉRIFICATION DES TABLES EXISTANTES
-- ============================================

-- Script pour vérifier toutes les tables publiques sans RLS
-- À exécuter dans Supabase SQL Editor pour identifier toutes les tables problématiques

DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations', 'schema_migrations')
    LOOP
        -- Vérifier si RLS est activé
        IF NOT EXISTS (
            SELECT 1
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname = table_record.tablename
            AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE 'Table sans RLS: %', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 9. OPTIMISATION DES REQUÊTES LENTES
-- ============================================

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_analysis_quotas_user_id ON public.analysis_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_user_id ON public.websocket_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_game_analyses_game_id ON public.game_analyses(game_id);
CREATE INDEX IF NOT EXISTS idx_game_analyses_user_id ON public.game_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON public.tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON public.tournaments(created_by);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);

-- ============================================
-- 10. NOTES IMPORTANTES
-- ============================================

-- ⚠️ AVANT D'EXÉCUTER CE SCRIPT:
-- 1. Sauvegarder la base de données
-- 2. Tester sur un environnement de staging si possible
-- 3. Vérifier que toutes les tables existent
-- 4. Adapter les politiques selon vos besoins spécifiques

-- ✅ APRÈS L'EXÉCUTION:
-- 1. Vérifier le dashboard Supabase (les problèmes devraient disparaître)
-- 2. Tester les fonctionnalités de l'application
-- 3. Vérifier que les utilisateurs peuvent toujours accéder aux données nécessaires

