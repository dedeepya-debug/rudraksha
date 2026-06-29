import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* Global Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            <div className="toast-icon-box">
              {t.type === 'success' && <CheckCircle size={20} className="toast-success-icon" />}
              {t.type === 'error' && <AlertCircle size={20} className="toast-error-icon" />}
              {t.type === 'info' && <Info size={20} className="toast-info-icon" />}
            </div>
            
            <p className="toast-message">{t.message}</p>
            
            <button className="toast-close-btn" onClick={() => removeToast(t.id)} aria-label="Close alert">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
