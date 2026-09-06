import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forensic-primary text-black hover:shadow-glow disabled:opacity-40 disabled:hover:shadow-none',
  secondary:
    'bg-forensic-secondary/15 text-forensic-secondary border border-forensic-secondary/40 hover:bg-forensic-secondary/25',
  ghost: 'fx-cardalt fx-border fx-text hover:fx-primary',
  danger: 'bg-forensic-danger/15 text-forensic-danger border border-forensic-danger/40 hover:bg-forensic-danger/25',
  success: 'bg-forensic-success/15 text-forensic-success border border-forensic-success/40 hover:bg-forensic-success/25',
  warning: 'bg-forensic-warning/15 text-forensic-warning border border-forensic-warning/40 hover:bg-forensic-warning/25',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  icon: 'h-9 w-9 rounded-lg grid place-items-center',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      className={twMerge(
        'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-forensic-primary/40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
}
