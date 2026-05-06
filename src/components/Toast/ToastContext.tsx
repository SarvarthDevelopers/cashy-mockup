import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 items-center pointer-events-none w-full max-w-md px-4">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border
                            animate-in fade-in slide-in-from-bottom-4 duration-300
                            ${toast.type === 'success' ? 'bg-[#17142b] border-white/10 text-white' : 
                              toast.type === 'error' ? 'bg-red-500 border-red-400 text-white' : 
                              'bg-white border-gray-100 text-gray-900'}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-[#4649E5]" />}
                        
                        <p className="text-sm font-semibold tracking-tight">{toast.message}</p>
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
