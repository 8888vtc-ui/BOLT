import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dices, User as UserIcon, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { showError, showSuccess } from '../lib/notifications';

type AuthMode = 'choose' | 'google' | 'email' | 'signup' | 'forgot';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Récupérer la redirection depuis l'URL ou le state
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || 
                     (location.state as any)?.from?.pathname || 
                     '/lobby';

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleGoogleLogin = async () => {
    setError('');
    // Sauvegarder la redirection pour après le callback
    localStorage.setItem('redirectAfterAuth', redirectTo);
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
      showError('Erreur de connexion Google');
      localStorage.removeItem('redirectAfterAuth');
    }
    // La redirection se fera via AuthCallback après OAuth
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        setError(loginError.message);
        showError(loginError.message);
        return;
      }

      if (data.user) {
        // Vérifier si le pseudo existe, sinon demander
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        if (!profile?.username) {
          // Rediriger vers la page de création de pseudo
          navigate('/profile?setup=username');
        } else {
          showSuccess('Connexion réussie !');
          navigate(redirectTo);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      showError(err.message || 'Erreur de connexion');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !username) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Le pseudo doit contenir entre 3 et 20 caractères');
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      
      // 1. Créer le compte
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        showError(signUpError.message);
        return;
      }

      if (authData.user) {
        // 2. Créer le profil avec le pseudo
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            username: username,
            email: email,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
        }

        showSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer.');
        // Attendre un peu puis rediriger
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
      showError(err.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        setError(resetError.message);
        showError(resetError.message);
      } else {
        showSuccess('Email de réinitialisation envoyé !');
        setAuthMode('choose');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
      showError(err.message || 'Erreur lors de l\'envoi');
    }
  };

  if (user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 backgammon-pattern relative overflow-hidden">
      <div className="absolute inset-0 dice-pattern opacity-20"></div>

      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-24 h-24 border-2 border-[#FFD700] opacity-10 rotate-45"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 border-2 border-[#FFD700] opacity-10 rotate-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-[#FFD700] opacity-10 -rotate-45"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD700] blur-3xl opacity-50 rounded-full"></div>
              <Dices className="relative w-24 h-24 text-[#FFD700] drop-shadow-2xl" />
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFC700] to-[#FFD700] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,215,0,0.5)]">
              GuruGammon
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-light">
            Master the ancient game of backgammon
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Mode choix */}
          {authMode === 'choose' && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full group relative overflow-hidden bg-black border-2 border-gray-800 hover:border-[#FFD700] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(255,215,0,0.1)] hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] transform hover:scale-[1.02]"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Se connecter avec Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-500">ou</span>
                </div>
              </div>

              <button
                onClick={() => setAuthMode('email')}
                className="w-full bg-[#1a1a1a] border-2 border-gray-700 hover:border-white text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <Mail className="w-6 h-6" />
                <span>Se connecter avec Email</span>
              </button>

              <button
                onClick={() => setAuthMode('signup')}
                className="w-full bg-[#1a1a1a] border-2 border-gray-700 hover:border-white text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <UserIcon className="w-6 h-6" />
                <span>Créer un compte</span>
              </button>

              <button
                onClick={async () => {
                  setError('');
                  const result = await loginAsGuest();
                  if (result?.error) {
                    if (result.error.code === 'anonymous_provider_disabled') {
                      setError('Les connexions anonymes sont désactivées. Veuillez vous connecter avec Google ou Email.');
                      showError('Connexion anonyme désactivée. Utilisez Google ou Email pour vous connecter.');
                    } else {
                      setError(result.error.message || 'Erreur lors de la connexion en tant qu\'invité');
                      showError('Erreur lors de la connexion en tant qu\'invité');
                    }
                  } else {
                    navigate(redirectTo);
                  }
                }}
                className="w-full bg-[#1a1a1a] border-2 border-gray-700 hover:border-white text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg opacity-70"
              >
                <UserIcon className="w-6 h-6" />
                <span>Continuer en invité</span>
              </button>
            </>
          )}

          {/* Mode connexion email */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-sm text-[#FFD700] hover:underline text-left"
              >
                Mot de passe oublié ?
              </button>
              <button
                type="submit"
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold py-4 px-8 rounded-xl transition-all"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('choose')}
                className="w-full text-gray-400 hover:text-white text-sm"
              >
                ← Retour
              </button>
            </form>
          )}

          {/* Mode inscription */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pseudo</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Votre pseudo (3-20 caractères)"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none pr-12"
                    placeholder="Au moins 6 caractères"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmer le mot de passe</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold py-4 px-8 rounded-xl transition-all"
              >
                Créer mon compte
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('choose')}
                className="w-full text-gray-400 hover:text-white text-sm"
              >
                ← Retour
              </button>
            </form>
          )}

          {/* Mode mot de passe oublié */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold py-4 px-8 rounded-xl transition-all"
              >
                Envoyer le lien de réinitialisation
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('choose')}
                className="w-full text-gray-400 hover:text-white text-sm"
              >
                ← Retour
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Join thousands of players worldwide</p>
        </div>
      </div>
    </div>
  );
}
