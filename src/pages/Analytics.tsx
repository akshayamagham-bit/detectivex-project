import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  PhotoIcon,
  MapPinIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PALETTE = ['#F59E0B', '#06B6D4', '#22C55E', '#F97316', '#EF4444', '#A78BFA', '#34D399', '#60A5FA', '#F472B6'];
const AXIS = '#94a3b8';
const GRID = '#374151';

function tooltipStyle() {
  return {
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 12,
  };
}

export function Analytics() {
  const { evidence } = useApp();

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    evidence.forEach((e) => (map[e.type] = (map[e.type] ?? 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [evidence]);

  const bySeverity = useMemo(() => {
    const map: Record<string, number> = {};
    evidence.forEach((e) => (map[e.severity] = (map[e.severity] ?? 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [evidence]);

  const byStage = useMemo(() => {
    const map: Record<string, number> = {};
    evidence.forEach((e) => (map[e.stage] = (map[e.stage] ?? 0) + 1));
    return ['Collected', 'Logged', 'Reviewed', 'Archived'].map((name) => ({
      name,
      value: map[name] ?? 0,
    }));
  }, [evidence]);

  const trend = useMemo(() => {
    const sorted = [...evidence].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    let cum = 0;
    return sorted.map((e) => {
      cum += 1;
      return {
        time: new Date(e.timestamp).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        cumulative: cum,
        temp: e.temperature,
      };
    });
  }, [evidence]);

  const warnings = useMemo(() => {
    const w: { label: string; icon: typeof FingerPrintIcon }[] = [];
    if (!evidence.some((e) => e.fingerprintMatch))
      w.push({ label: 'No Fingerprint Evidence', icon: FingerPrintIcon });
    if (!evidence.some((e) => e.photo))
      w.push({ label: 'No Photo Evidence', icon: PhotoIcon });
    if (!evidence.some((e) => e.type === 'Footwear'))
      w.push({ label: 'No Footprints', icon: ArchiveBoxIcon });
    if (!evidence.some((e) => e.gps))
      w.push({ label: 'No GPS Evidence', icon: MapPinIcon });
    return w;
  }, [evidence]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold fx-text tracking-tight">Analytics</h1>
        <p className="text-sm fx-muted mt-1">
          Live forensic intelligence — {evidence.length} evidence items analyzed
        </p>
      </div>

      {/* warning cards */}
      {warnings.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {warnings.map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="p-4 border-forensic-warning/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-forensic-warning/15 grid place-items-center text-forensic-warning">
                    <w.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-forensic-warning flex items-center gap-1.5">
                      <ExclamationTriangleIcon className="h-4 w-4" /> Attention
                    </p>
                    <p className="text-xs fx-text">{w.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {warnings.length === 0 && (
        <Card className="p-4 border-forensic-success/40">
          <p className="text-sm text-forensic-success flex items-center gap-2">
            All evidence categories represented — no gaps detected.
          </p>
        </Card>
      )}

      {/* charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* bar */}
        <Card className="p-5">
          <SectionTitle title="Evidence by Type" icon={<ChartBarIcon className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} />
              <YAxis tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: 'rgba(245,158,11,0.08)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* pie */}
        <Card className="p-5">
          <SectionTitle title="Severity Distribution" icon={<ChartBarIcon className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={bySeverity}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {bySeverity.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
              <Legend wrapperStyle={{ color: AXIS, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* line */}
        <Card className="p-5">
          <SectionTitle title="Evidence Accumulation" icon={<ChartBarIcon className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="time" tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} />
              <YAxis tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Evidence"
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Temp °C"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* donut */}
        <Card className="p-5">
          <SectionTitle title="Custody Stage Breakdown" icon={<ChartBarIcon className="h-5 w-5" />} />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={byStage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {byStage.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
              <Legend wrapperStyle={{ color: AXIS, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* summary stats */}
      <Card className="p-5">
        <SectionTitle title="Quick Summary" icon={<ChartBarIcon className="h-5 w-5" />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total Items" value={evidence.length} />
          <Stat
            label="Fingerprint Matches"
            value={evidence.filter((e) => e.fingerprintMatch).length}
          />
          <Stat
            label="Avg Temperature"
            value={`${(evidence.reduce((s, e) => s + e.temperature, 0) / (evidence.length || 1)).toFixed(1)}°C`}
          />
          <Stat
            label="Critical Items"
            value={evidence.filter((e) => e.severity === 'Critical').length}
          />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="fx-cardalt fx-border rounded-xl p-4">
      <p className="text-2xl font-bold fx-primary tabular-nums">{value}</p>
      <p className="text-xs fx-muted mt-1">{label}</p>
    </div>
  );
}
