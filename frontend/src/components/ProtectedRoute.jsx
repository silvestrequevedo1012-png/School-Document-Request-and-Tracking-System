import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, admin = false, allowIncompleteProfile = false }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.profile_complete === false && !allowIncompleteProfile) return <Navigate to="/complete-profile" replace />
  if (user.profile_complete !== false && allowIncompleteProfile) return <Navigate to="/dashboard" replace />
  if (admin && user.role !== 'Administrator') return <Navigate to="/dashboard" replace />
  return children
}
