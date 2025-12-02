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
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        formatAndSetUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        formatAndSetUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatAndSetUser = async (authUser: any) => {
    // Fetch additional profile data from 'profiles' table if needed
    // For now, we use metadata from auth
    const metadata = authUser.user_metadata || {};

    setUser({
      id: authUser.id,
      username: metadata.username || metadata.full_name || authUser.email?.split('@')[0] || 'Joueur',
      email: authUser.email,
      avatar: metadata.avatar_url || metadata.picture,
      role: authUser.is_anonymous ? 'guest' : 'user'
    });
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Google login error:', error);
    return { error };
  };

  const loginAsGuest = async () => {
    // Sign in anonymously
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
