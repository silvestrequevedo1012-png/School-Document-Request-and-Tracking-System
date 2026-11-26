import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import CompleteProfile from './pages/CompleteProfile'
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
  const protectedPage = (page, allowedRoles, allowIncompleteProfile = false) => <ProtectedRoute allowedRoles={allowedRoles} allowIncompleteProfile={allowIncompleteProfile}><AppShell>{page}</AppShell></ProtectedRoute>
  const users = ['User']
  const requestStaff = ['Administrator', 'Registrar']
  const administrators = ['Administrator']
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/complete-profile" element={protectedPage(<CompleteProfile />, undefined, true)} />
    <Route path="/dashboard" element={protectedPage(<Dashboard />, users)} />
    <Route path="/requests" element={protectedPage(<RequestHistory />, users)} />
    <Route path="/requests/new" element={protectedPage(<NewRequest />, users)} />
    <Route path="/requests/:requestId" element={protectedPage(<RequestDetails />, users)} />
    <Route path="/notifications" element={protectedPage(<Notifications />, users)} />
    <Route path="/profile" element={protectedPage(<Profile />)} />
    <Route path="/admin" element={protectedPage(<AdminDashboard />, requestStaff)} />
    <Route path="/admin/requests" element={protectedPage(<AdminRequests />, requestStaff)} />
    <Route path="/admin/requests/:requestId" element={protectedPage(<AdminRequestDetails />, requestStaff)} />
    <Route path="/admin/users" element={protectedPage(<AdminUsers />, administrators)} />
    <Route path="/admin/email" element={protectedPage(<AdminEmail />, administrators)} />
    <Route path="/admin/audit-logs" element={protectedPage(<AdminAuditLogs />, administrators)} />
    <Route path="/admin/dsa" element={protectedPage(<DSADemo />, administrators)} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
