import type { DbUser } from '../../../shared/types/database.type'

export type AuthUserDb = DbUser
export type AuthRoleName = 'user' | 'admin'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role_name: AuthRoleName
  loyalty_points?: number
  loyalty_id?: string
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

// Public, non-sensitive UI profile only. Never holds JWT/session token.
// Source of truth for auth is the HttpOnly session cookie validated by
// `GET /auth/profile` on the Go backend.
export interface AuthResult {
  user: AuthUser;
  message: string;
}
