import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  ArchiveBoxIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import { useApp } from '@/context/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import {
  Field,
  TextInput,
  TextArea,
  Select,
} from '@/components/ui/Field';

import { Badge } from '@/components/ui/Badge';
import { EvidenceCard } from '@/components/EvidenceCard';

import {
  CONDITIONS,
  EVIDENCE_TYPES,
  SEVERITIES,
  STAGES,
} from '@/data/seed';

import type {
  Condition,
  EvidenceType,
  Severity,
  Evidence,
  EvidenceStage,
} from '@/types';

interface FormState {
  type: EvidenceType;
  location: string;
  description: string;
  notes: string;
  severity: Severity;
  fingerprintMatch: boolean;
  gps: string;
  humidity: number;
  temperature: number;
  rfid: string;
  weight: string;
  condition: Condition;
  photo: string;
}

interface BackendEvidence {
  _id?: string;
  id?: string;
  evidenceId?: string;
  caseId?: string;
  name?: string;
  type: string;
  description: string;
  collectedBy?: string;
  officer?: string;
  location: string;
  status?: string;
  filename?: string;
  filePath?: string;
  fileHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = 'https://valiant-creation-production-977b.up.railway.app/api/evidence';
const emptyForm: FormState = {
  type: 'Weapon',
  location: '',
  description: '',
  notes: '',
  severity: 'Medium',
  fingerprintMatch: false,
  gps: '',
  humidity: 45,
  temperature: 21,
  rfid: '',
  weight: '',
  condition: 'Good',
  photo: '',
};

type SortKey = 'newest' | 'oldest' | 'critical';

function convertBackendEvidence(
  item: BackendEvidence,
): Evidence {
  const stage = [
    'Collected',
    'Logged',
    'Reviewed',
    'Archived',
  ].includes(item.status || '')
    ? item.status as EvidenceStage
    : 'Collected';

  const timestamp =
    item.createdAt ||
    item.updatedAt ||
    new Date().toISOString();

  return {
    id: item.evidenceId || item.id || `EVD-${Date.now()}`,
    evidenceId: item.evidenceId || item.id || `EVD-${Date.now()}`,
    type: item.type as EvidenceType,

    location: item.location || 'Unknown',

    description: item.description || '',

    notes: '',

    severity: 'Medium',

    fingerprintMatch: false,

    gps: '',

    humidity: 45,

    temperature: 21,

    rfid: '',

    weight: '—',

    condition: 'Good',

    photo: '',

    officer:
      item.collectedBy ||
      item.officer ||
      'Investigator',

    timestamp,

    status: item.status || 'Collected',

    stage,

    battery: 100,

    signal: 100,
  } as Evidence;
}

export function Evidence() {
  const generateHash = async (evidenceId: string) => {
    try {
      const response = await fetch(
        `https://valiant-creation-production-977b.up.railway.app/api/evidence/${evidenceId}/hash`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Hash generation failed");
      }

      alert(`Hash generated successfully!\n\nSHA-256:\n${data.hash}`);
    } catch (error) {
      console.error("Hash generation error:", error);
      alert("Failed to generate hash. Check backend.");
    }
  };
  const {
    evidence,
    addEvidence,
    updateEvidence,
    advanceStage,
    hydrateEvidence,
    isReadOnly,
    caseInfo,
  } = useApp();

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] =
    useState('all');

  const [sevFilter, setSevFilter] =
    useState('all');

  const [stageFilter, setStageFilter] =
    useState('all');

  const [sort, setSort] =
    useState<SortKey>('newest');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [apiError, setApiError] =
    useState('');

