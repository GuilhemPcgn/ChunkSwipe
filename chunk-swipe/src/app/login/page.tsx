'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase-client'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    
    checkUser()
  }, [supabase.auth, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Connexion réussie ! Redirection...')
        setRedirecting(true)
        // Redirection manuelle vers la page d'accueil
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (error) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particules de fond animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full float-animation" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-slate-300/30 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-slate-400/10 rounded-full float-animation" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-slate-300/15 rounded-full float-animation" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="glass-card rounded-3xl p-4 depth-shadow inline-block mb-4">
            <img 
              src="/LogoAllyiaColor.png" 
              alt="Logo Allyia" 
              className="h-12 mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2 gradient-text">ChunkSwipe</h1>
          <p className="text-slate-300 font-medium">Connectez-vous pour continuer</p>
        </div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-3xl p-8 depth-shadow"
        >
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 glass-input rounded-2xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Messages d'erreur et de succès */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-button border border-red-400/40 text-red-300 px-4 py-3 rounded-2xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-button border border-green-400/40 text-green-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
              >
                {redirecting && (
                  <div className="w-4 h-4 border-2 border-green-300 border-t-transparent rounded-full animate-spin"></div>
                )}
                {message}
              </motion.div>
            )}

            {/* Boutons */}
            <div className="space-y-3">
              <motion.button
                type="submit"
                disabled={loading || redirecting}
                className="w-full glass-button text-slate-200 py-3 px-4 rounded-2xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-400/40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading || redirecting ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {redirecting ? 'Redirection...' : 'Se connecter'}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleSignUp}
                disabled={loading || redirecting}
                className="w-full glass-button text-slate-300 py-3 px-4 rounded-2xl font-medium hover:bg-white/10 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Créer un compte
              </motion.button>
            </div>
          </form>

          {/* Informations supplémentaires */}
          <div className="mt-6 pt-6 border-t border-slate-400/20">
            <p className="text-xs text-slate-400 text-center">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 