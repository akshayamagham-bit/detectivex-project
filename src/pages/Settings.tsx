import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  SwatchIcon,
  BellAlertIcon,
  CpuChipIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { THEMES } from '@/data/seed';
import type { ThemeName } from '@/types';

const themePreviews: Record<ThemeName, string[]> = {
  dark: ['#030712', '#1F2937', '#F59E0B'],
  blue: ['#020617', '#112C52', '#3B82F6'],
  amber: ['#1C1408', '#3A2C12', '#FBBF24'],
  light: ['#F1F5F9', '#FFFFFF', '#D97706'],
};

export function Settings() {
  const {
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    demoSensorMode,
    setDemoSensorMode,
    resetDemoData,
    createBackup,
    restoreBackup,
    user,
  } = useApp();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold fx-text tracking-tight">Settings</h1>
        <p className="text-sm fx-muted mt-1">
          Customize DetectiveX appearance and behavior
        </p>
      </div>

      {/* theme selector */}
      <Card className="p-5">
        <SectionTitle
          title="Theme Selector"
          subtitle="Choose the visual style of your dashboard"
          icon={<SwatchIcon className="h-5 w-5" />}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.map((t) => {
            const active = theme === t.id;
            const colors = themePreviews[t.id];
            return (
              <motion.button
                key={t.id}
                whileHover={{ y: -3 }}
                onClick={() => setTheme(t.id as ThemeName)}
                className={`fx-cardalt fx-border rounded-2xl p-4 text-left transition relative ${active ? 'ring-2 ring-forensic-primary shadow-glow' : ''
                  }`}
              >
                <div className="flex gap-2 mb-3">
                  {colors.map((c) => (
                    <div
                      key={c}
                      className="h-8 w-8 rounded-lg border fx-border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold fx-text flex items-center gap-1.5">
                  {t.name}
                  {active && <CheckIcon className="h-4 w-4 fx-primary" />}
                </p>
                <p className="text-[11px] fx-muted mt-0.5 flex items-center gap-1">
                  {t.id === 'light' ? <SunIcon className="h-3 w-3" /> : <MoonIcon className="h-3 w-3" />}
                  {t.id} mode
                </p>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* toggles */}
      <Card className="p-5">
        <SectionTitle
          title="Preferences"
          subtitle="Control notifications and sensor simulation"
          icon={<Cog6ToothIcon className="h-5 w-5" />}
        />
        <div className="space-y-4">
          <Toggle
            icon={<BellAlertIcon className="h-5 w-5" />}
            title="Notifications"
            desc="Show in-app alerts for evidence, status changes and sensor events"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
          <Toggle
            icon={<CpuChipIcon className="h-5 w-5" />}
            title="Demo Sensor Mode"
            desc="Simulate live sensor telemetry — temperature, humidity, battery & signal fluctuate every few seconds"
            value={demoSensorMode}
            onChange={setDemoSensorMode}
          />
        </div>
      </Card>

      {/* demo data */}
      <Card className="p-5">
        <SectionTitle
          title="Data Management"
          subtitle="Restore the demonstration dataset"
          icon={<ArrowPathIcon className="h-5 w-5" />}
        />
        <div className="fx-cardalt fx-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium fx-text">Reset Demo Data</p>
            <p className="text-xs fx-muted mt-0.5">
              Restores evidence, suspects, audit log and notifications to defaults.
            </p>
          </div>
          <Button variant="warning" onClick={resetDemoData}>
            <ArrowPathIcon className="h-4 w-4" /> Reset Now
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle
          icon={<ArrowPathIcon className="h-5 w-5" />}
          title="Backup & Storage"
          subtitle="Create a backup of your DetectiveX data or restore it later."
        />

        <div className="mt-4 space-y-3">
          {/* Create Backup */}
          <div className="flex items-center justify-between rounded-xl bg-panel/60 p-4">
            <div>
              <p className="font-semibold">Create Backup</p>
              <p className="text-sm text-muted">
                Download all case, evidence, suspect, audit and settings data.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={createBackup}
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
          </div>

          {/* Restore Backup */}
          <div className="flex items-center justify-between rounded-xl bg-panel/60 p-4">
            <div>
              <p className="font-semibold">Restore Backup</p>
              <p className="text-sm text-muted">
                Restore DetectiveX data from a previously downloaded backup.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={restoreBackup}
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Restore Backup
            </Button>
          </div>
        </div>
      </Card>
      {/* account info */}
      <Card className="p-5">
        <SectionTitle
          title="Account"
          subtitle="Current session details"
          icon={<Cog6ToothIcon className="h-5 w-5" />}
        />
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="fx-cardalt fx-border rounded-xl p-4">
            <p className="text-[10px] fx-muted uppercase tracking-wider">Officer</p>
            <p className="text-sm font-medium fx-text mt-1">{user?.name}</p>
          </div>
          <div className="fx-cardalt fx-border rounded-xl p-4">
            <p className="text-[10px] fx-muted uppercase tracking-wider">Badge</p>
            <p className="text-sm font-medium fx-text mt-1 font-mono">{user?.badge}</p>
          </div>
          <div className="fx-cardalt fx-border rounded-xl p-4">
            <p className="text-[10px] fx-muted uppercase tracking-wider">Role</p>
            <p className="text-sm font-medium fx-primary mt-1">{user?.role}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Toggle({
  icon,
  title,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="fx-cardalt fx-border rounded-xl p-4 flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-forensic-primary/10 grid place-items-center fx-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium fx-text">{title}</p>
        <p className="text-xs fx-muted mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition shrink-0 ${value ? 'bg-forensic-primary' : 'fx-border fx-cardalt'
          }`}
        aria-pressed={value}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${value ? 'left-6' : 'left-1'
            }`}
        />
      </button>
    </div>
  );
}
