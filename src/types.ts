export type Role = 'Investigator' | 'Supervisor';

export interface User {
  name: string;
  badge: string;
  role: Role;
}

export type CaseStatus = 'Open' | 'Under Investigation' | 'Closed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CaseInfo {
  caseNumber: string;
  officerName: string;
  crimeType: string;
  priority: Priority;
  status: CaseStatus;
}

export type EvidenceStage =
  | 'Collected'
  | 'Logged'
  | 'Reviewed'
  | 'Transported'
  | 'Received'
  | 'Examined'
  | 'Verified'
  | 'Archived';

export type EvidenceType =
  | 'Weapon'
  | 'Fingerprint'
  | 'Biological'
  | 'Digital'
  | 'Footwear'
  | 'Document'
  | 'Vehicle'
  | 'Tool'
  | 'Other';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Condition = 'Pristine' | 'Good' | 'Damaged' | 'Compromised';

export interface Evidence {
  id: string;
  evidenceId: string;
  status?: string;
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
  photo: string; // data URL
  officer: string;
  timestamp: string; // ISO
  stage: EvidenceStage;
  battery: number;
  signal: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Suspect {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  linkedEvidence: string;
  risk: RiskLevel;
  notes: string;
  photo: string;
}

export type AuditAction =
  | 'Login'
  | 'Logout'
  | 'Evidence Added'
  | 'Evidence Updated'
  | 'Stage Advanced'
  | 'Suspect Added'
  | 'Suspect Updated'
  | 'Suspect Deleted'
  | 'Case Status Changed'
  | 'Case Updated'
  | 'Report Generated'
  | 'Demo Reset'
  | 'Backup Created'
  | 'Backup Restored';

export interface AuditEntry {
  id: string;
  timestamp: string;
  officer: string;
  action: AuditAction;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  kind: 'info' | 'success' | 'warning' | 'danger';
}

export type ThemeName = 'dark' | 'blue' | 'amber' | 'light';

export interface Toast {
  id: string;
  message: string;
  kind: 'success' | 'error' | 'info' | 'warning';
}

export interface TimelineEntry {
  id: string;
  time: string;
  evidenceType: EvidenceType;
  location: string;
  officer: string;
  stage: EvidenceStage;
  evidenceId: string;
}
