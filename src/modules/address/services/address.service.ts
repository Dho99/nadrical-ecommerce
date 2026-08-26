import type { DbUserAddress } from '../../../shared/types/database.type'
import type { AddressInput, UserAddress } from '../types/address.type'

const STORAGE_KEY = 'db-user-addresses'

function loadAll(): UserAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as UserAddress[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  return []
}

function saveAll(addresses: UserAddress[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
}

function makeId(): string {
  return `adr-${Math.random().toString(36).slice(2, 10)}`
}

function applyPrimary(all: UserAddress[], record: UserAddress, user_id: string): UserAddress[] {
  if (!record.is_primary) return all
  return all.map((a) =>
    a.user_id.toLowerCase() === user_id.trim().toLowerCase() && a.id !== record.id
      ? { ...a, is_primary: false }
      : a,
  )
}

export const addressService = {
  listByEmail(email: string): UserAddress[] {
    return loadAll()
      .filter((a) => a.user_id.toLowerCase() === email.trim().toLowerCase())
      .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
  },

  add(email: string, input: AddressInput): UserAddress {
    const user_id = email.trim().toLowerCase()
    const existing = loadAll().filter((a) => a.user_id.toLowerCase() === user_id)
    const record: UserAddress = {
      id: makeId(),
      user_id,
      ...input,
      is_primary: existing.length === 0 || input.is_primary === true,
      created_at: new Date().toISOString(),
    }
    const all = [...loadAll(), record]
    saveAll(applyPrimary(all, record, user_id))
    return record
  },

  update(id: string, input: AddressInput): UserAddress | null {
    const all = loadAll()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    const updated: UserAddress = {
      ...all[idx],
      ...input,
      updated_at: new Date().toISOString(),
    }
    all[idx] = updated
    saveAll(applyPrimary(all, updated, updated.user_id))
    return updated
  },

  remove(id: string): void {
    saveAll(loadAll().filter((a) => a.id !== id))
  },
}

export type { DbUserAddress }
