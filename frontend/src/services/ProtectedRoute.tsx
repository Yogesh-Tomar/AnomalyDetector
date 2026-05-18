import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from './SessionContext'

interface ProtectedRouteProps {
  roles?: string[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useSession()
  if (loading) return null // or a spinner
  if (!user) return <Navigate to="/login" replace />
  // Normalize role to lowercase for comparison
  const userRole = (user.role || '').toLowerCase()
  if (roles && !roles.map(r => r.toLowerCase()).includes(userRole)) return <Navigate to="/" replace />
  return <Outlet />
}
