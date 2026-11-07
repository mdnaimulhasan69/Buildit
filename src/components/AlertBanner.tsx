import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export interface Alert {
  id: string;
  type: 'success' | 'error';
  message: string;
  timestamp: number;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (message: string, type?: 'success' | 'error') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
    const id = 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newAlert: Alert = { id, type, message, timestamp: Date.now() };

    setAlerts((prev) => [...prev, newAlert]);

    // Requirement 26.3: Both stay on the screen for at least 5 seconds or until the user closes them
    setTimeout(() => {
      dismissAlert(id);
    }, 6000); // 6 seconds gives > 5 seconds
  };

  const showSuccess = (message: string) => showAlert(message, 'success');
  const showError = (message: string) => showAlert(message, 'error');

  return (
    <AlertContext.Provider value={{ alerts, showAlert, showSuccess, showError, dismissAlert }}>
      {children}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {alerts.map((alert) => (
          <div
            key={alert.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm font-medium transition-all duration-200 ${
              alert.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 break-words">{alert.message}</div>
            <button
              type="button"
              onClick={() => dismissAlert(alert.id)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
