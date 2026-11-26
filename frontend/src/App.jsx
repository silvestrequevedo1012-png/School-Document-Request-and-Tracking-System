import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import RequestHistory from './pages/RequestHistory'
import RequestDetails from './pages/RequestDetails'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminRequests from './pages/AdminRequests'
import AdminRequestDetails from './pages/AdminRequestDetails'
import AdminUsers from './pages/AdminUsers'
import AdminEmail from './pages/AdminEmail'
import AdminAuditLogs from './pages/AdminAuditLogs'
import DSADemo from './pages/DSADemo'

function AppShell({ children }) {
  return <><Navbar /><div className="app-layout"><Sidebar /><main className="main-content">{children}</main></div></>
}

export default function App() {
  const protectedPage = (page, admin = false) => <ProtectedRoute admin={admin}><AppShell>{page}</AppShell></ProtectedRoute>
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
    <Route path="/requests" element={protectedPage(<RequestHistory />)} />
    <Route path="/requests/new" element={protectedPage(<NewRequest />)} />
    <Route path="/requests/:requestId" element={protectedPage(<RequestDetails />)} />
    <Route path="/notifications" element={protectedPage(<Notifications />)} />
    <Route path="/profile" element={protectedPage(<Profile />)} />
    <Route path="/admin" element={protectedPage(<AdminDashboard />, true)} />
    <Route path="/admin/requests" element={protectedPage(<AdminRequests />, true)} />
    <Route path="/admin/requests/:requestId" element={protectedPage(<AdminRequestDetails />, true)} />
    <Route path="/admin/users" element={protectedPage(<AdminUsers />, true)} />
    <Route path="/admin/email" element={protectedPage(<AdminEmail />, true)} />
    <Route path="/admin/audit-logs" element={protectedPage(<AdminAuditLogs />, true)} />
    <Route path="/admin/dsa" element={protectedPage(<DSADemo />, true)} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
