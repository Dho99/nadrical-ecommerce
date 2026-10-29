import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthed, user } = useAuth()
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user?.role_name !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}
