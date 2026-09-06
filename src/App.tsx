import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Evidence } from '@/pages/Evidence';
import { Timeline } from '@/pages/Timeline';
import { Analytics } from '@/pages/Analytics';
import { Suspects } from '@/pages/Suspects';
import { AuditLog } from '@/pages/AuditLog';
import { Report } from '@/pages/Report';
import { Settings } from '@/pages/Settings';
import { Admin } from "@/pages/Admin";
import { UserManagement } from '@/pages/UserManagement';
import { ToastContainer } from '@/components/ui/Toast';

function Protected() {
  const { user } = useApp();
  if (!user) return <Login />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/suspects" element={<Suspects />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/report" element={<Report />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Protected />
        <ToastContainer />
      </HashRouter>
    </AppProvider>
  );
}
