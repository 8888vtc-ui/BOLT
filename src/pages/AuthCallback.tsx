import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer l'URL de redirection depuis le localStorage ou les paramètres
        const redirectTo = localStorage.getItem('redirectAfterAuth') || '/lobby';
        localStorage.removeItem('redirectAfterAuth');

        // Attendre que Supabase traite le callback
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Vérifier si le profil existe et a un pseudo
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (!profile?.username) {
            // Rediriger vers la page de création de pseudo
            navigate('/profile?setup=username');
          } else {
            // Rediriger vers la destination prévue
            navigate(redirectTo);
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        <p className="text-[#FFD700] font-medium animate-pulse">Connexion en cours...</p>
      </div>
    </div>
  );
}




