import type { ReactNode } from 'react';
import { twMerge } from './cn';

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';

const tones: Record<Tone, string> = {
  primary: 'bg-forensic-primary/15 text-forensic-primary border-forensic-primary/40',
  secondary: 'bg-forensic-secondary/15 text-forensic-secondary border-forensic-secondary/40',
  success: 'bg-forensic-success/15 text-forensic-success border-forensic-success/40',
  warning: 'bg-forensic-warning/15 text-forensic-warning border-forensic-warning/40',
  danger: 'bg-forensic-danger/15 text-forensic-danger border-forensic-danger/40',
  muted: 'fx-cardalt fx-text fx-border',
};

export function Badge({
  tone = 'muted',
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function severityTone(sev: string): Tone {
  switch (sev) {
    case 'Critical':
      return 'danger';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'secondary';
    default:
      return 'muted';
  }
}

export function stageTone(stage: string): Tone {
  switch (stage) {
    case 'Archived':
      return 'success';
    case 'Reviewed':
      return 'primary';
    case 'Logged':
      return 'secondary';
    default:
      return 'warning';
  }
}
