import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
}

// Helper pour décoder le JWT sans librairie externe
const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const API_URL = 'http://localhost:8888'; // En prod, changer par l'URL du backend

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      // 1. Vérifier si un token est présent dans l'URL (retour de Google Auth)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      if (urlToken) {
        localStorage.setItem('token', urlToken);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 2. Récupérer le token du localStorage
      const token = localStorage.getItem('token');

      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          // Vérifier l'expiration si le token contient 'exp'
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser({
              id: decoded.id || decoded.sub,
              username: decoded.username || decoded.name || 'Joueur',
              email: decoded.email,
              avatar: decoded.avatar || decoded.picture,
              role: decoded.role
            });
          }
        } else {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = () => {
    // Redirection vers l'endpoint backend qui lance le flow OAuth Google
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout
  };
}
