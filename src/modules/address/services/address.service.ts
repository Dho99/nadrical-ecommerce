import { ADDRESS_STORAGE_KEY } from '../constants/address.constants'
import type { AddressInput, AddressRecord } from '../types/address.type'

function loadAll(): AddressRecord[] {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as AddressRecord[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through to empty
  }
  return []
}

function saveAll(addresses: AddressRecord[]): void {
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses))
}

function makeId(): string {
  return `adr-${Math.random().toString(36).slice(2, 10)}`
}

function applyPrimary(all: AddressRecord[], record: AddressRecord, email: string): AddressRecord[] {
  if (!record.isPrimary) return all
  return all.map((a) =>
    a.email.toLowerCase() === email.trim().toLowerCase() && a.id !== record.id
      ? { ...a, isPrimary: false }
      : a,
  )
}

export const addressService = {
  listByEmail(email: string): AddressRecord[] {
    return loadAll()
      .filter((a) => a.email.toLowerCase() === email.trim().toLowerCase())
      .sort((a, b) => a.label.localeCompare(b.label))
  },

  add(email: string, input: AddressInput): AddressRecord {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = loadAll().filter((a) => a.email.toLowerCase() === normalizedEmail)
    const record: AddressRecord = {
      id: makeId(),
      email: normalizedEmail,
      isPrimary: existing.length === 0,
      ...input,
    }
    saveAll(applyPrimary([...loadAll(), record], record, normalizedEmail))
    return record
  },

  update(id: string, input: AddressInput): AddressRecord | null {
    const all = loadAll()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    const updated: AddressRecord = { ...all[idx], ...input }
    all[idx] = updated
    saveAll(applyPrimary(all, updated, updated.email))
    return updated
  },

  remove(id: string): void {
    saveAll(loadAll().filter((a) => a.id !== id))
  },
}