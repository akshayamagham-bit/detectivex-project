import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { socket } from '../lib/socket';

import type {
  AuditAction,
  AuditEntry,
  CaseInfo,
  CaseStatus,
  Evidence,
  EvidenceStage,
  Notification,
  Suspect,
  ThemeName,
  TimelineEntry,
  Toast,
  User,

} from '../types';

import {
  DEMO_AUDIT,
  DEMO_CASE,
  DEMO_EVIDENCE,
  DEMO_NOTIFICATIONS,
  DEMO_SUSPECTS,
} from '../data/seed';

interface AppContextValue {
  // auth
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isReadOnly: boolean;

  // case
  caseInfo: CaseInfo;
  updateCase: (patch: Partial<CaseInfo>) => void;
  setCaseStatus: (status: CaseStatus) => void;

  // evidence
  evidence: Evidence[];
  addEvidence: (
    e: Omit<
      Evidence,
      'id' | 'timestamp' | 'stage' | 'battery' | 'signal'
    >
  ) => void;
  advanceStage: (id: string) => void;
  updateEvidence: (id: string, patch: Partial<Evidence>) => void;

  // suspects
  suspects: Suspect[];
  addSuspect: (s: Omit<Suspect, 'id'>) => void;
  updateSuspect: (id: string, patch: Partial<Suspect>) => void;
  deleteSuspect: (id: string) => void;

  // audit
  audit: AuditEntry[];
  logAction: (action: AuditAction, details: string) => void;

