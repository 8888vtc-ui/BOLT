-- Script de vérification RLS
-- Exécutez ce script dans Supabase SQL Editor pour vérifier l'état

-- Vérifier quelles tables ont RLS activé
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN relrowsecurity THEN 'RLS ACTIVÉ ✅'
        ELSE 'RLS DÉSACTIVÉ ❌'
    END as rls_status
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE schemaname = 'public'
AND tablename NOT IN ('_prisma_migrations', 'schema_migrations')
ORDER BY tablename;

-- Compter les politiques RLS par table
SELECT 
    schemaname,
    tablename,
    COUNT(pol.polname) as nombre_politiques
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
WHERE schemaname = 'public'
AND tablename NOT IN ('_prisma_migrations', 'schema_migrations')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Lister toutes les politiques RLS créées
SELECT 
    schemaname,
    tablename,
    policyname as nom_politique,
    permissive,
    roles,
    cmd as commande
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


