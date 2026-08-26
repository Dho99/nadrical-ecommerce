import type { DbUser } from '../../../shared/types/database.type'

export type AuthUserDb = DbUser
export type AuthRoleName = 'user' | 'admin'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  role_name: AuthRoleName
}

export interface AuthSession {
  user: AuthUser
  token: string
}