  // notifications
  notifications: Notification[];
  markAllRead: () => void;
  pushNotification: (
    n: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;

  // timeline
  timeline: TimelineEntry[];

  // theme + settings
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;

  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;

  demoSensorMode: boolean;
  setDemoSensorMode: (v: boolean) => void;

  resetDemoData: () => void;

  // backup
  createBackup: () => void;
  restoreBackup: () => void;

  // toasts
  toasts: Toast[];
  pushToast: (
    message: string,
    kind?: Toast['kind']
  ) => void;
  dismissToast: (id: string) => void;
}

const AppContext =
  createContext<AppContextValue | null>(null);

let counter = 1000;

const nextId = (prefix: string) =>
  `${prefix}${++counter}`;

function buildTimeline(
  evidence: Evidence[]
): TimelineEntry[] {
  return [...evidence]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )
    .map((e) => ({
      id: `TL-${e.id}`,
      time: e.timestamp,
      evidenceType: e.type,
      location: e.location,
      officer: e.officer,
      stage: e.stage,
      evidenceId: e.id,
    }));
}

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [caseInfo, setCaseInfo] =
    useState<CaseInfo>(DEMO_CASE);

  const [evidence, setEvidence] =
    useState<Evidence[]>(DEMO_EVIDENCE);

  const [suspects, setSuspects] =
    useState<Suspect[]>(DEMO_SUSPECTS);

  const [audit, setAudit] =
    useState<AuditEntry[]>(DEMO_AUDIT);

  const [notifications, setNotifications] =
    useState<Notification[]>(DEMO_NOTIFICATIONS);

  const [timeline, setTimeline] =
    useState<TimelineEntry[]>(
      () => buildTimeline(DEMO_EVIDENCE)
    );

  const [theme, setThemeState] =
    useState<ThemeName>('dark');

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [
    demoSensorMode,
    setDemoSensorMode,
  ] = useState(false);

  const [toasts, setToasts] =
    useState<Toast[]>([]);

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    );
  }, [theme]);

  // --------------------------------------------------
  // SOCKET.IO
  // --------------------------------------------------

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        'DetectiveX frontend connected:',
        socket.id
      );
    };

    const handleDisconnect = () => {
      console.log(
        'DetectiveX frontend disconnected'
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off(
        'disconnect',
        handleDisconnect
      );
    };
  }, []);

  // --------------------------------------------------
  // DEMO SENSOR MODE
  // --------------------------------------------------

  const sensorTimer =
    useRef<number | null>(null);

  useEffect(() => {
    if (sensorTimer.current) {
      clearInterval(sensorTimer.current);
      sensorTimer.current = null;
    }

    if (!demoSensorMode) {
      return;
    }

    sensorTimer.current = window.setInterval(() => {
      setEvidence((prev) =>
        prev.map((e) => ({
          ...e,

          temperature: +(
            e.temperature +
            (Math.random() - 0.5) * 0.6
          ).toFixed(1),

          humidity: Math.max(
            10,
            Math.min(
              95,
              Math.round(
                e.humidity +
                (Math.random() - 0.5) * 3
              )
            )
          ),

          battery: Math.max(
            0,
            Math.min(
              100,
              Math.round(
                e.battery +
                (Math.random() - 0.5) * 2
              )
            )
          ),

          signal: Math.max(
            0,
            Math.min(
              100,
              Math.round(
                e.signal +
                (Math.random() - 0.5) * 4
              )
            )
          ),
        }))
      );
    }, 3000);

    return () => {
      if (sensorTimer.current) {
        clearInterval(sensorTimer.current);
        sensorTimer.current = null;
      }
    };
  }, [demoSensorMode]);

  // --------------------------------------------------
  // TOASTS
  // --------------------------------------------------

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((t) =>
        t.filter((x) => x.id !== id)
      );
    },
    []
  );

  const pushToast = useCallback(
    (
      message: string,
      kind: Toast['kind'] = 'success'
    ) => {
      const id = nextId('T');

      setToasts((t) => [
        ...t,
        {
          id,
          message,
          kind,
        },
      ]);

      window.setTimeout(() => {
        setToasts((t) =>
          t.filter((x) => x.id !== id)
        );
      }, 3200);
    },
    []
  );

  // --------------------------------------------------
  // AUDIT
  // --------------------------------------------------

  const logAction = useCallback(
    (
      action: AuditAction,
      details: string
    ) => {
      setAudit((a) => [
        {
          id: nextId('A'),
          timestamp:
            new Date().toISOString(),
          officer: 'Det. Akshaya',
          action,
          details,
        },
        ...a,
      ]);
    },
    []
  );

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  const pushNotificationInternal =
    useCallback(
      (
        n: Omit<
          Notification,
          'id' | 'timestamp' | 'read'
        >
      ) => {
        if (!notificationsEnabled) {
          return;
        }

        setNotifications((list) => [
          {
            id: nextId('N'),
            timestamp:
              new Date().toISOString(),
            read: false,
            ...n,
          },
          ...list,
        ]);
      },
      [notificationsEnabled]
    );

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const login = useCallback(
    (u: User) => {
      setUser(u);

      setAudit((a) => [
        {
          id: nextId('A'),
          timestamp:
            new Date().toISOString(),
          officer: u.name,
          action: 'Login',
          details: `${u.role} signed in — Badge ${u.badge}`,
        },
        ...a,
      ]);

      pushToast(
        `Welcome, ${u.name}`,
        'success'
      );
    },
    [pushToast]
  );

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = useCallback(() => {
    if (user) {
      setAudit((a) => [
        {
          id: nextId('A'),
          timestamp:
            new Date().toISOString(),
          officer: user.name,
          action: 'Logout',
          details: `${user.role} signed out`,
        },
        ...a,
      ]);
    }

    setUser(null);

    pushToast(
      'Signed out successfully',
      'info'
    );
  }, [pushToast, user]);

  // --------------------------------------------------
  // CASE
  // --------------------------------------------------

  const updateCase = useCallback(
    (patch: Partial<CaseInfo>) => {
      setCaseInfo((c) => ({
        ...c,
        ...patch,
      }));

      logAction(
        'Case Updated',
        `Case fields updated: ${Object.keys(
          patch
        ).join(', ')}`
      );

      pushToast(
        'Case information updated',
        'success'
      );
    },
    [logAction, pushToast]
  );

  const setCaseStatus = useCallback(
    (status: CaseStatus) => {
      setCaseInfo((c) => ({
        ...c,
        status,
      }));

      logAction(
        'Case Status Changed',
        `Status set to "${status}"`
      );

      pushNotificationInternal({
        title: 'Case Status Updated',
        body: `${caseInfo.caseNumber} is now "${status}"`,
        kind:
          status === 'Closed'
            ? 'warning'
            : 'info',
      });

      pushToast(
        `Case status changed to ${status}`,
        'success'
      );
    },
    [
      caseInfo.caseNumber,
      logAction,
      pushNotificationInternal,
      pushToast,
    ]
  );

  // --------------------------------------------------
  // EVIDENCE
  // --------------------------------------------------

  const addEvidence = useCallback(
    (
      e: Omit<
        Evidence,
        'id' |
        'timestamp' |
        'stage' |
        'battery' |
        'signal'
      >
    ) => {
      const nums = evidence
        .map((x) =>
          parseInt(
            x.id.replace(/\D/g, ''),
            10
          )
        )
        .filter(
          (n) => !Number.isNaN(n)
        );

      const nextNum =
        (nums.length
          ? Math.max(...nums)
          : 0) + 1;

      const id = `E${String(
        nextNum
      ).padStart(3, '0')}`;

      const full: Evidence = {
        ...e,

        id,

        timestamp:
          new Date().toISOString(),

        stage: 'Collected',

        battery: Math.round(
          70 + Math.random() * 25
        ),

        signal: Math.round(
          55 + Math.random() * 40
        ),
      };

      setEvidence((prev) => {
        if (
          prev.some(
            (item) =>
              item.id === full.id
          )
        ) {
          return prev;
        }

        return [full, ...prev];
      });

      setTimeline(
        buildTimeline([
          full,
          ...evidence,
        ])
      );

      logAction(
        'Evidence Added',
        `${id} — ${e.type} at ${e.location}`
      );

      pushNotificationInternal({
        title: 'New Evidence Logged',
        body: `${id} (${e.type}) added by ${e.officer}`,
        kind: 'success',
      });

      pushToast(
        `Evidence ${id} added`,
        'success'
      );
    },
    [
      evidence,
      logAction,
      pushNotificationInternal,
      pushToast,
    ]
  );

  // --------------------------------------------------
  // ADVANCE EVIDENCE STAGE
  // --------------------------------------------------

  const advanceStage = useCallback(
    (id: string) => {
      const order: EvidenceStage[] = [
        'Collected',
        'Transported',
        'Received',
        'Examined',
        'Verified',
        'Archived',
      ];

      setEvidence((prev) =>
        prev.map((e) => {
          if (e.id !== id) {
            return e;
          }

          const idx =
            order.indexOf(e.stage);

          const next =
            order[
            Math.min(
              idx + 1,
              order.length - 1
            )
            ];

          if (next !== e.stage) {
            logAction(
              'Stage Advanced',
              `${id} advanced from ${e.stage} to ${next}`
            );

            pushNotificationInternal({
              title: 'Chain of Custody',
              body: `${id} advanced to ${next}`,
              kind: 'info',
            });
          }

          return {
            ...e,
            stage: next,
          };
        })
      );

      pushToast(
        `${id} stage advanced`,
        'success'
      );
    },
    [
      logAction,
      pushNotificationInternal,
      pushToast,
    ]
  );

  // --------------------------------------------------
  // UPDATE EVIDENCE
  // --------------------------------------------------

  const updateEvidence = useCallback(
    (
      id: string,
      patch: Partial<Evidence>
    ) => {
      setEvidence((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
              ...e,
              ...patch,
            }
            : e
        )
      );

      logAction(
        'Evidence Updated',
        `${id} updated (${Object.keys(
          patch
        ).join(', ')})`
      );

      pushToast(
        `${id} updated`,
        'success'
      );
    },
    [logAction, pushToast]
  );

  // --------------------------------------------------
  // SUSPECTS
  // --------------------------------------------------

  const addSuspect = useCallback(
    (s: Omit<Suspect, 'id'>) => {
      const nums = suspects
        .map((x) =>
          parseInt(
            x.id.replace(/\D/g, ''),
            10
          )
        )
        .filter(
          (n) => !Number.isNaN(n)
        );

      const nextNum =
        (nums.length
          ? Math.max(...nums)
          : 0) + 1;

      const id = `S${String(
        nextNum
      ).padStart(3, '0')}`;

      const full: Suspect = {
        ...s,
        id,
      };

      setSuspects((prev) => [
        full,
        ...prev,
      ]);

      logAction(
        'Suspect Added',
        `${id} — ${s.name} (risk ${s.risk})`
      );

      pushToast(
        `Suspect ${s.name} added`,
        'success'
      );
    },
    [logAction, pushToast, suspects]
  );

  const updateSuspect = useCallback(
    (
      id: string,
      patch: Partial<Suspect>
    ) => {
      setSuspects((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
              ...s,
              ...patch,
            }
            : s
        )
      );

      logAction(
        'Suspect Updated',
        `${id} updated (${Object.keys(
          patch
        ).join(', ')})`
      );

      pushToast(
        `Suspect ${id} updated`,
        'success'
      );
    },
    [logAction, pushToast]
  );

  const deleteSuspect = useCallback(
    (id: string) => {
      setSuspects((prev) =>
        prev.filter(
          (s) => s.id !== id
        )
      );

      logAction(
        'Suspect Deleted',
        `${id} removed from suspect list`
      );

      pushToast(
        `Suspect ${id} removed`,
        'info'
      );
    },
    [logAction, pushToast]
  );

  // --------------------------------------------------
  // NOTIFICATION READ
  // --------------------------------------------------

  const markAllRead = useCallback(
    () => {
      setNotifications((list) =>
        list.map((n) => ({
          ...n,
          read: true,
        }))
      );
    },
    []
  );

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  const setTheme = useCallback(
    (t: ThemeName) => {
      setThemeState(t);

      pushToast(
        `Theme changed to ${t}`,
        'info'
      );
    },
    [pushToast]
  );

  // --------------------------------------------------
  // CREATE BACKUP
  // --------------------------------------------------

  const createBackup = useCallback(() => {
    const backup = {
      version: 1,

      createdAt:
        new Date().toISOString(),

      caseInfo,
      evidence,
      suspects,
      audit,
      notifications,

      theme,
      notificationsEnabled,
      demoSensorMode,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        ),
      ],
      {
        type: 'application/json',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `DetectiveX_Backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    pushToast(
      'Backup created successfully',
      'success'
    );
  }, [
    caseInfo,
    evidence,
    suspects,
    audit,
    notifications,
    theme,
    notificationsEnabled,
    demoSensorMode,
    pushToast,
  ]);

  // --------------------------------------------------
  // RESTORE BACKUP
  // --------------------------------------------------

  const restoreBackup = useCallback(() => {
    const input =
      document.createElement('input');

    input.type = 'file';

    input.accept =
      '.json,application/json';

    input.onchange = async () => {
      const file =
        input.files?.[0];

      if (!file) {
        return;
      }

      try {
        const text =
          await file.text();

        const backup =
          JSON.parse(text);

        if (
          !backup.caseInfo ||
          !backup.evidence
        ) {
          throw new Error(
            'Invalid DetectiveX backup file'
          );
        }

        setCaseInfo(
          backup.caseInfo
        );

        setEvidence(
          backup.evidence
        );

        setSuspects(
          backup.suspects ?? []
        );

        setAudit(
          backup.audit ?? []
        );

        setNotifications(
          backup.notifications ?? []
        );

        setTimeline(
          buildTimeline(
            backup.evidence
          )
        );

        if (backup.theme) {
          setThemeState(
            backup.theme
          );
        }

        if (
          typeof backup.notificationsEnabled ===
          'boolean'
        ) {
          setNotificationsEnabled(
            backup.notificationsEnabled
          );
        }

        if (
          typeof backup.demoSensorMode ===
          'boolean'
        ) {
          setDemoSensorMode(
            backup.demoSensorMode
          );
        }

        pushToast(
          'Backup restored successfully',
          'success'
        );
      } catch (error) {
        console.error(
          'Backup restore failed:',
          error
        );

        pushToast(
          'Invalid or corrupted backup file',
          'error'
        );
      }
    };

    input.click();
  }, [pushToast]);

  // --------------------------------------------------
  // RESET DEMO DATA
  // --------------------------------------------------

  const resetDemoData = useCallback(
    () => {
      setCaseInfo(DEMO_CASE);

      setEvidence(DEMO_EVIDENCE);

      setSuspects(DEMO_SUSPECTS);

      setAudit(DEMO_AUDIT);

      setNotifications(
        DEMO_NOTIFICATIONS
      );

      setTimeline(
        buildTimeline(
          DEMO_EVIDENCE
        )
      );

      logAction(
        'Demo Reset',
        'All demo data restored to defaults'
      );

      pushToast(
        'Demo data reset',
        'warning'
      );
    },
    [logAction, pushToast]
  );

  // --------------------------------------------------
  // KEEP TIMELINE IN SYNC
  // --------------------------------------------------

  useEffect(() => {
    setTimeline(
      buildTimeline(evidence)
    );
  }, [evidence]);

  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------

  const value =
    useMemo<AppContextValue>(
      () => ({
        // auth
        user,
        login,
        logout,
        isReadOnly:
          user?.role === 'Supervisor',

        // case
        caseInfo,
        updateCase,
        setCaseStatus,

        // evidence
        evidence,
        addEvidence,
        advanceStage,
        updateEvidence,

        // suspects
        suspects,
        addSuspect,
        updateSuspect,
        deleteSuspect,

        // audit
        audit,
        logAction,

        // notifications
        notifications,
        markAllRead,
        pushNotification:
          pushNotificationInternal,

        // timeline
        timeline,

        // settings
        theme,
        setTheme,

        notificationsEnabled,
        setNotificationsEnabled,

        demoSensorMode,
        setDemoSensorMode,

        resetDemoData,

        // backup
        createBackup,
        restoreBackup,

        // toasts
        toasts,
        pushToast,
        dismissToast,
      }),
      [
        user,
        login,
        logout,

        caseInfo,
        updateCase,
        setCaseStatus,

        evidence,
        addEvidence,
        advanceStage,
        updateEvidence,

        suspects,
        addSuspect,
        updateSuspect,
        deleteSuspect,

        audit,
        logAction,

        notifications,
        markAllRead,
        pushNotificationInternal,

        timeline,

        theme,
        setTheme,

        notificationsEnabled,

        demoSensorMode,

        resetDemoData,

        createBackup,
        restoreBackup,

        toasts,
        pushToast,
        dismissToast,
      ]
    );

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx =
    useContext(AppContext);

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return ctx;
}