import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  FingerPrintIcon,
  ArrowRightIcon,
  UserCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/solid';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, TextInput, Select } from '@/components/ui/Field';

const roles: { id: Role; label: string; desc: string; tone: string }[] = [
  {
    id: 'Investigator',
    label: 'Investigator',
    desc: 'Full access — add, edit, advance & delete',
    tone: 'fx-primary',
  },
  {
    id: 'Supervisor',
    label: 'Supervisor',
    desc: 'Read-only oversight of the case',
    tone: 'text-forensic-secondary',
  },
];


const presets = [
  {
    name: 'Det. Akshaya',
    badge: 'BX-7741',
    role: 'Investigator' as Role,
  },
  {
    name: 'Det. Rohan',
    badge: 'BX-7742',
    role: 'Investigator' as Role,
  },
  {
    name: 'Lt. Keerthana',
    badge: 'SV-3309',
    role: 'Supervisor' as Role,
  },
  {
    name: 'Lt. Manash',
    badge: 'SV-3310',
    role: 'Supervisor' as Role,
  },
];

export function Login() {
  const { login } = useApp();
  const [name, setName] = useState('Det.Akshaya');
  const [badge, setBadge] = useState('BX-7741');
  const [role, setRole] = useState<Role>('Investigator');
  const [error, setError] = useState('');
  useEffect(() => {
    const preset = presets.find((p) => p.role === role);
    if (preset) {
      setName(preset.name);
      setBadge(preset.badge);
    }
  }, [role]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !badge.trim()) {
      setError('Officer name and badge number are required.');
      return;
    }
    setError('');
    login({ name: name.trim(), badge: badge.trim(), role });
  };

  const pickPreset = (p: (typeof presets)[number]) => {
    setName(p.name);
    setBadge(p.badge);
    setRole(p.role);
    setError('');
  };

  return (
    <div className="min-h-screen fx-bg relative overflow-hidden flex items-center justify-center p-4">
      {/* background grid + glow */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-forensic-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-forensic-secondary/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forensic-primary/60 to-transparent animate-scan-line" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative fx-glass fx-border rounded-3xl shadow-glass w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden"
      >
        {/* left brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 fx-cardalt fx-border-r relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-forensic-primary/15 border border-forensic-primary/40 grid place-items-center">
                <FingerPrintIcon className="h-7 w-7 fx-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold fx-text tracking-tight">DetectiveX</h1>
                <p className="text-xs fx-muted uppercase tracking-[0.3em]">Digital Evidence Management</p>
              </div>
            </div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold fx-text leading-tight"
            >
              Secure evidence. <br />
              <span className="fx-primary">Airtight chain of custody.</span>
            </motion.h2>
            <p className="text-sm fx-muted mt-4 leading-relaxed">
              End-to-end crime scene evidence management — intake, sensor telemetry, QR-tagged
              custody chain, suspects, analytics and printable reports.
            </p>
          </div>
          <div className="relative space-y-3 mt-8">
            {[
              'Chain of Custody tracking',
              'Live sensor & RFID telemetry',
              'Role-based access control',
              'Automated audit logging',
            ].map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className="flex items-center gap-3"
              >
                <ShieldCheckIcon className="h-5 w-5 fx-primary" />
                <span className="text-sm fx-text">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* right form panel */}
        <div className="p-8 sm:p-10">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-forensic-primary/15 border border-forensic-primary/40 grid place-items-center">
              <FingerPrintIcon className="h-6 w-6 fx-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold fx-text tracking-tight">DetectiveX</h1>
              <p className="text-[10px] fx-muted uppercase tracking-[0.3em]">Digital Evidence Management</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold fx-text mb-1">Officer Sign In</h2>
          <p className="text-sm fx-muted mb-6">
            Authenticate with your credentials and assigned clearance role.
          </p>

          {/* quick presets */}
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map((p) => (
              <button
                key={p.badge}
                onClick={() => pickPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg fx-cardalt fx-border fx-muted hover:fx-primary transition"
              >
                {p.name}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Officer Name" required>
              <div className="relative">
                <UserCircleIcon className="h-5 w-5 fx-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Det.Akshaya"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Badge Number" required>
              <div className="relative">
                <IdentificationIcon className="h-5 w-5 fx-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <TextInput
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. BX-7741"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Clearance Role">
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const active = role === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`text-left rounded-xl p-3.5 border transition ${active
                        ? 'border-forensic-primary bg-forensic-primary/10 shadow-glow'
                        : 'fx-border fx-cardalt hover:fx-primary'
                        }`}
                    >
                      <div className={`text-sm font-semibold ${active ? r.tone : 'fx-text'}`}>
                        {r.label}
                      </div>
                      <div className="text-[11px] fx-muted mt-1 leading-snug">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Field>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-forensic-danger"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Authenticate & Enter
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-[11px] fx-muted text-center mt-6">
            Authorized personnel only. All access is logged in the audit trail.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
