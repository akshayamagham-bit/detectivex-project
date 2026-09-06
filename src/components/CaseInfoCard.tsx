import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Field, TextInput, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { PRIORITIES, STATUSES, EVIDENCE_TYPES } from '@/data/seed';
import type { CaseStatus, Priority } from '@/types';

const statusTone = (s: CaseStatus) =>
  s === 'Closed' ? 'success' : s === 'Under Investigation' ? 'warning' : 'secondary';

export function CaseInfoCard({ compact = false }: { compact?: boolean }) {
  const { caseInfo, updateCase, setCaseStatus, isReadOnly } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(caseInfo);

  const startEdit = () => {
    setDraft(caseInfo);
    setEditing(true);
  };
  const save = () => {
    updateCase(draft);
    setEditing(false);
  };
  const cancel = () => setEditing(false);

  const crimeTypes = Array.from(new Set([...EVIDENCE_TYPES, 'Homicide', 'Burglary', 'Assault', 'Fraud', 'Arson', 'Cybercrime', 'Kidnapping']));

  return (
    <div className="fx-card fx-border rounded-2xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl fx-cardalt fx-border grid place-items-center fx-primary">
            <PencilSquareIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold fx-text uppercase tracking-wider">
              Case Information
            </h3>
            <p className="text-xs fx-muted">{caseInfo.caseNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(caseInfo.status)}>{caseInfo.status}</Badge>
          {!isReadOnly && !editing && (
            <Button size="sm" variant="ghost" onClick={startEdit}>
              <PencilSquareIcon className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Case Number">
                <TextInput
                  value={draft.caseNumber}
                  onChange={(e) => setDraft({ ...draft, caseNumber: e.target.value })}
                />
              </Field>
              <Field label="Officer Name">
                <TextInput
                  value={draft.officerName}
                  onChange={(e) => setDraft({ ...draft, officerName: e.target.value })}
                />
              </Field>
              <Field label="Crime Type">
                <Select
                  value={draft.crimeType}
                  onChange={(e) => setDraft({ ...draft, crimeType: e.target.value })}
                >
                  {crimeTypes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority">
                <Select
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as CaseStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancel}>
                <XMarkIcon className="h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={save}>
                <CheckIcon className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={compact ? 'space-y-3' : 'grid sm:grid-cols-2 gap-4'}
          >
            <InfoRow label="Case Number" value={caseInfo.caseNumber} />
            <InfoRow label="Lead Officer" value={caseInfo.officerName} />
            <InfoRow label="Crime Type" value={caseInfo.crimeType} />
            <InfoRow label="Priority" value={caseInfo.priority} />
            <div className="sm:col-span-2">
              <p className="text-[10px] fx-muted uppercase tracking-wider mb-1.5">Quick Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={isReadOnly}
                    onClick={() => setCaseStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      caseInfo.status === s
                        ? 'bg-forensic-primary/15 fx-primary border-forensic-primary/40'
                        : 'fx-cardalt fx-border fx-muted hover:fx-text'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] fx-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium fx-text">{value}</p>
    </div>
  );
}
