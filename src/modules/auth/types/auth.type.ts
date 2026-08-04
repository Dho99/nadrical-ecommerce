export type AuthRole = 'user' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
}

export interface AuthSession {
  user: AuthUser
  token: string
}