  const update = (
    patch: Partial<FormState>,
  ) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  };

  /*
   * Load evidence from MongoDB.
   */
  useEffect(() => {
    let isCurrent = true;

    const loadEvidence = async () => {

      setLoading(true);
      setApiError('');

      try {

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        if (
          isCurrent &&
          data &&
          Array.isArray(data.evidence)
        ) {
          hydrateEvidence(
            data.evidence.map(
              (item: BackendEvidence) =>
                convertBackendEvidence(item)
            )
          );
        }

      } catch (error) {

        if (!isCurrent) {
          return;
        }

        console.error(
          'Failed to load evidence:',
          error
        );

        setApiError(
          'Could not connect to DetectiveX backend.'
        );

      } finally {

        if (isCurrent) {
          setLoading(false);
        }

      }

    };

    loadEvidence();

    return () => {
      isCurrent = false;
    };
  }, [hydrateEvidence]);

  /*
   * Photo upload.
   */
  const onPhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        photo:
          'Image must be under 1.5 MB.',
      }));

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      update({
        photo: reader.result as string,
      });

      setErrors((previous) => ({
        ...previous,
        photo: '',
      }));
    };

    reader.readAsDataURL(file);
  };

  /*
   * Validate form.
   */
  const validate = (): boolean => {
    const validationErrors: Record<
      string,
      string
    > = {};

    if (!form.location.trim()) {
      validationErrors.location =
        'Location is required.';
    } else if (
      form.location.trim().length < 3
    ) {
      validationErrors.location =
        'Location must be at least 3 characters.';
    }

    if (!form.description.trim()) {
      validationErrors.description =
        'Description is required.';
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  };

  /*
   * Submit evidence to MongoDB.
   */
  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!validate()) return;

    setSaving(true);
    setApiError('');

    const rfid =
      form.rfid.trim() ||
      `RF-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          caseId: 'CASE-001',

          name:
            `${form.type} Evidence`,

          type:
            form.type,

          description:
            form.description.trim(),

          collectedBy:
            caseInfo.officerName ||
            'Investigator',

          location:
            form.location.trim(),
        }),
      });

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          `Server returned ${response.status}`,
        );
      }

      const result =
        await response.json();

      console.log(
        'Evidence saved to MongoDB:',
        result,
      );
      if (result.evidence) {
        const backendEvidence = convertBackendEvidence(
          result.evidence
        );

        addEvidence({
          ...backendEvidence,
          notes: form.notes.trim(),
          severity: form.severity,
          fingerprintMatch: form.fingerprintMatch,
          gps: form.gps.trim(),
          humidity: form.humidity,
          temperature: form.temperature,
          rfid,
          weight: form.weight.trim() || '-',
          condition: form.condition,
          photo: form.photo,
          officer: caseInfo.officerName || 'Investigator',
        });
      }

      setForm(emptyForm);

      setErrors({});

      alert(
        'Evidence saved successfully to MongoDB.',
      );
    } catch (error) {
      console.error(
        'Error saving evidence:',
        error,
      );

      setApiError(
        'Failed to save evidence. Make sure the backend is running on port 5000.',
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * IMPORTANT:
   *
   * Investigator:
   * show only evidence collected by the
   * currently logged-in investigator.
   *
   * Supervisor:
   * isReadOnly === true
   * therefore show ALL evidence.
   */
  const visibleEvidence = useMemo(() => {
    if (isReadOnly) {
      return evidence;
    }

    const currentOfficer =
      caseInfo.officerName
        ?.trim()
        .toLowerCase();

    if (!currentOfficer) {
      return evidence;
    }

    return evidence.filter((item) => {
      const officer =
        item.officer
          ?.trim()
          .toLowerCase();

      return officer === currentOfficer;
    });
  }, [
    evidence,
    isReadOnly,
    caseInfo.officerName,
  ]);

  /*
   * Search / filter / sorting.
   */
  const filtered = useMemo(() => {
    let list = [
      ...visibleEvidence,
    ];

    const query =
      search.toLowerCase().trim();

    if (query) {
      list = list.filter(
        (item) =>
          item.id
            .toLowerCase()
            .includes(query) ||
          item.location
            .toLowerCase()
            .includes(query) ||
          item.notes
            .toLowerCase()
            .includes(query) ||
          item.officer
            .toLowerCase()
            .includes(query),
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter(
        (item) =>
          item.type === typeFilter,
      );
    }

    if (sevFilter !== 'all') {
      list = list.filter(
        (item) =>
          item.severity === sevFilter,
      );
    }

    if (stageFilter !== 'all') {
      list = list.filter(
        (item) =>
          item.stage === stageFilter,
      );
    }

    const severityRank = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
    };

    list.sort((a, b) => {
      if (sort === 'newest') {
        return (
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
        );
      }

      if (sort === 'oldest') {
        return (
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
        );
      }

      return (
        severityRank[a.severity] -
        severityRank[b.severity]
      );
    });

    return list;
  }, [
    visibleEvidence,
    search,
    typeFilter,
    sevFilter,
    stageFilter,
    sort,
  ]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSevFilter('all');
    setStageFilter('all');
    setSort('newest');
  };

  const activeFilters = [
    typeFilter,
    sevFilter,
    stageFilter,
  ].filter(
    (filter) => filter !== 'all',
  ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        <div>
          <h1 className="text-2xl font-bold fx-text tracking-tight">
            Evidence Intake
          </h1>

          <p className="text-sm fx-muted mt-1">
            Log, tag and track forensic evidence —
            {' '}
            {visibleEvidence.length}
            {' '}
            items on record
          </p>
        </div>

        <Badge
          tone="secondary"
          icon={
            <ArchiveBoxIcon className="h-3.5 w-3.5" />
          }
        >
          {filtered.length} shown
        </Badge>

      </div>

      {/* BACKEND STATUS */}
      {loading && (
        <Card className="p-4">
          <p className="text-sm fx-muted">
            Loading evidence from MongoDB...
          </p>
        </Card>
      )}

      {apiError && (
        <Card className="p-4 border border-forensic-danger">
          <p className="text-sm text-forensic-danger">
            {apiError}
          </p>
        </Card>
      )}

      {/* NEW EVIDENCE FORM */}
      <Card
        className="p-5"
        glass
      >

        <SectionTitle
          title="New Evidence Entry"
          subtitle="Evidence is saved to the DetectiveX backend and MongoDB."
          icon={
            <PlusCircleIcon className="h-5 w-5" />
          }
        />

        <form
          onSubmit={submit}
          className="space-y-5"
        >

          {/* TYPE / LOCATION / SEVERITY */}
          <div className="grid md:grid-cols-3 gap-4">

            <Field
              label="Evidence Type"
              required
            >
              <Select
                value={form.type}
                onChange={(e) =>
                  update({
                    type:
                      e.target.value as EvidenceType,
                  })
                }
              >
                {EVIDENCE_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            <Field
              label="Location"
              required
            >
              <TextInput
                value={form.location}
                onChange={(e) =>
                  update({
                    location:
                      e.target.value,
                  })
                }
                placeholder="e.g. Scene A — Living Room"
                className={
                  errors.location
                    ? '!border-forensic-danger'
                    : ''
                }
              />

              {errors.location && (
                <span className="text-[11px] text-forensic-danger mt-1 block">
                  {errors.location}
                </span>
              )}
            </Field>

            <Field label="Severity">
              <Select
                value={form.severity}
                onChange={(e) =>
                  update({
                    severity:
                      e.target.value as Severity,
                  })
                }
              >
                {SEVERITIES.map(
                  (severity) => (
                    <option
                      key={severity}
                      value={severity}
                    >
                      {severity}
                    </option>
                  ),
                )}
              </Select>
            </Field>

          </div>

          {/* DESCRIPTION / NOTES */}
          <div className="grid md:grid-cols-2 gap-4">

            <Field
              label="Description"
              required
            >
              <TextArea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  update({
                    description:
                      e.target.value,
                  })
                }
                placeholder="Brief description of the evidence..."
                className={
                  errors.description
                    ? '!border-forensic-danger'
                    : ''
                }
              />

              {errors.description && (
                <span className="text-[11px] text-forensic-danger mt-1 block">
                  {errors.description}
                </span>
              )}
            </Field>

            <Field label="Notes">
              <TextArea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  update({
                    notes:
                      e.target.value,
                  })
                }
                placeholder="Additional handling notes..."
              />
            </Field>

          </div>

          {/* SENSOR DATA */}
          <div className="grid md:grid-cols-4 gap-4">

            <Field label="GPS Coordinates">
              <TextInput
                value={form.gps}
                onChange={(e) =>
                  update({
                    gps:
                      e.target.value,
                  })
                }
                placeholder="17.3850, 78.4867"
              />
            </Field>

            <Field label="Temperature (°C)">
              <TextInput
                type="number"
                value={form.temperature}
                onChange={(e) =>
                  update({
                    temperature:
                      Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field label="Humidity (%)">
              <TextInput
                type="number"
                value={form.humidity}
                onChange={(e) =>
                  update({
                    humidity:
                      Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field label="RFID Tag">
              <TextInput
                value={form.rfid}
                onChange={(e) =>
                  update({
                    rfid:
                      e.target.value,
                  })
                }
                placeholder="Auto if empty"
              />
            </Field>

          </div>

          {/* ADDITIONAL INFORMATION */}
          <div className="grid md:grid-cols-4 gap-4">

            <Field label="Evidence Weight">
              <TextInput
                value={form.weight}
                onChange={(e) =>
                  update({
                    weight:
                      e.target.value,
                  })
                }
                placeholder="e.g. 910 g"
              />
            </Field>

            <Field label="Condition">
              <Select
                value={form.condition}
                onChange={(e) =>
                  update({
                    condition:
                      e.target.value as Condition,
                  })
                }
              >
                {CONDITIONS.map(
                  (condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            <Field label="Fingerprint Match">
              <label className="flex items-center gap-3 h-[42px] fx-cardalt fx-border rounded-xl px-3.5 cursor-pointer">

                <input
                  type="checkbox"
                  checked={
                    form.fingerprintMatch
                  }
                  onChange={(e) =>
                    update({
                      fingerprintMatch:
                        e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-forensic-primary"
                />

                <span className="text-sm fx-text">
                  Mark as matched
                </span>

              </label>
            </Field>

            <Field label="Photo Upload">
              <label className="flex items-center justify-center gap-2 h-[42px] fx-cardalt fx-border rounded-xl px-3.5 cursor-pointer hover:fx-primary transition">

                <PhotoIcon className="h-4 w-4" />

                <span className="text-sm fx-muted">
                  Choose file
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhoto}
                  className="hidden"
                />

              </label>

              {errors.photo && (
                <span className="text-[11px] text-forensic-danger mt-1 block">
                  {errors.photo}
                </span>
              )}
            </Field>

          </div>

          {/* PHOTO PREVIEW */}
          <AnimatePresence>

            {form.photo && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="fx-cardalt fx-border rounded-xl p-4 flex items-center gap-4"
              >

                <img
                  src={form.photo}
                  alt="Evidence preview"
                  className="h-20 w-20 rounded-lg object-cover fx-border"
                />

                <div className="flex-1">

                  <p className="text-sm font-medium fx-text flex items-center gap-1.5">

                    <CheckCircleIcon className="h-4 w-4 text-forensic-success" />

                    Live Preview

                  </p>

                  <p className="text-xs fx-muted">
                    Photo attached.
                  </p>

                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    update({
                      photo: '',
                    })
                  }
                  type="button"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Remove
                </Button>

              </motion.div>
            )}

          </AnimatePresence>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2">

            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setErrors({});
              }}
              disabled={saving}
            >
              <XMarkIcon className="h-4 w-4" />
              Clear
            </Button>

            <Button
              type="submit"
              disabled={
                isReadOnly ||
                saving
              }
            >
              <PlusCircleIcon className="h-4 w-4" />

              {saving
                ? 'Saving...'
                : 'Add Evidence'}
            </Button>

          </div>

        </form>

      </Card>

      {/* SEARCH / FILTER / SORT */}
      <Card className="p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <MagnifyingGlassIcon className="h-4 w-4 fx-muted absolute left-3 top-1/2 -translate-y-1/2" />

            <TextInput
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by Evidence ID, Location, Notes, Officer..."
              className="pl-9"
            />

          </div>

          <div className="flex gap-2 flex-wrap">

            <Select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value,
                )
              }
              className="!w-auto"
            >
              <option value="all">
                All Types
              </option>

              {EVIDENCE_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={sevFilter}
              onChange={(e) =>
                setSevFilter(
                  e.target.value,
                )
              }
              className="!w-auto"
            >
              <option value="all">
                All Severity
              </option>

              {SEVERITIES.map(
                (severity) => (
                  <option
                    key={severity}
                    value={severity}
                  >
                    {severity}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(
                  e.target.value,
                )
              }
              className="!w-auto"
            >
              <option value="all">
                All Stages
              </option>

              {STAGES.map(
                (stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as SortKey,
                )
              }
              className="!w-auto"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="critical">
                Critical First
              </option>
            </Select>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="md"
                onClick={clearFilters}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />

                Clear ({activeFilters})
              </Button>
            )}

          </div>

        </div>

      </Card>

      {/* EVIDENCE GRID */}

      {filtered.length === 0 ? (

        <Card className="p-12 text-center">

          <ArchiveBoxIcon className="h-12 w-12 fx-muted mx-auto mb-3" />

          <p className="fx-text font-medium">
            No evidence matches your filters
          </p>

          <p className="text-sm fx-muted mt-1">
            Try adjusting search or filter criteria.
          </p>

        </Card>

      ) : (

        <motion.div
          layout
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
        >

          <AnimatePresence mode="popLayout">

            {filtered.map((item) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
              />
            ))}

          </AnimatePresence>

        </motion.div>

      )}

    </div>
  );
}
