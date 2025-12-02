import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowGuest?: boolean; // Permet l'accès en mode guest
    requireAuth?: boolean; // Force l'authentification (pour certaines routes)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    allowGuest = false,
    requireAuth = false 
}) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
                    <p className="text-[#FFD700] font-medium animate-pulse">Chargement...</p>
                </div>
            </div>
        );
    }

    // Si requireAuth est true, forcer l'authentification
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si allowGuest est true, permettre l'accès même sans authentification
    if (allowGuest) {
        return <>{children}</>;
    }

    // Par défaut, nécessite une authentification
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
