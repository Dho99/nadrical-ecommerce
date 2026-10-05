import api, { getErrorMessage, unwrapData } from '../../../shared/lib/api'
import type { AuthRoleName, AuthSession, AuthUser } from '../types/auth.type'

export interface UpdateProfileInput {
  full_name: string
  phone?: string
  avatar_url?: string
  current_password?: string
  new_password?: string
}

interface BackendRole {
  uuid?: string
  nama_role: string
}

interface BackendAkun {
  uuid?: string
  id?: string
  email: string
  username?: string
  full_name?: string
  phone?: string
  avatar_url?: string
  image?: string
  status?: string
  roles?: BackendRole[]
}

interface BackendAuthData {
  access_token?: string
  token?: string
  akun?: BackendAkun
}

interface StandardApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

function parseRole(roles?: BackendRole[]): AuthRoleName {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return 'user'
  const hasStaff = roles.some((r) => {
    const name = (r.nama_role || '').toUpperCase()
    return name === 'SUPERADMIN' || name === 'ADMIN' || name === 'OPERATOR'
  })
  return hasStaff ? 'admin' : 'user'
}

function toAuthUser(akun: BackendAkun): AuthUser {
  return {
    id: akun.uuid || akun.id || '',
    email: akun.email,
    full_name: akun.full_name || akun.username || akun.email.split('@')[0],
    phone: akun.phone || undefined,
    avatar_url: akun.avatar_url || akun.image || undefined,
    role_name: parseRole(akun.roles),
  }
}

export const authService = {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const baseUsername =
      cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '')
    const username =
      baseUsername.length >= 3
        ? baseUsername
        : `${baseUsername}${Math.floor(100 + Math.random() * 900)}`

    try {
      const res = await api.post<StandardApiResponse<BackendAuthData>>(
        '/auth/register',
        { email: cleanEmail, username, password, full_name: cleanName },
      )
      const data = unwrapData<BackendAuthData>(res.data) ?? res.data.data
      if (!data || !data.akun) throw new Error(res.data.message || 'Failed to parse registration response')
      const token = data.token || data.access_token || ''
      if (token) localStorage.setItem('token', token)
      return { user: toAuthUser(data.akun), token }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'), { cause: error })
    }
  },

  async login(
    emailOrUsername: string,
    password: string,
  ): Promise<AuthSession> {
    const identifier = emailOrUsername.trim()
    try {
      const res = await api.post<StandardApiResponse<BackendAuthData>>(
        '/auth/login',
        { identifier, password },
      )
      const data = unwrapData<BackendAuthData>(res.data) ?? res.data.data
      if (!data || !data.akun) throw new Error(res.data.message || 'Failed to parse login response')
      const token = data.token || data.access_token || ''
      if (token) localStorage.setItem('token', token)
      return { user: toAuthUser(data.akun), token }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Incorrect credentials. Please try again.'), { cause: error })
    }
  },

  async googleLogin(_name: string, _email: string): Promise<AuthSession> {
    throw new Error('Google login belum tersedia di backend. Gunakan email/username.')
  },

  async getProfile(): Promise<AuthUser | null> {
    try {
      const res = await api.get<StandardApiResponse<BackendAkun>>('/auth/profile')
      const akun = unwrapData<BackendAkun>(res.data) ?? res.data.data
      if (akun) return toAuthUser(akun)
      return null
    } catch {
      return null
    }
  },

  async updateProfile(
    _userId: string,
    input: UpdateProfileInput,
  ): Promise<AuthUser> {
    let uploadedUrl: string | undefined
    if (input.avatar_url && (input.avatar_url.startsWith('data:') || input.avatar_url.startsWith('blob:'))) {
      try {
        const blob = await (await fetch(input.avatar_url)).blob()
        const form = new FormData()
        form.append('file', blob, 'avatar.jpg')
        const up = await api.post<{ success: boolean; data?: { url?: string }; url?: string }>('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const body = up.data as unknown as { data?: { url?: string }; url?: string }
        uploadedUrl = body?.data?.url || body?.url || undefined
      } catch {
        // fallback to data URL via profile field (BE may ignore)
      }
    } else if (input.avatar_url && input.avatar_url.startsWith('http')) {
      uploadedUrl = input.avatar_url
    }

    if (input.new_password && input.new_password !== input.current_password) {
      // BE UpdateProfile currently only supports full_name/phone/username — password change not wired; keep client-side no-op with warning
    }

    const payload: Record<string, string> = {}
    if (input.full_name?.trim()) payload.full_name = input.full_name.trim()
    if (input.phone !== undefined) payload.phone = input.phone
    const finalAvatar = uploadedUrl || input.avatar_url
    if (finalAvatar && !finalAvatar.startsWith('data:') && !finalAvatar.startsWith('blob:')) {
      payload.avatar_url = finalAvatar
    }

    try {
      const res = await api.put<StandardApiResponse<BackendAkun>>('/auth/profile', payload)
      const akun = unwrapData<BackendAkun>(res.data) ?? res.data.data
      if (akun) return toAuthUser(akun)
    } catch (error) {
      const msg = getErrorMessage(error, '')
      if (msg) throw new Error(msg, { cause: error })
    }

    const fallback = await authService.getProfile()
    if (fallback) return fallback

    return {
      id: _userId,
      email: '',
      full_name: input.full_name,
      phone: input.phone,
      avatar_url: uploadedUrl || input.avatar_url,
      role_name: 'user',
    }
  },
}
