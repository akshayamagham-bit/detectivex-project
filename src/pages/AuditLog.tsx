import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextInput, Select } from '@/components/ui/Field';
import { fmtDateTime } from '@/lib/format';
import type { AuditAction } from '@/types';

const actionTone = (a: AuditAction) => {
  if (a.includes('Added')) return 'success';
  if (a.includes('Deleted')) return 'danger';
  if (a.includes('Status') || a.includes('Updated') || a.includes('Advanced')) return 'warning';
  if (a === 'Login') return 'secondary';
  if (a === 'Logout') return 'muted';
  return 'primary';
};

export function AuditLog() {
  const { audit } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const actions = useMemo(
    () => Array.from(new Set(audit.map((a) => a.action))),
    [audit],
  );

  const filtered = useMemo(() => {
    let list = [...audit];
    const q = search.toLowerCase().trim();
    if (q)
      list = list.filter(
        (a) =>
          a.officer.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q),
      );
    if (actionFilter !== 'all') list = list.filter((a) => a.action === actionFilter);
    return list;
  }, [audit, search, actionFilter]);

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Officer', 'Action', 'Details'],
      ...audit.map((a) => [a.timestamp, a.officer, a.action, a.details]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold fx-text tracking-tight">Audit Log</h1>
          <p className="text-sm fx-muted mt-1">
            Immutable record of every action — {audit.length} events
          </p>
        </div>
        <Button variant="secondary" onClick={exportCSV}>
          <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="p-4 border-forensic-warning/30">
        <div className="flex items-center gap-3">
          <LockClosedIcon className="h-5 w-5 text-forensic-warning shrink-0" />
          <p className="text-sm fx-muted">
            Audit entries are system-generated and cannot be edited or deleted manually.
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-4 w-4 fx-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by officer, action, or details..."
              className="pl-9"
            />
          </div>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="sm:!w-56"
          >
            <option value="all">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="fx-cardalt fx-border-b">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium fx-muted text-xs uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 font-medium fx-muted text-xs uppercase tracking-wider">Officer</th>
                <th className="px-4 py-3 font-medium fx-muted text-xs uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 font-medium fx-muted text-xs uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y fx-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center fx-muted">
                    <DocumentTextIcon className="h-10 w-10 mx-auto mb-2" />
                    No audit entries match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="hover:fx-cardalt transition"
                  >
                    <td className="px-4 py-3 fx-muted font-mono text-xs whitespace-nowrap">
                      {fmtDateTime(new Date(a.timestamp))}
                    </td>
                    <td className="px-4 py-3 fx-text whitespace-nowrap">{a.officer}</td>
                    <td className="px-4 py-3">
                      <Badge tone={actionTone(a.action) as 'success'} className="!text-[10px]">
                        {a.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 fx-text">{a.details}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
