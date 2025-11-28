import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

let toastCallback = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (toastCallback) {
    toastCallback(message, type, duration);
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = (message, type, duration) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    return () => {
      toastCallback = null;
    };
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${colors[toast.type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-up`}
        >
          {icons[toast.type]}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
