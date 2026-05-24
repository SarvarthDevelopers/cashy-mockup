import { createContext } from 'react';

export interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// The context object lives here (non-component file) so ToastContext.tsx stays component-only
export const ToastContext = createContext<ToastContextType | undefined>(undefined);
