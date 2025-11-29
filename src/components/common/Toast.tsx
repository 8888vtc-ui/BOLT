import toast, { Toaster, DefaultToastOptions } from 'react-hot-toast';

// Configuration par défaut pour le style Noir/Or
const toastConfig: DefaultToastOptions = {
    duration: 4000,
    position: 'bottom-center',
    style: {
        background: '#111',
        color: '#fff',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        fontSize: '14px',
        maxWidth: '400px',
    },
    success: {
        iconTheme: {
            primary: '#FFD700',
            secondary: '#000',
        },
        style: {
            border: '1px solid rgba(34, 197, 94, 0.3)',
        }
    },
    error: {
        iconTheme: {
            primary: '#EF4444',
            secondary: '#000',
        },
        style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
        }
    },
};

export const GameToaster = () => {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={toastConfig}
            containerStyle={{
                bottom: 40,
            }}
        />
    );
};

// Helpers pour utiliser les toasts plus facilement
export const showToast = {
    success: (message: string) => toast.success(message, {
        style: {
            background: 'linear-gradient(to right, #111, #0a0a0a)',
            borderLeft: '4px solid #FFD700',
            color: '#fff',
        }
    }),

    error: (message: string) => toast.error(message, {
        style: {
            background: 'linear-gradient(to right, #111, #0a0a0a)',
            borderLeft: '4px solid #EF4444',
            color: '#fff',
        }
    }),

    info: (message: string) => toast(message, {
        icon: 'ℹ️',
        style: {
            background: 'linear-gradient(to right, #111, #0a0a0a)',
            borderLeft: '4px solid #3B82F6',
            color: '#fff',
        }
    }),

    gameAction: (message: string) => toast(message, {
        icon: '🎲',
        duration: 2000,
        style: {
            background: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
        }
    })
};
