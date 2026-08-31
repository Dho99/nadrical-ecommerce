import { api, setAuthToken, getAuthToken } from '../../../shared/lib/api'
import type { AuthRoleName, AuthSession, AuthUser } from '../types/auth.type'
import type { DbUser } from '../../../shared/types/database.type'

function toSessionUser(akun: AkunResponse): AuthUser {
  return {
    id: akun.uuid,
    email: akun.email,
    full_name: akun.username ?? undefined,
    role_name: (akun.roles?.[0] ?? 'CUSTOMER') as AuthRoleName,
  }
}

interface AkunResponse {
  uuid: string
  email: string
  username: string
  roles: string[]
}

interface LoginResponse {
  access_token: string
  token: string
  akun: AkunResponse
}

interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface UpdateProfileInput {
  full_name: string
  phone?: string
  current_password?: string
  new_password?: string
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthSession> {
    const data = await api.post<LoginResponse>('/auth/register', {
      email,
      username: name,
      password,
    })
    const token = data.access_token ?? data.token
    setAuthToken(token)
    return {
      user: toSessionUser(data.akun),
      token,
    }
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const data = await api.post<LoginResponse>('/auth/login', {
      identifier: email,
      password,
    })
    const token = data.access_token ?? data.token
    setAuthToken(token)
    return {
      user: toSessionUser(data.akun),
      token,
    }
  },

  async googleLogin(_name: string, _email: string): Promise<AuthSession> {
    throw new Error('Google login not implemented in backend integration')
  },

  async hasAccount(email: string): Promise<boolean> {
    try {
      await api.get<{ exists: boolean }>('/auth/check-email', { params: { email } })
      return true
    } catch {
      return false
    }
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    const data = await api.put<{ akun: AkunResponse }>(`/auth/profile`, input)
    const session = getAuthToken()
    if (!session) throw new Error('No session')
    return toSessionUser(data.akun)
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      setAuthToken(null)
    }
  },
}

interface Akun {
  uuid: string
  email: string
  username?: string
  roles: string[]
}