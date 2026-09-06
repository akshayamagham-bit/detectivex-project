import { motion } from 'framer-motion';
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge, stageTone } from '@/components/ui/Badge';
import { fmtTime, fmtDate } from '@/lib/format';

const typeEmoji: Record<string, string> = {
  Weapon: 'WPN',
  Fingerprint: 'FP',
  Biological: 'BIO',
  Digital: 'DGT',
  Footwear: 'FTW',
  Document: 'DOC',
  Vehicle: 'VEH',
  Tool: 'TOL',
  Other: 'OTH',
};

export function Timeline() {
  const { timeline } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold fx-text tracking-tight">Case Timeline</h1>
        <p className="text-sm fx-muted mt-1">
          Automatically generated from evidence intake — {timeline.length} events
        </p>
      </div>

      <Card className="p-5">
        <SectionTitle
          title="Chronological Evidence Trail"
          subtitle="Newest first — updates live as evidence is added or stages advance"
          icon={<ClockIcon className="h-5 w-5" />}
        />

        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 fx-muted mx-auto mb-3" />
            <p className="fx-text font-medium">No timeline events yet</p>
            <p className="text-sm fx-muted mt-1">Add evidence to populate the timeline.</p>
          </div>
        ) : (
          <div className="relative pl-8">
            {/* vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-forensic-primary via-forensic-secondary to-forensic-primary/20" />

            <div className="space-y-5">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  {/* node */}
                  <div className="absolute -left-[1.35rem] top-1 h-6 w-6 rounded-full bg-forensic-primary/15 border-2 border-forensic-primary grid place-items-center">
                    <span className="text-[9px] font-bold fx-primary font-mono">
                      {typeEmoji[t.evidenceType] ?? 'EV'}
                    </span>
                  </div>

                  <div className="fx-cardalt fx-border rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold fx-primary">
                          {t.evidenceId}
                        </span>
                        <span className="text-sm fx-text font-medium">{t.evidenceType}</span>
                      </div>
                      <Badge tone={stageTone(t.stage)} className="!text-[10px]">
                        {t.stage}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      <span className="fx-muted flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {fmtDate(t.time)} · {fmtTime(t.time)}
                      </span>
                      <span className="fx-muted flex items-center gap-1.5">
                        <MapPinIcon className="h-3.5 w-3.5" /> {t.location}
                      </span>
                      <span className="fx-muted flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" /> {t.officer}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* summary footer */}
      {timeline.length > 0 && (
        <Card className="p-5">
          <SectionTitle
            title="Stage Distribution"
            subtitle="Evidence spread across custody stages"
            icon={<ArchiveBoxIcon className="h-5 w-5" />}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Collected', 'Logged', 'Reviewed', 'Archived'] as const).map((stage) => {
              const count = timeline.filter((t) => t.stage === stage).length;
              return (
                <div key={stage} className="fx-cardalt fx-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold fx-primary tabular-nums">{count}</p>
                  <p className="text-xs fx-muted mt-1">{stage}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
