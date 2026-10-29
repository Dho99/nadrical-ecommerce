import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from '../../shared/components/ThemeProvider'
import { GlobalAlertDialog } from '../../shared/components/GlobalAlertDialog'
import { RouterProvider } from 'react-router-dom'
import { router } from '../routes'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function AppProviders() {
  const app = (
    <>
      <RouterProvider router={router} />
      <GlobalAlertDialog />
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