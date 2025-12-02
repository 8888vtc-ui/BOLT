-- Migration: Logique de génération de tournois et matchs
-- Remplace la fonction précédente pour inclure la création de rooms et games

CREATE OR REPLACE FUNCTION generate_single_elimination_bracket(
    p_tournament_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_participants UUID[];
    v_bracket JSONB;
    v_num_players INTEGER;
    v_num_rounds INTEGER;
    v_matches_count INTEGER;
    v_match_id UUID;
    v_room_id UUID;
    v_p1 UUID;
    v_p2 UUID;
    v_i INTEGER;
    v_tournament_name TEXT;
BEGIN
    -- Récupérer le nom du tournoi
    SELECT name INTO v_tournament_name FROM tournaments WHERE id = p_tournament_id;

    -- Récupérer les participants (triés par seed)
    SELECT ARRAY_AGG(user_id ORDER BY seed NULLS LAST, registered_at)
    INTO v_participants
    FROM tournament_participants
    WHERE tournament_id = p_tournament_id
    AND status = 'registered';
    
    v_num_players := ARRAY_LENGTH(v_participants, 1);
    
    -- Vérifier qu'il y a assez de joueurs (min 2)
    IF v_num_players < 2 THEN
        RAISE EXCEPTION 'Not enough players to start tournament';
    END IF;

    v_num_rounds := CEIL(LOG(2, v_num_players));
    v_matches_count := v_num_players / 2;
    
    -- Générer les matchs du Round 1
    FOR v_i IN 1..v_matches_count LOOP
        v_p1 := v_participants[(v_i * 2) - 1];
        v_p2 := v_participants[(v_i * 2)];
        
        -- 1. Créer la Room
        INSERT INTO rooms (name, status, created_by)
        VALUES (
            'Match ' || v_i || ' - ' || v_tournament_name,
            'playing',
            v_p1 -- Le joueur 1 est le créateur par défaut
        )
        RETURNING id INTO v_room_id;
        
        -- 2. Ajouter les participants à la Room
        INSERT INTO room_participants (room_id, user_id) VALUES (v_room_id, v_p1);
        IF v_p2 IS NOT NULL THEN
            INSERT INTO room_participants (room_id, user_id) VALUES (v_room_id, v_p2);
        END IF;
        
        -- 3. Créer le Jeu (Game)
        INSERT INTO games (room_id, white_player_id, black_player_id, board_state, current_turn)
        VALUES (
            v_room_id,
            v_p1, -- White
            v_p2, -- Black
            '{"points": [], "bar": {"white": 0, "black": 0}, "off": {"white": 0, "black": 0}}'::jsonb, -- État initial vide, sera init par le client
            v_p1
        );
        
        -- 4. Créer le Match de Tournoi
        INSERT INTO tournament_matches (
            tournament_id,
            round,
            match_number,
            player1_id,
            player2_id,
            status,
            game_room_id
        )
        VALUES (
            p_tournament_id,
            1,
            v_i,
            v_p1,
            v_p2,
            'pending',
            v_room_id
        )
        RETURNING id INTO v_match_id;
        
    END LOOP;
    
    -- Générer la structure du bracket pour le retour JSON
    v_bracket := jsonb_build_object(
        'format', 'single_elimination',
        'rounds', v_num_rounds,
        'participants', v_participants,
        'generated_at', NOW()
    );
    
    -- Sauvegarder le bracket
    INSERT INTO tournament_brackets (tournament_id, bracket_data)
    VALUES (p_tournament_id, v_bracket)
    ON CONFLICT (tournament_id) DO UPDATE
    SET bracket_data = v_bracket, updated_at = NOW();
    
    RETURN v_bracket;
END;
$$ LANGUAGE plpgsql;
