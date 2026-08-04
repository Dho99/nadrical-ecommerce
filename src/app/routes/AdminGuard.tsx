import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../modules/auth'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
} from '../../shared/components/ui'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthed, user } = useAuth()
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You’re signed in as <span className="font-medium text-foreground">{user?.email}</span>,
            but this area is restricted to admin accounts.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to the store</Link>
          </Button>
        </Card>
        <Alert className="mt-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Demo admin account</AlertTitle>
          <AlertDescription>
            Sign in with <span className="font-mono">admin@store.dev</span> /{' '}
            <span className="font-mono">admin123</span> to manage products.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return children
}