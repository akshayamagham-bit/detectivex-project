import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PrinterIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BellAlertIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/context/AppContext';
import { useClock, fmtDateTime, fmtRelative } from '@/lib/format';
import { THEMES } from '@/data/seed';
import type { ThemeName } from '@/types';

const nav = [
  { to: '/', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/evidence', label: 'Evidence Intake', icon: ArchiveBoxIcon },
  { to: '/timeline', label: 'Timeline', icon: ClockIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/suspects', label: 'Suspects', icon: UserGroupIcon },
  { to: '/audit', label: 'Audit Log', icon: DocumentTextIcon },
  { to: '/report', label: 'Report', icon: PrinterIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
];

const kindColor: Record<string, string> = {
  success: 'text-forensic-success',
  warning: 'text-forensic-warning',
  danger: 'text-forensic-danger',
  info: 'text-forensic-secondary',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, caseInfo, notifications, markAllRead, theme, setTheme } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const now = useClock();
  const location = useLocation();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen fx-bg flex">
      {/* ===== Sidebar ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className={`fx-sidebar fx-border-r fixed lg:sticky top-0 h-screen z-40 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform`}
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b fx-border shrink-0">
          <div className="h-10 w-10 rounded-xl bg-forensic-primary/15 border border-forensic-primary/40 grid place-items-center shrink-0">
            <FingerPrintIcon className="h-6 w-6 fx-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-extrabold fx-text tracking-tight whitespace-nowrap">
                DetectiveX
              </h1>
              <p className="text-[10px] fx-muted uppercase tracking-[0.25em] whitespace-nowrap">
                Forensic CSI
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition relative ${
                  isActive
                    ? 'bg-forensic-primary/15 fx-primary shadow-glow'
                    : 'fx-muted hover:fx-text hover:fx-cardalt'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r bg-forensic-primary"
                    />
                  )}
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t fx-border">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-xl fx-cardalt fx-border fx-muted hover:fx-primary text-sm transition"
          >
            {collapsed ? (
              <ChevronDoubleRightIcon className="h-4 w-4" />
            ) : (
              <>
                <ChevronDoubleLeftIcon className="h-4 w-4" /> Collapse
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ===== Main ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* top nav */}
        <header className="h-16 fx-sidebar fx-border-b sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-9 w-9 grid place-items-center rounded-lg fx-cardalt fx-border fx-muted"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 fx-cardalt fx-border rounded-lg px-3 py-1.5">
            <ClockIcon className="h-4 w-4 fx-primary" />
            <span className="text-xs font-mono fx-text tabular-nums">{fmtDateTime(now)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 fx-cardalt fx-border rounded-lg px-3 py-1.5">
            <ShieldCheckIcon className="h-4 w-4 text-forensic-secondary" />
            <span className="text-xs font-mono fx-muted">CASE</span>
            <span className="text-xs font-semibold fx-text">{caseInfo.caseNumber}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                caseInfo.status === 'Closed'
                  ? 'bg-forensic-success/20 text-forensic-success'
                  : caseInfo.status === 'Under Investigation'
                    ? 'bg-forensic-warning/20 text-forensic-warning'
                    : 'bg-forensic-secondary/20 text-forensic-secondary'
              }`}
            >
              {caseInfo.status}
            </span>
          </div>

          <div className="flex-1" />

          {/* notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((o) => !o);
                setProfileOpen(false);
                setThemeOpen(false);
              }}
              className="relative h-9 w-9 grid place-items-center rounded-lg fx-cardalt fx-border fx-muted hover:fx-primary transition"
            >
              <BellAlertIcon className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-forensic-danger text-white">
                  {unread}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-80 fx-card fx-border rounded-2xl shadow-glass overflow-hidden z-30"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b fx-border">
                    <span className="text-sm font-semibold fx-text">Notifications</span>
                    <button
                      onClick={markAllRead}
                      className="text-xs fx-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y fx-border">
                    {notifications.length === 0 && (
                      <p className="text-sm fx-muted p-4 text-center">No notifications</p>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 flex gap-3">
                        <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${kindColor[n.kind].replace('text', 'bg')}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium fx-text truncate">{n.title}</p>
                          <p className="text-xs fx-muted">{n.body}</p>
                          <p className="text-[10px] fx-muted mt-0.5">{fmtRelative(n.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* theme toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeOpen((o) => !o);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className="h-9 w-9 grid place-items-center rounded-lg fx-cardalt fx-border fx-muted hover:fx-primary transition"
            >
              {theme === 'light' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-44 fx-card fx-border rounded-2xl shadow-glass overflow-hidden z-30 p-2"
                >
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id as ThemeName);
                        setThemeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        theme === t.id
                          ? 'bg-forensic-primary/15 fx-primary'
                          : 'fx-muted hover:fx-text hover:fx-cardalt'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotifOpen(false);
                setThemeOpen(false);
              }}
              className="flex items-center gap-2 h-9 px-2 rounded-lg fx-cardalt fx-border hover:fx-primary transition"
            >
              <div className="h-7 w-7 rounded-full bg-forensic-primary/20 grid place-items-center text-xs font-bold fx-primary">
                {user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold fx-text leading-none">{user?.name}</p>
                <p className="text-[10px] fx-muted leading-none mt-0.5">{user?.badge}</p>
              </div>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-60 fx-card fx-border rounded-2xl shadow-glass overflow-hidden z-30"
                >
                  <div className="p-4 border-b fx-border">
                    <p className="text-sm font-semibold fx-text">{user?.name}</p>
                    <p className="text-xs fx-muted">Badge {user?.badge}</p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-forensic-primary/15 fx-primary font-medium uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-forensic-danger hover:bg-forensic-danger/10 transition"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* page body */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
