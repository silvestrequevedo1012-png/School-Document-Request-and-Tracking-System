import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles, allowIncompleteProfile = false }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  const home = user.role === 'User' ? '/dashboard' : '/admin'
  if (user.profile_complete === false && !allowIncompleteProfile) return <Navigate to="/complete-profile" replace />
  if (user.profile_complete !== false && allowIncompleteProfile) return <Navigate to={home} replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={home} replace />
  return children
}
