import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../../shared/components/ui'

export function NotFoundPage() {
  const error = useRouteError()
  const is404 = isRouteErrorResponse(error) ? error.status === 404 : !error

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col items-center px-5 py-20 text-center sm:px-8">
      <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {is404 ? 'Page not found' : 'Something went wrong'}
      </p>
      <p className="mt-3 font-display text-8xl font-bold tracking-tight sm:text-9xl">
        {is404 ? '404' : '500'}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="size-4 text-amber-500" />
        {is404
          ? "This page doesn't exist. Head back to the store."
          : error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Head back to the store.'}
      </div>
      <Button size="lg" className="mt-8" asChild>
        <Link to="/">Back to the store</Link>
      </Button>
    </div>
  )
}
