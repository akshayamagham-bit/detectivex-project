import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  UserIcon,
  ShieldExclamationIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, severityTone } from '@/components/ui/Badge';
import { Field, TextInput, TextArea, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { GENDERS, RISKS } from '@/data/seed';
import type { Gender, RiskLevel, Suspect } from '@/types';

const empty: Omit<Suspect, 'id'> = {
  name: '',
  age: 30,
  gender: 'Male',
  linkedEvidence: '',
  risk: 'Medium',
  notes: '',
  photo: '',
};

export function Suspects() {
  const { suspects, addSuspect, updateSuspect, deleteSuspect, evidence, isReadOnly } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Suspect, 'id'>>(empty);
  const [confirmDelete, setConfirmDelete] = useState<Suspect | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return suspects;
    return suspects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.linkedEvidence.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q),
    );
  }, [suspects, search]);

  const openAdd = () => {
    setForm(empty);
    setEditingId(null);
    setModalOpen(true);
  };
  const openEdit = (s: Suspect) => {
    setForm({ ...s });
    setEditingId(s.id);
    setModalOpen(true);
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editingId) updateSuspect(editingId, form);
    else addSuspect(form);
    setModalOpen(false);
  };

  const riskTone = (r: string) => {
    if (r === 'Extreme') return 'danger';
    if (r === 'High') return 'warning';
    if (r === 'Medium') return 'secondary';
    return 'muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold fx-text tracking-tight">Suspects</h1>
          <p className="text-sm fx-muted mt-1">
            Manage persons of interest — {suspects.length} on file
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={openAdd}>
            <PlusCircleIcon className="h-4 w-4" /> Add Suspect
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-4 w-4 fx-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suspects by name, linked evidence, or notes..."
            className="pl-9"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <UserGroupIcon className="h-12 w-12 fx-muted mx-auto mb-3" />
          <p className="fx-text font-medium">No suspects found</p>
          <p className="text-sm fx-muted mt-1">
            {search ? 'Try a different search.' : 'Add a suspect to begin.'}
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 h-full flex flex-col" whileHover={{ y: -3 }}>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl fx-cardalt fx-border overflow-hidden shrink-0 grid place-items-center">
                      {s.photo ? (
                        <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-8 w-8 fx-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs fx-muted">{s.id}</span>
                        <Badge tone={riskTone(s.risk) as 'danger'} className="!text-[10px]">
                          <ShieldExclamationIcon className="h-3 w-3" /> {s.risk}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold fx-text mt-1 truncate">{s.name}</h3>
                      <p className="text-xs fx-muted">
                        {s.age} yrs · {s.gender}
                      </p>
                    </div>
                  </div>

                  {s.linkedEvidence && (
                    <div className="mt-3 flex items-center gap-2 text-xs fx-muted">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Linked to{' '}
                      <span className="font-mono fx-primary font-medium">{s.linkedEvidence}</span>
                    </div>
                  )}

                  {s.notes && (
                    <p className="text-xs fx-text mt-3 leading-relaxed flex-1">{s.notes}</p>
                  )}

                  {!isReadOnly && (
                    <div className="flex gap-2 mt-4 pt-3 border-t fx-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(s)}
                      >
                        <PencilSquareIcon className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmDelete(s)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* add/edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Suspect' : 'Add Suspect'}
        subtitle={editingId ? `Updating ${editingId}` : 'Register a new person of interest'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name.trim()}>
              {editingId ? 'Save Changes' : 'Add Suspect'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl fx-cardalt fx-border overflow-hidden grid place-items-center shrink-0">
              {form.photo ? (
                <img src={form.photo} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <PhotoIcon className="h-8 w-8 fx-muted" />
              )}
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm fx-cardalt fx-border rounded-xl px-3.5 py-2 fx-muted hover:fx-primary transition">
                <PhotoIcon className="h-4 w-4" /> Upload Photo
              </span>
              <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Marcus Hale"
              />
            </Field>
            <Field label="Age">
              <TextInput
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: +e.target.value })}
              />
            </Field>
            <Field label="Gender">
              <Select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Risk Level">
              <Select
                value={form.risk}
                onChange={(e) => setForm({ ...form, risk: e.target.value as RiskLevel })}
              >
                {RISKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Linked Evidence ID">
            <Select
              value={form.linkedEvidence}
              onChange={(e) => setForm({ ...form, linkedEvidence: e.target.value })}
            >
              <option value="">— None —</option>
              {evidence.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.type}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Notes">
            <TextArea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Background, priors, observations..."
            />
          </Field>
        </div>
      </Modal>

      {/* delete confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Suspect"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDelete) deleteSuspect(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              <TrashIcon className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm fx-text">
          Remove <span className="font-semibold">{confirmDelete?.name}</span> ({confirmDelete?.id})
          from the suspect list? This action is logged in the audit trail.
        </p>
      </Modal>
    </div>
  );
}
