import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onCancel,
  type = 'info',
  showClose = true,
  children,
  maxWidth = 'max-w-[340px]'
}) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      bg: 'bg-red-50',
      iconColor: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
      icon: <LogOut size={24} />
    },
    warning: {
      bg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      icon: <AlertTriangle size={24} />
    },
    info: {
      bg: 'bg-primary-50',
      iconColor: 'text-primary-500',
      button: 'bg-primary-500 hover:bg-primary-600 shadow-primary-200',
      icon: <Info size={24} />
    },
    success: {
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
      icon: <CheckCircle size={24} />
    }
  };

  const active = config[type] || config.info;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className={`relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full ${maxWidth} overflow-hidden border border-slate-100`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${active.bg} ${active.iconColor}`}>
              {active.icon}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
            {message}
          </p>

          {children}

          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={() => {
                onConfirm();
                if (!onCancel) onClose();
              }}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] ${active.button}`}
            >
              {confirmText}
            </button>

            {cancelText && (
              <button
                onClick={handleCancel}
                className="w-full py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
