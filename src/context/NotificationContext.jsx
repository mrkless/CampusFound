import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setNotification({ id, message, type, duration });

    setTimeout(() => {
      setNotification(prev => prev?.id === id ? null : prev);
    }, duration);
  }, []);

  const styles = {
    error: {
      bg: 'bg-white/80',
      border: 'border-red-100',
      text: 'text-red-600',
      icon: <AlertCircle size={20} className="shrink-0 text-red-500" />,
      accent: 'bg-red-500',
      shadow: 'shadow-red-500/10'
    },
    success: {
      bg: 'bg-white/80',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      icon: <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />,
      accent: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/10'
    },
    info: {
      bg: 'bg-white/80',
      border: 'border-primary-100',
      text: 'text-primary-600',
      icon: <Info size={20} className="shrink-0 text-primary-500" />,
      accent: 'bg-primary-500',
      shadow: 'shadow-primary-500/10'
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
        <AnimatePresence mode="wait">
          {notification && (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -40, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div className={`
                relative overflow-hidden
                flex items-center gap-4 px-6 py-4 rounded-2xl 
                bg-white/70 backdrop-blur-xl border border-white
                shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] 
                ${styles[notification.type].shadow}
                min-w-[320px] max-w-lg
              `}>
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles[notification.type].accent}`} />

                {/* Icon wrapper */}
                <div className={`p-2 rounded-xl transition-colors`}>
                  {styles[notification.type].icon}
                </div>

                <div className="flex-grow">
                  <p className={`text-sm font-bold tracking-tight ${styles[notification.type].text}`}>
                    {notification.message}
                  </p>
                </div>

                {/* Progress bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2px] opacity-20 ${styles[notification.type].accent}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
