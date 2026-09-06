import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { twMerge } from './cn';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className, glass, ...rest }: CardProps) {
  return (
    <motion.div
      className={twMerge(
        'fx-card fx-border rounded-2xl shadow-glass',
        glass && 'fx-glass',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ title, subtitle, icon, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-xl fx-cardalt fx-border grid place-items-center fx-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold fx-text tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm fx-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
