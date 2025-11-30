import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';

const StubPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pageName = location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.slice(2);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4">
            <div className="w-24 h-24 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-12 h-12 text-[#FFD700]" />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931] mb-4">
                {pageName || 'Page'} en construction
            </h1>
            <p className="text-gray-400 text-lg max-w-md text-center mb-8">
                Cette fonctionnalité est en cours de développement par nos équipes. Revenez très bientôt !
            </p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
            >
                Retour à l'accueil
            </button>
        </div>
    );
};

export default StubPage;
