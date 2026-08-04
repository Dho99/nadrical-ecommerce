import { Link, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../../shared/components/ui'

export function NotFoundPage() {
  const error = useRouteError() as { status?: number } | undefined
  const status = error?.status ?? 404

  return (
    <div className="container mx-auto flex flex-col items-center px-5 py-20 text-center sm:px-8">
      <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {status === 404 ? 'Page not found' : 'Something went wrong'}
      </p>
      <p className="mt-3 font-display text-8xl font-bold tracking-tight sm:text-9xl">
        {status === 404 ? '404' : 'Error'}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="size-4 text-amber-500" />
        This page doesn't exist. Head back to the store.
      </div>
      <Button size="lg" className="mt-8" asChild>
        <Link to="/">Back to the store</Link>
      </Button>
    </div>
  )
}
