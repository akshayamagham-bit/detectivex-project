import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useApp } from '@/context/AppContext';
import { twMerge } from './cn';

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const toneMap = {
  success: 'text-forensic-success border-forensic-success/40',
  error: 'text-forensic-danger border-forensic-danger/40',
  warning: 'text-forensic-warning border-forensic-warning/40',
  info: 'text-forensic-secondary border-forensic-secondary/40',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2.5 w-[320px]">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = iconMap[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={twMerge(
                'fx-glass fx-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-glass border',
                toneMap[t.kind],
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-sm fx-text flex-1">{t.message}</span>
              <button onClick={() => dismissToast(t.id)} className="fx-muted hover:fx-text">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
