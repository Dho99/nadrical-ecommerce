import { useCallback, useEffect, useState } from 'react'
import { addressService } from '../services/address.service'
import type { AddressInput, UserAddress } from '../types/address.type'

export function useAddressBook(email: string | null | undefined) {
  const [addresses, setAddresses] = useState<UserAddress[]>(() =>
    email ? addressService.listByEmail(email) : [],
  )

  useEffect(() => {
    if (!email) return
    let active = true
    addressService.fetchAddresses().then((res) => {
      if (active && res.length > 0) {
        setAddresses(res)
      }
    })
    return () => {
      active = false
    }
  }, [email])

  const addAddress = useCallback(
    async (input: AddressInput) => {
      if (!email) return null
      const record = await addressService.add(email, input)
      setAddresses((prev) => [...prev.filter((a) => a.id !== record.id), record])
      return record
    },
    [email],
  )

  const updateAddress = useCallback(async (id: string, input: AddressInput) => {
    const updated = await addressService.update(id, input)
    if (updated) {
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)))
    }
    return updated
  }, [])

  const removeAddress = useCallback(async (id: string) => {
    await addressService.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { addresses, addAddress, updateAddress, removeAddress }
}
