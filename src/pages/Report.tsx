import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { Badge, stageTone } from '@/components/ui/Badge';
import { fmtDateTime, fmtDate, fmtTime } from '@/lib/format';
import { motion } from 'framer-motion';

function makeReportId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RPT-${t}-${r}`;
}

export function Report() {
  const { caseInfo, evidence, suspects, audit, logAction, pushToast } = useApp();
  const navigate = useNavigate();
  const [reportId] = useState(makeReportId);
  const [signer, setSigner] = useState('');
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const stageCounts = useMemo(() => {
    return ['Collected', 'Logged', 'Reviewed', 'Archived'].map((s) => ({
      stage: s,
      count: evidence.filter((e) => e.stage === s).length,
    }));
  }, [evidence]);

  const handlePrint = () => {
    logAction('Report Generated', `${reportId} printed by ${signer || 'officer'}`);
    pushToast('Opening print dialog...', 'info');
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ['Evidence ID', 'Type', 'Location', 'Severity', 'Stage', 'Officer', 'Timestamp', 'GPS', 'RFID'],
      ...evidence.map((e) => [
        e.id,
        e.type,
        e.location,
        e.severity,
        e.stage,
        e.officer,
        e.timestamp,
        e.gps,
        e.rfid,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('CSV exported', 'success');
  };

  const saveAsPDF = () => {
    logAction('Report Generated', `${reportId} saved as PDF by ${signer || 'officer'}`);
    pushToast('Use your browser print dialog and choose "Save as PDF"', 'info');
    window.print();
  };

  const sign = (name: string) => {
    setSigner(name);
    if (name.trim().length > 1) {
      setSignedAt(new Date().toISOString());
    } else {
      setSignedAt(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold fx-text tracking-tight">Case Report</h1>
          <p className="text-sm fx-muted mt-1">
            Professional printable report — {reportId}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={exportCSV}>
            <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="secondary" onClick={saveAsPDF}>
            <DocumentArrowDownIcon className="h-4 w-4" /> Save as PDF
          </Button>
          <Button onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* ===== Printable Report ===== */}
      <div id="print-root" className="fx-card fx-border rounded-2xl p-8">
        {/* header */}
        <div className="flex items-start justify-between border-b-2 fx-border pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-forensic-primary/15 border border-forensic-primary/40 grid place-items-center">
              <FingerPrintIcon className="h-8 w-8 fx-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold fx-text tracking-tight">DetectiveX</h2>
              <p className="text-xs fx-muted uppercase tracking-[0.3em]">
                Forensic Investigation Report
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs fx-muted">Report ID</p>
            <p className="font-mono font-semibold fx-primary text-sm">{reportId}</p>
            <p className="text-xs fx-muted mt-2">Generated</p>
            <p className="text-xs fx-text font-mono">{fmtDateTime(new Date())}</p>
          </div>
        </div>

        {/* case information */}
        <Section
          title="Case Information"
          icon={<ShieldCheckIcon className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Info label="Case Number" value={caseInfo.caseNumber} />
            <Info label="Lead Officer" value={caseInfo.officerName} />
            <Info label="Crime Type" value={caseInfo.crimeType} />
            <Info label="Priority" value={caseInfo.priority} />
            <Info label="Status" value={caseInfo.status} />
          </div>
        </Section>

        {/* evidence table */}
        <Section title={`Evidence Table (${evidence.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border fx-border rounded-lg">
              <thead className="fx-cardalt">
                <tr className="text-left">
                  <th className="px-3 py-2 fx-muted uppercase">ID</th>
                  <th className="px-3 py-2 fx-muted uppercase">Type</th>
                  <th className="px-3 py-2 fx-muted uppercase">Location</th>
                  <th className="px-3 py-2 fx-muted uppercase">Severity</th>
                  <th className="px-3 py-2 fx-muted uppercase">Stage</th>
                  <th className="px-3 py-2 fx-muted uppercase">Officer</th>
                  <th className="px-3 py-2 fx-muted uppercase">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y fx-border">
                {evidence.map((e) => (
                  <tr key={e.id} className="hover:fx-cardalt">
                    <td className="px-3 py-2 font-mono fx-primary">{e.id}</td>
                    <td className="px-3 py-2 fx-text">{e.type}</td>
                    <td className="px-3 py-2 fx-text">{e.location}</td>
                    <td className="px-3 py-2 fx-text">{e.severity}</td>
                    <td className="px-3 py-2 fx-text">{e.stage}</td>
                    <td className="px-3 py-2 fx-text">{e.officer}</td>
                    <td className="px-3 py-2 fx-muted font-mono whitespace-nowrap">
                      {fmtDate(e.timestamp)} {fmtTime(e.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* timeline summary */}
        <Section title="Timeline Summary">
          <div className="space-y-2">
            {evidence
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 8)
              .map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 text-xs fx-cardalt fx-border rounded-lg px-3 py-2"
                >
                  <span className="font-mono fx-muted whitespace-nowrap">
                    {fmtDate(e.timestamp)} {fmtTime(e.timestamp)}
                  </span>
                  <span className="fx-primary font-mono">{e.id}</span>
                  <span className="fx-text">{e.type}</span>
                  <span className="fx-muted">— {e.location}</span>
                  <Badge tone={stageTone(e.stage)} className="!text-[9px] ml-auto">
                    {e.stage}
                  </Badge>
                </div>
              ))}
          </div>
        </Section>

        {/* suspects */}
        <Section title={`Suspects (${suspects.length})`}>
          <div className="grid sm:grid-cols-2 gap-3">
            {suspects.map((s) => (
              <div key={s.id} className="fx-cardalt fx-border rounded-lg p-3 text-xs">
                <div className="flex justify-between">
                  <span className="fx-text font-semibold">{s.name}</span>
                  <span className="font-mono fx-muted">{s.id}</span>
                </div>
                <p className="fx-muted mt-1">
                  {s.age} yrs · {s.gender} · Risk {s.risk}
                </p>
                {s.linkedEvidence && (
                  <p className="fx-primary mt-1">Linked: {s.linkedEvidence}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* analytics summary */}
        <Section title="Analytics Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div
              onClick={() => navigate('/evidence')}
              className="cursor-pointer transition-transform hover:scale-[1.02]"            >
              <Info label="Total Evidence" value={String(evidence.length)} />
            </div>

            <div
              onClick={() => navigate('/evidence')}
              className="cursor-pointer transition-transform hover:scale-[1.02]"            >
              <Info
                label="Fingerprint Matches"
                value={String(evidence.filter((e) => e.type === 'Fingerprint').length)}
              />
            </div>

            <div
              onClick={() => navigate('/suspects')}
              className="cursor-pointer transition-transform hover:scale-[1.02]"            >
              <Info label="Suspects" value={String(suspects.length)} />
            </div>

            <div
              onClick={() => navigate('/audit')}
              className="cursor-pointer transition-transform hover:scale-[1.02]"            >
              <Info label="Audit Events" value={String(audit.length)} />
            </div>
          </div>
        </Section>

        {/* digital signature */}
        <Section title="Digital Signature">
          <div className="no-print mb-4">
            <Field label="Type officer name to sign this report">
              <div className="relative">
                <PencilSquareIcon className="h-5 w-5 fx-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <TextInput
                  value={signer}
                  onChange={(e) => sign(e.target.value)}
                  placeholder="e.g. Det.Akshaya"
                  className="pl-10"
                />
              </div>
            </Field>
          </div>

          {signedAt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fx-cardalt fx-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-forensic-success/15 grid place-items-center text-forensic-success">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold fx-text">
                  Digitally signed by Officer {signer}
                </p>
                <p className="text-xs fx-muted font-mono">
                  {fmtDate(signedAt)} · {fmtTime(signedAt)}
                </p>
              </div>
            </motion.div>
          )}
        </Section>

        <div className="mt-8 pt-4 border-t fx-border text-center">
          <p className="text-[10px] fx-muted">
            This report was generated by DetectiveX Digital Evidence Management — {reportId}. Chain of
            custody maintained. Confidential.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold fx-text uppercase tracking-wider mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="fx-cardalt fx-border rounded-lg p-3">
      <p className="text-[10px] fx-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium fx-text mt-0.5">{value}</p>
    </div>
  );
}
