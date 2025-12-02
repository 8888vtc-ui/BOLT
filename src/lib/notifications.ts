import toast from 'react-hot-toast';

export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    style: {
      background: '#1a1a1a',
      color: '#ff4444',
      border: '1px solid #ff4444',
    },
  });
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    style: {
      background: '#1a1a1a',
      color: '#00ff00',
      border: '1px solid #00ff00',
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    style: {
      background: '#1a1a1a',
      color: '#FFD700',
      border: '1px solid #FFD700',
    },
  });
};

export const showWarning = (message: string) => {
  toast(message, {
    duration: 4000,
    icon: '⚠️',
    style: {
      background: '#1a1a1a',
      color: '#FFA500',
      border: '1px solid #FFA500',
    },
  });
};

