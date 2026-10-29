import { useEffect, useState } from 'react'
import { voucherService } from '../services/voucher.service'
import type { Voucher } from '../types/voucher.type'

let cache: Voucher[] | null = null
let inFlight: Promise<Voucher[]> | null = null

async function loadVouchers(force = false): Promise<Voucher[]> {
  if (!force && cache) return cache
  if (!inFlight) {
    inFlight = voucherService
      .getAll()
      .then((items) => {
        cache = items
        return items
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

export function useVoucherCatalog() {
  const [items, setItems] = useState<Voucher[]>(cache ?? [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadVouchers()
      .then((data) => {
        if (!cancelled) {
          setItems(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([])
          setError(err instanceof Error ? err.message : 'Gagal memuat voucher')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading, error }
}

export function useVoucherDetail(id?: string) {
  const [item, setItem] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when id is absent
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    voucherService
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          setItem(data)
          setError(data ? null : 'Voucher tidak ditemukan')
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItem(null)
          setError(err instanceof Error ? err.message : 'Voucher tidak ditemukan')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return { item, loading, error }
}
