import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'
import { Home, MapPinPlus } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, RadioGroup, RadioGroupItem } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { useAddressBook } from '../../address'
import { CheckoutField } from './CheckoutField'
import { PostalCodeField } from './PostalCodeField'
import { customerSchema, type CheckoutInput } from '../schemas/checkout.schema'
import type { UserAddress } from '../../address/types/address.type'

interface StepContactProps {
  email?: string
}

export function StepContact({ email }: StepContactProps) {
  const form = useFormContext<CheckoutInput>()
  const { addresses, addAddress } = useAddressBook(email)
  const [saveToBook, setSaveToBook] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  const applyAddress = (address: UserAddress) => {
    const opts = { shouldDirty: true, shouldValidate: true } as const
    form.setValue('recipient_name', address.recipient_name, opts)
    form.setValue('recipient_phone', address.recipient_phone, opts)
    form.setValue('shipping_address_line_1', address.address_line_1, opts)
    form.setValue('shipping_address_line_2', address.address_line_2 ?? '', opts)
    form.setValue('shipping_city', address.city ?? '', opts)
    form.setValue('shipping_province', address.province ?? '', opts)
    form.setValue('shipping_postal_code', address.postal_code ?? '', opts)
    form.setValue(
      'shipping_country_code',
      (address.country_code ?? 'ID') as CheckoutInput['shipping_country_code'],
      opts,
    )
    void form.trigger([
      'recipient_name',
      'recipient_phone',
      'shipping_address_line_1',
      'shipping_address_line_2',
      'shipping_city',
      'shipping_province',
      'shipping_postal_code',
      'shipping_country_code',
    ])
    toast.success(`${address.label ?? 'Alamat'} diterapkan`)
  }

  const selectAddress = (address: UserAddress) => {
    setSelectedId(address.id)
    applyAddress(address)
  }

  useEffect(() => {
    if (addresses.length === 0) return
    if (selectedId && addresses.some((a) => a.id === selectedId)) return
    const primary = addresses.find((a) => a.is_primary) ?? addresses[0]
    if (!primary) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync selected address from loaded book
    setSelectedId(primary.id)
  }, [addresses, selectedId])

  useEffect(() => {
    if (addresses.length === 0) return
    const v = form.getValues()
    const isEmpty = !v.recipient_name && !v.shipping_address_line_1 && !v.shipping_city
    if (!isEmpty || form.formState.isDirty) return
    const primary = addresses.find((a) => a.is_primary) ?? addresses[0]
    if (!primary) return
    applyAddress(primary)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill checkout from primary address on first load
    setSelectedId(primary.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses])

  const handleSaveToggle = (checked: boolean) => {
    if (!checked) {
      setSaveToBook(false)
      return
    }
    const values = form.getValues()
    const parsed = customerSchema.safeParse(values)
    if (!parsed.success) {
      toast.error('Complete the address fields first')
      return
    }
    addAddress({
      label: 'Home',
      recipient_name: values.recipient_name,
      recipient_phone: values.recipient_phone,
      address_line_1: values.shipping_address_line_1,
      address_line_2: values.shipping_address_line_2,
      district: undefined,
      city: values.shipping_city,
      province: values.shipping_province,
      postal_code: values.shipping_postal_code,
      country_code: values.shipping_country_code,
    })
    setSaveToBook(true)
    toast.success('Address saved to your book')
  }

  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Delivery details</legend>

      {addresses.length > 0 ? (
        <div className="sm:col-span-2">
          <p className="mb-2 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Alamat tersimpan — pilih untuk isi otomatis
          </p>
          <RadioGroup
            key={addresses.length}
            value={selectedId}
            onValueChange={(id) => {
              const address = addresses.find((a) => a.id === id)
              if (!address) return
              setSelectedId(id)
              applyAddress(address)
            }}
            className="grid gap-2"
          >
            {addresses.map((address) => {
              const active = address.id === selectedId
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => selectAddress(address)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'hover:border-foreground/40',
                  )}
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`address-${address.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Home className="size-3.5" /> {address.label ?? 'Alamat'}
                      {address.is_primary ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground">
                          Utama
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {address.recipient_name} · {address.address_line_1}, {address.city ?? ''} {address.postal_code ?? ''} {address.province ? `· ${address.province}` : ''}
                    </span>
                  </span>
                </button>
              )
            })}
          </RadioGroup>
          <p className="mt-2 text-xs text-muted-foreground">
            Klik alamat di atas untuk mengisi nama, telepon & alamat pengiriman otomatis. Masih bisa diedit di bawah.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed bg-muted/40 p-3 sm:col-span-2">
          <p className="text-sm text-muted-foreground">Belum ada alamat tersimpan. Simpan alamat untuk checkout lebih cepat.</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/addresses">
              <MapPinPlus /> Kelola alamat
            </Link>
          </Button>
        </div>
      )}

      <PostalCodeField
        postalCodeName="shipping_postal_code"
        cityName="shipping_city"
        addressName="shipping_address_line_1"
        provinceName="shipping_province"
        countryName="shipping_country_code"
      />
      <CheckoutField
        name="recipient_name"
        label="Full name"
        className="sm:col-span-2"
        autoComplete="name"
        placeholder="Ada Lovelace"
      />
      <CheckoutField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        readOnly
      />
      <CheckoutField
        name="recipient_phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="+62 812 3456 7890"
      />
      <CheckoutField
        name="shipping_address_line_1"
        label="Street address"
        className="sm:col-span-2"
        autoComplete="street-address"
        placeholder="Jl. Contoh No. 12"
      />
      <CheckoutField
        name="shipping_address_line_2"
        label="Address line 2 (optional)"
        className="sm:col-span-2"
        autoComplete="address-line2"
        placeholder="RT/RW, block, unit"
      />
      <CheckoutField
        name="shipping_city"
        label="City"
        autoComplete="address-level2"
        placeholder="Kota / Kabupaten"
      />
      <CheckoutField
        name="shipping_province"
        label="Province"
        autoComplete="address-level1"
        placeholder="Provinsi"
      />

      <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:col-span-2">
        <div>
          <p className="text-sm font-medium">Save this address to my address book</p>
          <p className="text-xs text-muted-foreground">Reuse for next checkout — one click apply.</p>
        </div>
        <Button
          type="button"
          variant={saveToBook ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSaveToggle(!saveToBook)}
        >
          {saveToBook ? 'Saved ✓' : 'Save address'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground sm:col-span-2">
        Your order will be linked to your account email and appear in your profile.
      </p>
    </fieldset>
  )
}
