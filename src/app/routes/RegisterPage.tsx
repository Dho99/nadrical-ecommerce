import { Navigate, useLocation } from 'react-router-dom'
import { AuthForm, useAuth } from '../../modules/auth'

export function RegisterPage() {
  const { isAuthed } = useAuth()
  const location = useLocation()
  const rawFrom = (location.state as { from?: string } | null)?.from
  const redirectTo = rawFrom && rawFrom !== '/login' && rawFrom !== '/register' ? rawFrom : '/'

  if (isAuthed) {
    return <Navigate to={redirectTo} replace />
  }
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <header className="mb-8 text-center">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store account
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Create account</h1>
      </header>
      <AuthForm mode="register" />
    </div>
  )
}
