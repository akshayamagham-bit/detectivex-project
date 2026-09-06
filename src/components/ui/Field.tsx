import type { ReactNode } from 'react';
import { twMerge } from './cn';

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function Field({ label, children, hint, required, className }: FieldProps) {
  return (
    <label className={twMerge('block', className)}>
      <span className="block text-xs font-medium fx-muted mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="fx-primary"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] fx-muted mt-1">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full fx-cardalt fx-border fx-text rounded-xl px-3.5 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-forensic-primary/40 transition';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={twMerge(inputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={twMerge(inputClass, 'resize-none', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={twMerge(inputClass, 'appearance-none cursor-pointer', props.className)}
    />
  );
}
