import { useCallback, useState } from 'react'
import { addressService } from '../services/address.service'
import type { AddressInput, AddressRecord } from '../types/address.type'

export function useAddressBook(email: string | null | undefined) {
  const [addresses, setAddresses] = useState<AddressRecord[]>(() =>
    email ? addressService.listByEmail(email) : [],
  )

  const addAddress = useCallback(
    (input: AddressInput) => {
      if (!email) return null
      const record = addressService.add(email, input)
      setAddresses((prev) => [...prev, record])
      return record
    },
    [email],
  )

  const updateAddress = useCallback((id: string, input: AddressInput) => {
    const updated = addressService.update(id, input)
    if (updated) {
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)))
    }
    return updated
  }, [])

  const removeAddress = useCallback((id: string) => {
    addressService.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { addresses, addAddress, updateAddress, removeAddress }
}
