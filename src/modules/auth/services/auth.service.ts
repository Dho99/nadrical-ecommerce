import { mockDelay, mockFail } from '../../../shared/lib/mock'
import type { AuthRole, AuthSession, AuthUser } from '../types/auth.type'
import { SEED_ADMIN } from '../constants/auth.constants'

interface StoredUser extends AuthUser {
  password: string
}

const STORAGE_KEY = 'store-users'

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as StoredUser[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through to reseed
  }
  const seeded: StoredUser[] = [
    {
      id: SEED_ADMIN.id,
      name: SEED_ADMIN.name,
      email: SEED_ADMIN.email,
      password: SEED_ADMIN.password,
      role: SEED_ADMIN.role,
    },
  ]
  saveUsers(seeded)
  return seeded
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function makeToken(userId: string): string {
  return `tok-${userId}-${Math.random().toString(36).slice(2, 12)}`
}

function toSessionUser(user: StoredUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthSession> {
    await mockDelay(600)
    mockFail(0.05)
    const users = loadUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const role: AuthRole = 'user'
    const user: StoredUser = {
      id: `usr-${Math.random().toString(36).slice(2, 10)}`,
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    }
    saveUsers([...users, user])
    return {
      user: toSessionUser(user),
      token: makeToken(user.id),
    }
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await mockDelay(600)
    mockFail(0.05)
    const user = loadUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user) throw new Error('No account found with this email. Register first.')
    if (user.password !== password) throw new Error('Incorrect password. Try again.')
    return {
      user: toSessionUser(user),
      token: makeToken(user.id),
    }
  },

  async googleLogin(name: string, email: string): Promise<AuthSession> {
    await mockDelay(500)
    mockFail(0.03)
    const users = loadUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
    if (existing) {
      return {
        user: toSessionUser(existing),
        token: makeToken(existing.id),
      }
    }
    const user: StoredUser = {
      id: `usr-${Math.random().toString(36).slice(2, 10)}`,
      name: name.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: `google-${Math.random().toString(36).slice(2, 14)}`,
      role: 'user',
    }
    saveUsers([...users, user])
    return {
      user: toSessionUser(user),
      token: makeToken(user.id),
    }
  },

  async hasAccount(email: string): Promise<boolean> {
    await mockDelay(150)
    return loadUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())
  },
}
