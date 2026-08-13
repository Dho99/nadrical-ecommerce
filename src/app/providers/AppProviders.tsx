import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from '../../shared/components/ThemeProvider'
import { Toaster } from '../../shared/components/ui'
import { RouterProvider } from 'react-router-dom'
import { router } from '../routes'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function AppProviders() {
  const app = (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  )

  return (
    <ThemeProvider>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
      ) : (
        app
      )}
    </ThemeProvider>
  )
}