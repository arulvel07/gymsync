import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const helpers = {
    showToast,
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    warning: (msg: string) => showToast(msg, 'warning'),
    info: (msg: string) => showToast(msg, 'info'),
  };

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const borderClasses: Record<ToastType, string> = {
    success: 'border-emerald-500/30 text-[#fafafa] bg-[#18181c]',
    warning: 'border-amber-500/30 text-[#fafafa] bg-[#18181c]',
    error: 'border-red-500/30 text-[#fafafa] bg-[#18181c]',
    info: 'border-blue-500/30 text-[#fafafa] bg-[#18181c]',
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="fixed top-5 right-5 z-[1000] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium border shadow-2xl max-w-sm animate-toast-slide-in ${borderClasses[t.type]}`}
          >
            {icons[t.type]}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-[#71717a] hover:text-white bg-transparent border-0 cursor-pointer p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-150"
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
