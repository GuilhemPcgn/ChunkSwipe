-- Script de mise à jour du schéma pour le système de validation
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- 1. Mettre à jour la table chunks pour le nouveau système
ALTER TABLE chunks 
DROP COLUMN IF EXISTS rejected,
DROP COLUMN IF EXISTS validated;

-- Ajouter les nouvelles colonnes pour les compteurs
ALTER TABLE chunks 
ADD COLUMN IF NOT EXISTS validation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0;

-- 2. Créer la table validations pour les données validées par 2+ personnes
CREATE TABLE IF NOT EXISTS validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  validation_count INTEGER NOT NULL DEFAULT 2,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table user_validations pour suivre les validations par utilisateur
CREATE TABLE IF NOT EXISTS user_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('validated', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chunk_id)
);

-- 4. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_validations_user_chunk ON user_validations(user_id, chunk_id);

-- 5. Ajouter des données de test dans la table chunks (si elle est vide)
INSERT INTO chunks (content, validation_count, rejection_count) 
SELECT content, 0, 0
FROM (
  VALUES 
    ('Ceci est un premier chunk de données à valider. Il contient des informations importantes qui nécessitent une validation manuelle.'),
    ('Deuxième chunk de données. Cette information doit être vérifiée pour s''assurer de sa pertinence et de son exactitude.'),
    ('Troisième élément à valider. Les données brutes ont été extraites et nécessitent maintenant une validation humaine.'),
    ('Quatrième chunk de test. Cette approche permet de traiter de grandes quantités de données de manière efficace.'),
    ('Cinquième élément de données. La validation manuelle garantit la qualité et la fiabilité des informations.'),
    ('Sixième chunk à traiter. Chaque élément est présenté individuellement pour faciliter la validation.'),
    ('Septième élément de données. L''interface swipe rend le processus de validation plus intuitif et rapide.'),
    ('Huitième chunk de test. Les utilisateurs peuvent rapidement valider ou rejeter chaque élément.'),
    ('Neuvième élément à valider. Cette méthode améliore significativement la productivité de validation.'),
    ('Dixième et dernier chunk de test. Une fois validés, ces éléments peuvent être utilisés en production.')
) AS new_chunks(content)
WHERE NOT EXISTS (SELECT 1 FROM chunks LIMIT 1);

-- 6. Vérifier les tables
SELECT 'chunks' as table_name, COUNT(*) as count FROM chunks
UNION ALL
SELECT 'validations' as table_name, COUNT(*) as count FROM validations
UNION ALL
SELECT 'user_validations' as table_name, COUNT(*) as count FROM user_validations;

-- 7. Afficher la structure des tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('chunks', 'validations', 'user_validations')
ORDER BY table_name, ordinal_position; 