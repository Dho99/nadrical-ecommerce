import { mockDelay, mockFail } from '../../../shared/lib/mock'
import type { AuthRoleName, AuthSession, AuthUser } from '../types/auth.type'
import { SEED_ADMIN } from '../constants/auth.constants'
import type { DbUser, DbRole, DbUserRole } from '../../../shared/types/database.type'

const USERS_KEY = 'db-users'
const ROLES_KEY = 'db-roles'
const USER_ROLES_KEY = 'db-user-roles'

function loadUsers(): DbUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as DbUser[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  const seededUsers: DbUser[] = [
    {
      id: SEED_ADMIN.id,
      email: SEED_ADMIN.email,
      password_hash: SEED_ADMIN.password,
      full_name: SEED_ADMIN.name,
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ]
  localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers))
  return seededUsers
}

function saveUsers(users: DbUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadUserRoles(): DbUserRole[] {
  try {
    const raw = localStorage.getItem(USER_ROLES_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as DbUserRole[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  const seededUserRoles: DbUserRole[] = [
    {
      id: 'ur-admin',
      user_id: SEED_ADMIN.id,
      role_id: 'role-admin',
      created_at: new Date().toISOString(),
    },
  ]
  localStorage.setItem(USER_ROLES_KEY, JSON.stringify(seededUserRoles))
  return seededUserRoles
}

function saveUserRoles(ur: DbUserRole[]): void {
  localStorage.setItem(USER_ROLES_KEY, JSON.stringify(ur))
}

function loadRoles(): DbRole[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as DbRole[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  const seededRoles: DbRole[] = [
    { id: 'role-admin', name: 'admin', is_active: true },
    { id: 'role-user', name: 'user', is_active: true },
  ]
  localStorage.setItem(ROLES_KEY, JSON.stringify(seededRoles))
  return seededRoles
}

function makeToken(userId: string): string {
  return `tok-${userId}-${Math.random().toString(36).slice(2, 12)}`
}

function getUserRoleName(userId: string): AuthRoleName {
  const ur = loadUserRoles().find((r) => r.user_id === userId)
  if (!ur) return 'user'
  const role = loadRoles().find((r) => r.id === ur.role_id)
  return role?.name === 'admin' ? 'admin' : 'user'
}

function toSessionUser(user: DbUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || undefined,
    phone: user.phone || undefined,
    role_name: getUserRoleName(user.id),
  }
}

export interface UpdateProfileInput {
  full_name: string
  phone?: string
  current_password?: string
  new_password?: string
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthSession> {
    await mockDelay(600)
    mockFail(0.05)
    const users = loadUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const newUserId = `usr-${Math.random().toString(36).slice(2, 10)}`
    const user: DbUser = {
      id: newUserId,
      email: email.trim(),
      password_hash: password,
      full_name: name.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    }
    saveUsers([...users, user])

    const userRoles = loadUserRoles()
    const association: DbUserRole = {
      id: `ur-${Math.random().toString(36).slice(2, 10)}`,
      user_id: newUserId,
      role_id: 'role-user',
      created_at: new Date().toISOString(),
    }
    saveUserRoles([...userRoles, association])

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
    if (user.password_hash !== password) throw new Error('Incorrect password. Try again.')
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
    const newUserId = `usr-${Math.random().toString(36).slice(2, 10)}`
    const user: DbUser = {
      id: newUserId,
      email: normalizedEmail,
      password_hash: `google-${Math.random().toString(36).slice(2, 14)}`,
      full_name: name.trim() || normalizedEmail.split('@')[0],
      status: 'active',
      created_at: new Date().toISOString(),
    }
    saveUsers([...users, user])

    const userRoles = loadUserRoles()
    const association: DbUserRole = {
      id: `ur-${Math.random().toString(36).slice(2, 10)}`,
      user_id: newUserId,
      role_id: 'role-user',
      created_at: new Date().toISOString(),
    }
    saveUserRoles([...userRoles, association])

    return {
      user: toSessionUser(user),
      token: makeToken(user.id),
    }
  },

  async hasAccount(email: string): Promise<boolean> {
    await mockDelay(150)
    return loadUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())
  },

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<AuthUser> {
    await mockDelay(600)
    mockFail(0.03)
    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) throw new Error('Account not found.')
    const user = users[idx]

    if (input.new_password) {
      if (!input.current_password) {
        throw new Error('Enter your current password to set a new one.')
      }
      if (user.password_hash !== input.current_password) {
        throw new Error('Current password is incorrect.')
      }
    }

    const updated: DbUser = {
      ...user,
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || undefined,
      ...(input.new_password ? { password_hash: input.new_password } : {}),
      updated_at: new Date().toISOString(),
    }
    users[idx] = updated
    saveUsers(users)
    return toSessionUser(updated)
  },
}
