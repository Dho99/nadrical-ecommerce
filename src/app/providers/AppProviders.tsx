import { ThemeProvider } from '../../shared/components/ThemeProvider'
import { Toaster } from '../../shared/components/ui'
import { RouterProvider } from 'react-router-dom'
import { router } from '../routes'

export function AppProviders() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}
