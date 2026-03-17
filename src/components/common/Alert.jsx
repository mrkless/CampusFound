import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alert = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600',
      icon: <AlertCircle size={18} />
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      icon: <CheckCircle size={18} />
    }
  };

  const current = styles[type] || styles.error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-3 p-4 rounded-xl border ${current.bg} ${current.border} ${current.text} mb-6`}
      >
        <div className="shrink-0">
          {current.icon}
        </div>
        <p className="text-sm font-medium flex-grow leading-relaxed">
          {message}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
