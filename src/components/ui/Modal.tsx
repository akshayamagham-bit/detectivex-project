import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className={`relative fx-card fx-border rounded-2xl shadow-glass w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="flex items-start justify-between p-5 border-b fx-border">
              <div>
                <h3 className="text-base font-semibold fx-text">{title}</h3>
                {subtitle && <p className="text-sm fx-muted mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 grid place-items-center rounded-lg fx-cardalt fx-border fx-muted hover:fx-primary transition"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">{children}</div>
            {footer && <div className="p-5 border-t fx-border flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
