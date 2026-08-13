import { GoogleLogin } from '@react-oauth/google'
import { useTheme } from 'next-themes'
import { useAuth } from '../hooks/useAuth'
import { decodeGoogleIdToken } from '../utils/jwt'

interface GoogleSignInButtonProps {
  isLogin: boolean
  onError: (message: string) => void
  onSignedIn: () => void
}

export function GoogleSignInButton({ isLogin, onError, onSignedIn }: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth()
  const { resolvedTheme } = useTheme()

  return (
    <GoogleLogin
      shape="rectangular"
      size="large"
      width="100%"
      text={isLogin ? 'signin_with' : 'signup_with'}
      theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
      onSuccess={async (response) => {
        const payload = decodeGoogleIdToken(response.credential ?? '')
        if (!payload?.email || !payload.email_verified) {
          onError('Google sign-in could not verify your account email.')
          return
        }
        try {
          await googleLogin(payload.name ?? payload.email.split('@')[0], payload.email)
          onSignedIn()
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Google sign-in failed. Try again.')
        }
      }}
      onError={() => onError('Google sign-in failed. Try again.')}
    />
  )
}