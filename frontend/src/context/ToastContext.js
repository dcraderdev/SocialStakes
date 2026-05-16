import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

let _idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => t.id === id ? { ...t, exiting: true } : t)
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 280);
  }, []);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_idCounter;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((msg, d) => show(msg, 'success', d), [show]);
  const error   = useCallback((msg, d) => show(msg, 'error', d),   [show]);
  const info    = useCallback((msg, d) => show(msg, 'info', d),    [show]);

  const icons = { success: '✓', error: '✕', info: '★' };

  return (
    <ToastContext.Provider value={{ show, success, error, info, dismiss }}>
      {children}
      {createPortal(
        <div className="ss-toast-portal" role="region" aria-label="Notifications">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`ss-toast ${t.type}${t.exiting ? ' exiting' : ''}`}
              role="alert"
            >
              <span className="ss-toast-icon">{icons[t.type]}</span>
              <span className="ss-toast-msg">{t.message}</span>
              <button
                className="ss-toast-close"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
