'use client';

import React, { useState, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, RotateCcw, LogOut } from 'lucide-react';
import { createClient } from '../../lib/supabase-client';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Type pour les chunks de données
interface Chunk {
  id: string;
  content: string;
  validation_count?: number;
  rejection_count?: number;
}

export default function ValidationPage() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forceRender, setForceRender] = useState(0);

  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const rejectOpacity = useTransform(x, [-150, -50], [1, 0]);
  const validateOpacity = useTransform(x, [50, 150], [0, 1]);

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('Utilisateur non connecté');
          return;
        }

        // Récupérer tous les chunks
        const { data: allChunks, error: chunksError } = await supabase
          .from('chunks')
          .select('id, content, validation_count, rejection_count')
          .order('id', { ascending: true });

        if (chunksError) {
          console.error('Erreur lors du chargement des chunks:', chunksError);
          return;
        }

        // Récupérer les validations de l'utilisateur actuel
        const { data: userValidations, error: validationsError } = await supabase
          .from('user_validations')
          .select('chunk_id, action')
          .eq('user_id', user.id);

        if (validationsError) {
          console.error('Erreur lors du chargement des validations utilisateur:', validationsError);
          return;
        }

        // Filtrer les chunks déjà validés par l'utilisateur
        const validatedChunkIds = new Set(
          userValidations?.map(uv => uv.chunk_id) || []
        );

        const availableChunks = allChunks?.filter(chunk => !validatedChunkIds.has(chunk.id)) || [];
        
        setChunks(availableChunks);
      } catch (error) {
        console.error('Erreur lors du chargement des chunks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, []);

  // Fonction pour ajouter des données de test
  const addTestData = async () => {
    try {
      const testChunks = [
        {
          content: "Ceci est un premier chunk de données à valider. Il contient des informations importantes qui nécessitent une validation manuelle."
        },
        {
          content: "Deuxième chunk de données. Cette information doit être vérifiée pour s'assurer de sa pertinence et de son exactitude."
        },
        {
          content: "Troisième élément à valider. Les données brutes ont été extraites et nécessitent maintenant une validation humaine."
        },
        {
          content: "Quatrième chunk de test. Cette approche permet de traiter de grandes quantités de données de manière efficace."
        },
        {
          content: "Cinquième élément de données. La validation manuelle garantit la qualité et la fiabilité des informations."
        },
        {
          content: "Sixième chunk à traiter. Chaque élément est présenté individuellement pour faciliter la validation."
        },
        {
          content: "Septième élément de données. L'interface swipe rend le processus de validation plus intuitif et rapide."
        },
        {
          content: "Huitième chunk de test. Les utilisateurs peuvent rapidement valider ou rejeter chaque élément."
        },
        {
          content: "Neuvième élément à valider. Cette méthode améliore significativement la productivité de validation."
        },
        {
          content: "Dixième et dernier chunk de test. Une fois validés, ces éléments peuvent être utilisés en production."
        }
      ];

      const { data, error } = await supabase
        .from('chunks')
        .insert(testChunks.map(chunk => ({
          ...chunk,
          validation_count: 0,
          rejection_count: 0
        })))
        .select();

      if (error) {
        console.error('Erreur lors de l\'insertion des données de test:', error);
        alert('Erreur lors de l\'insertion des données de test: ' + error.message);
      } else {
        alert('Données de test ajoutées avec succès !');
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données de test:', error);
      alert('Erreur lors de l\'insertion des données de test');
    }
  };

  const updateChunkStatus = async (chunkId: string, status: 'validated' | 'rejected') => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }

      // Vérifier si l'utilisateur a déjà validé ce chunk
      const { data: existingValidation, error: checkError } = await supabase
        .from('user_validations')
        .select('*')
        .eq('user_id', user.id)
        .eq('chunk_id', chunkId)
        .single();

      if (existingValidation) {
        console.error('L\'utilisateur a déjà validé ce chunk');
        return;
      }

      // Enregistrer l'action de l'utilisateur
      const { error: userValidationError } = await supabase
        .from('user_validations')
        .insert({
          user_id: user.id,
          chunk_id: chunkId,
          action: status
        });

      if (userValidationError) {
        console.error('Erreur lors de l\'enregistrement de la validation utilisateur:', userValidationError);
        return;
      }

      // Récupérer le chunk actuel pour voir ses compteurs
      const { data: currentChunk, error: fetchError } = await supabase
        .from('chunks')
        .select('*')
        .eq('id', chunkId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération du chunk:', fetchError);
        return;
      }

      if (status === 'validated') {
        // Incrémenter le compteur de validation
        const newValidationCount = (currentChunk.validation_count || 0) + 1;
        
        if (newValidationCount >= 2) {
          // Si 2 validations ou plus, déplacer vers la table validations
          const { error: insertError } = await supabase
            .from('validations')
            .insert({
              content: currentChunk.content,
              validation_count: newValidationCount,
              validated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Erreur lors de l\'insertion dans validations:', insertError);
            return;
          }

          // Supprimer le chunk de la table chunks
          const { error: deleteError } = await supabase
            .from('chunks')
            .delete()
            .eq('id', chunkId);

          if (deleteError) {
            console.error('Erreur lors de la suppression du chunk:', deleteError);
          }
        } else {
          // Sinon, juste mettre à jour le compteur
          const { error: updateError } = await supabase
            .from('chunks')
            .update({ validation_count: newValidationCount })
            .eq('id', chunkId);

          if (updateError) {
            console.error('Erreur lors de la mise à jour du compteur de validation:', updateError);
          }
        }
      } else {
        // Pour les rejets, supprimer directement le chunk
        const { error: deleteError } = await supabase
          .from('chunks')
          .delete()
          .eq('id', chunkId);

        if (deleteError) {
          console.error('Erreur lors de la suppression du chunk rejeté:', deleteError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating || currentIndex >= chunks.length) return;

    setIsAnimating(true);
    
    const currentChunk = chunks[currentIndex];
    const status = direction === 'right' ? 'validated' : 'rejected';
    
    await updateChunkStatus(currentChunk.id, status);
    
    // Recharger les données pour refléter les changements
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Utilisateur non connecté');
      return;
    }

    // Récupérer tous les chunks
    const { data: allChunks, error: chunksError } = await supabase
      .from('chunks')
      .select('id, content, validation_count, rejection_count')
      .order('id', { ascending: true });

    if (chunksError) {
      console.error('Erreur lors du rechargement des chunks:', chunksError);
      return;
    }

    // Récupérer les validations de l'utilisateur actuel
    const { data: userValidations, error: validationsError } = await supabase
      .from('user_validations')
      .select('chunk_id, action')
      .eq('user_id', user.id);

    if (validationsError) {
      console.error('Erreur lors du rechargement des validations utilisateur:', validationsError);
      return;
    }

    // Filtrer les chunks déjà validés par l'utilisateur
    const validatedChunkIds = new Set(
      userValidations?.map(uv => uv.chunk_id) || []
    );

    const availableChunks = allChunks?.filter(chunk => !validatedChunkIds.has(chunk.id)) || [];
    
    setChunks(availableChunks);
    
    // Si le chunk actuel a été supprimé, revenir au début
    if (availableChunks.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= availableChunks.length) {
      setCurrentIndex(0);
    }
    
    setTimeout(() => {
      x.set(0);
      setForceRender(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des données...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (chunks.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Aucune donnée à valider</h2>
            <p className="text-gray-300 mb-6">Tous les chunks ont déjà été traités ou la table est vide.</p>
            <div className="space-y-3">
              <button
                onClick={addTestData}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Check className="w-4 h-4" />
                Ajouter des données de test
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentChunk = chunks[currentIndex];

  if (!currentChunk) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Aucune donnée à valider</h2>
            <p className="text-gray-300 mb-6">Tous les chunks ont déjà été traités ou la table est vide.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentIndex >= chunks.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Validation terminée !</h2>
            <p className="text-gray-300 mb-6">Toutes les données ont été traitées.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header avec logo et bouton de déconnexion */}
        <header className="p-4 sm:p-6">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="flex-1"></div>
            <div className="flex justify-center flex-1">
              <img 
                src="/LogoAllyiaColor.png" 
                alt="Logo" 
                className="h-8 opacity-60 hover:opacity-80 transition-opacity"
              />
            </div>
            <div className="flex justify-end flex-1">
              <motion.button
                onClick={handleSignOut}
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </motion.button>
            </div>
          </div>
        </header>

        {/* Zone principale des cartes */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-sm overflow-hidden">
            {/* Effet de paquet de cartes désordonnées */}
            {[8, 7, 6, 5, 4, 3, 2, 1].map((offset) => {
              const bgChunk = chunks[currentIndex + offset];
              if (!bgChunk) return null;
              
              const randomRotation = (Math.sin(offset * 1.5) * 8) + (Math.cos(offset * 0.7) * 5);
              const randomX = (Math.sin(offset * 1.2) * 3) + (Math.cos(offset * 0.9) * 2);
              const randomY = (Math.sin(offset * 0.8) * 2) + (Math.cos(offset * 1.1) * 1);
              const scale = 1 - (offset * 0.08);
              const opacity = Math.max(0.15, 0.9 - (offset * 0.1));
              
              return (
                <motion.div
                  key={`bg-${currentIndex}-${offset}-${bgChunk.id}`}
                  className="absolute inset-0 bg-gray-800 rounded-2xl shadow-lg border border-gray-700"
                  initial={{ 
                    scale: scale * 0.8, 
                    rotate: randomRotation, 
                    x: randomX, 
                    y: randomY,
                    opacity: 0 
                  }}
                  animate={{ 
                    scale: scale, 
                    rotate: randomRotation, 
                    x: randomX, 
                    y: randomY,
                    opacity: opacity 
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    delay: offset * 0.05 
                  }}
                  style={{
                    zIndex: 50 - offset,
                  }}
                />
              );
            })}

            {/* Carte principale */}
            <motion.div
              key={`card-${currentIndex}-${forceRender}-${currentChunk.id}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ x, rotate, opacity }}
              className="relative bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 cursor-grab active:cursor-grabbing z-60 border border-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ scale: 0, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.1 
              }}
            >
              {/* Indicateurs de swipe */}
              <motion.div
                className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                style={{ opacity: rejectOpacity }}
              >
                REJETER
              </motion.div>
              <motion.div
                className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                style={{ opacity: validateOpacity }}
              >
                VALIDER
              </motion.div>

              {/* Contenu de la carte */}
              <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 font-medium">
                  {chunks.length} document{chunks.length > 1 ? 's' : ''} restant{chunks.length > 1 ? 's' : ''}
                </span>
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              </div>
                
                <div className="text-white leading-relaxed text-base sm:text-lg">
                  {currentChunk.content || 'Contenu non disponible'}
                </div>

                {/* Barre de progression */}
                <div className="mt-6">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / chunks.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-4 sm:p-6">
          <div className="flex justify-center gap-4 max-w-sm mx-auto">
            <motion.button
              onClick={() => handleSwipe('left')}
              disabled={isAnimating}
              className="flex-1 bg-gray-800 border-2 border-red-600 text-red-400 px-6 py-4 rounded-2xl font-medium hover:bg-red-900 hover:border-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5" />
                <span>Rejeter</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleSwipe('right')}
              disabled={isAnimating}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl font-medium hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>Valider</span>
              </div>
            </motion.button>
          </div>

          {/* Instructions de swipe */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Glissez à gauche pour rejeter, à droite pour valider
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 