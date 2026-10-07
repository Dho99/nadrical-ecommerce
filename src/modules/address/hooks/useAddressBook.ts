import { useCallback, useEffect, useState } from 'react'
import { addressService } from '../services/address.service'
import type { AddressInput, UserAddress } from '../types/address.type'

export function useAddressBook(_email: string | null | undefined) {
  void _email
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    addressService
      .fetchAddresses()
      .then((res) => {
        if (active) setAddresses(res)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const refresh = useCallback(async () => {
    const res = await addressService.fetchAddresses()
    setAddresses(res)
    return res
  }, [])

  const addAddress = useCallback(
    async (input: AddressInput) => {
      const record = await addressService.add('', input)
      setAddresses((prev) => [...prev.filter((a) => a.id !== record.id), record])
      return record
    },
    [],
  )

  const updateAddress = useCallback(async (id: string, input: AddressInput) => {
    const updated = await addressService.update(id, input)
    if (updated) setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)))
    return updated
  }, [])

  const removeAddress = useCallback(async (id: string) => {
    await addressService.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const setPrimary = useCallback(async (id: string) => {
    await addressService.setPrimary(id)
    await refresh()
  }, [refresh])

  return { addresses, loading, refresh, addAddress, updateAddress, removeAddress, setPrimary }
}
