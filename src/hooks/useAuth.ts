import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Si mode démo, ne pas essayer Supabase
    if (DEMO_MODE) {
      console.log('Demo mode: Supabase not configured, skipping auth');
      setLoading(false);
      return;
    }

    // Timeout pour éviter le blocage infini
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth check timeout, setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 secondes max

    // 1. Get initial session avec gestion d'erreur
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Supabase auth error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          formatAndSetUser(session.user);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        console.error('Supabase auth catch error:', error);
        setLoading(false);
      });

    // 2. Listen for auth changes
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        
        clearTimeout(timeoutId);
        
        if (session?.user) {
          formatAndSetUser(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const formatAndSetUser = async (authUser: any) => {
    try {
      const metadata = authUser.user_metadata || {};
      let username = metadata.username || metadata.full_name || authUser.email?.split('@')[0] || 'Joueur';
      let avatar = metadata.avatar_url || metadata.picture;

      // Vérifier si le profil existe dans la table profiles
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', authUser.id)
          .single();

        if (!profileError && profile) {
          // Utiliser le pseudo du profil s'il existe
          if (profile.username) {
            username = profile.username;
          }
          if (profile.avatar_url) {
            avatar = profile.avatar_url;
          }
        } else {
          // Créer le profil s'il n'existe pas
          const displayName = metadata.full_name || metadata.name || authUser.email?.split('@')[0] || `Joueur${Math.floor(Math.random() * 1000)}`;
          
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              username: displayName,
              email: authUser.email,
              avatar_url: avatar,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (!insertError) {
            username = displayName;
          }
        }
      } catch (err) {
        console.error('Error checking/creating profile:', err);
        // Continuer avec les métadonnées de base
      }

      setUser({
        id: authUser.id,
        username: username,
        email: authUser.email,
        avatar: avatar,
        role: authUser.is_anonymous ? 'guest' : 'user'
      });
    } catch (error) {
      console.error('Error formatting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) console.error('Google login error:', error);
    return { error };
  };

  const loginAsGuest = async () => {
    const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (DEMO_MODE) {
      // Mode démo : créer un utilisateur local
      const guestName = `Guest ${Math.floor(Math.random() * 1000)}`;
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestId}`;
      
      setUser({
        id: guestId,
        username: guestName,
        avatar,
        role: 'guest'
      });
      setLoading(false);
      return;
    }

    // Sign in anonymously
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Guest login error:', error);
        return;
      }

      if (data?.user) {
        // Update profile with random guest name
        const guestName = `Guest ${Math.floor(Math.random() * 1000)}`;
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`;

        await supabase.auth.updateUser({
          data: { username: guestName, avatar_url: avatar }
        });
      }
    } catch (error) {
      console.error('Guest login catch error:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const updateUsername = async (username: string): Promise<{ error: string | null }> => {
    // Validation
    if (username.length < 3 || username.length > 20) {
      return { error: 'Username must be between 3 and 20 characters' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        return { error: 'User not authenticated' };
      }

      // Update auth.users.user_metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username }
      });

      if (authError) {
        return { error: authError.message || 'Failed to update username in auth' };
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          username,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        // If profiles table doesn't exist or fails, try to continue with auth update
        console.warn('Failed to update profiles table:', profileError);
        // Still return success if auth update worked
      }

      // Refresh user data
      await formatAndSetUser(authUser);

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update username' };
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    loginAsGuest,
    logout,
    updateUsername
  };
}
