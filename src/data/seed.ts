import type {
  AuditEntry,
  CaseInfo,
  Evidence,
  EvidenceType,
  Notification,
  Suspect,
  TimelineEntry,
  User,
} from '../types';

export const DEMO_CASE: CaseInfo = {
  caseNumber: 'CASE-2026-0417',
  officerName: 'Det. Akshaya',
  crimeType: 'Homicide',
  priority: 'Critical',
  status: 'Under Investigation',
};

export const DEMO_USER: User = {
  name: 'Det. Akshaya',
  badge: 'BX-7741',
  role: 'Investigator',
};

const now = Date.now();

const iso = (minsAgo: number) =>
  new Date(now - minsAgo * 60000).toISOString();

export const DEMO_EVIDENCE: Evidence[] = [
  {
    id: 'E001',
    evidenceId: 'E001',
    type: 'Weapon',
    location: 'Scene A — Living Room',
    description: '9mm pistol recovered beneath sofa cushion.',
    notes: 'Safety engaged. Magazine removed separately.',
    severity: 'Critical',
    fingerprintMatch: true,
    gps: '40.7128° N, 74.0060° W',
    humidity: 42,
    temperature: 21.5,
    rfid: 'RF-A91-0023',
    weight: '910 g',
    condition: 'Good',
    photo: '',
    officer: 'Det. Akshaya',
    timestamp: iso(180),
    stage: 'Reviewed',
    battery: 88,
    signal: 76,
  },

  {
    id: 'E002',
    evidenceId: 'E002',
    type: 'Fingerprint',
    location: 'Scene A — Rear Door Handle',
    description: 'Latent print lifted from brass handle.',
    notes: 'Matched against AFIS — 94% confidence.',
    severity: 'High',
    fingerprintMatch: true,
    gps: '40.7130° N, 74.0058° W',
    humidity: 38,
    temperature: 20.1,
    rfid: 'RF-A91-0024',
    weight: '2 g',
    condition: 'Pristine',
    photo: '',
    officer: 'Det. Akshaya',
    timestamp: iso(150),
    stage: 'Logged',
    battery: 91,
    signal: 82,
  },

  {
    id: 'E003',
    evidenceId: 'E003',
    type: 'Biological',
    location: 'Scene B — Kitchen Floor',
    description: 'Bloodstain sample, approx 12cm diameter.',
    notes: 'Stored in sterile tube, refrigerated.',
    severity: 'Critical',
    fingerprintMatch: false,
    gps: '40.7125° N, 74.0065° W',
    humidity: 51,
    temperature: 18.2,
    rfid: 'RF-A91-0025',
    weight: '15 g',
    condition: 'Good',
    photo: '',
    officer: 'Det. Rohan',
    timestamp: iso(90),
    stage: 'Collected',
    battery: 64,
    signal: 58,
  },

  {
    id: 'E004',
    evidenceId: 'E004',
    type: 'Digital',
    location: 'Scene A — Bedroom Desk',
    description: 'Android phone, screen locked.',
    notes: 'Bagged in Faraday enclosure.',
    severity: 'High',
    fingerprintMatch: false,
    gps: '40.7128° N, 74.0060° W',
    humidity: 40,
    temperature: 22.0,
    rfid: 'RF-A91-0026',
    weight: '210 g',
    condition: 'Pristine',
    photo: '',
    officer: 'Det. Rohan',
    timestamp: iso(45),
    stage: 'Collected',
    battery: 73,
    signal: 44,
  },
];

export const DEMO_SUSPECTS: Suspect[] = [
  {
    id: 'S001',
    name: 'Marcus Hale',
    age: 34,
    gender: 'Male',
    linkedEvidence: 'E001',
    risk: 'Extreme',
    notes: 'Prior weapons charge. Fingerprints on E001.',
    photo: '',
  },

  {
    id: 'S002',
    name: 'Elena Voss',
    age: 29,
    gender: 'Female',
    linkedEvidence: 'E002',
    risk: 'High',
    notes: 'Phone records place her at scene 21:40.',
    photo: '',
  },
];

export const DEMO_AUDIT: AuditEntry[] = [
  {
    id: 'A1',
    timestamp: iso(200),
    officer: 'Det. Akshaya',
    action: 'Login',
    details: 'Investigator signed in from terminal FX-07',
  },

  {
    id: 'A2',
    timestamp: iso(180),
    officer: 'Det. Akshaya',
    action: 'Evidence Added',
    details: 'E001 — Weapon recovered at Scene A',
  },

  {
    id: 'A3',
    timestamp: iso(150),
    officer: 'Det. Rohan',
    action: 'Evidence Added',
    details: 'E002 — Fingerprint lifted at Scene A',
  },

  {
    id: 'A4',
    timestamp: iso(90),
    officer: 'Det. Rohan',
    action: 'Evidence Added',
    details: 'E003 — Biological sample at Scene B',
  },

  {
    id: 'A5',
    timestamp: iso(45),
    officer: 'Lt. Keerthana',
    action: 'Supervisor Review',
    details: 'E004 — Digital evidence reviewed by supervisor',
  },

  {
    id: 'A6',
    timestamp: iso(30),
    officer: 'Lt. Manash',
    action: 'Supervisor Review',
    details: 'Case activity reviewed by supervisor',
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'N1',
    title: 'Fingerprint Match',
    body: 'AFIS returned a 94% match for evidence E002.',
    timestamp: iso(120),
    read: false,
    kind: 'success',
  },

  {
    id: 'N2',
    title: 'Sensor Alert',
    body: 'E003 humidity exceeded 50% — verify storage.',
    timestamp: iso(60),
    read: false,
    kind: 'warning',
  },

  {
    id: 'N3',
    title: 'Chain of Custody',
    body: 'E001 advanced to Reviewed stage.',
    timestamp: iso(30),
    read: false,
    kind: 'info',
  },
];

export const DEMO_TIMELINE: TimelineEntry[] = [];

export const EVIDENCE_TYPES: EvidenceType[] = [
  'Weapon',
  'Fingerprint',
  'Biological',
  'Digital',
  'Footwear',
  'Document',
  'Vehicle',
  'Tool',
  'Other',
];

export const SEVERITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

export const CONDITIONS = [
  'Pristine',
  'Good',
  'Damaged',
  'Compromised',
] as const;

export const STAGES = [
  'Collected',
  'Logged',
  'Reviewed',
  'Archived',
] as const;

export const PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

export const STATUSES = [
  'Open',
  'Under Investigation',
  'Closed',
] as const;

export const RISKS = [
  'Low',
  'Medium',
  'High',
  'Extreme',
] as const;

export const GENDERS = [
  'Male',
  'Female',
  'Other',
] as const;

export const THEMES = [
  { id: 'dark', name: 'Dark Forensic' },
  { id: 'blue', name: 'Blue Police' },
  { id: 'amber', name: 'Amber Evidence' },
  { id: 'light', name: 'Light' },
] as const;
