import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Home } from 'lucide-react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem, Switch } from '../../../shared/components/ui'
import { Label } from '../../../shared/components/ui'
import { useAddressBook } from '../../address'
import { CheckoutField } from './CheckoutField'
import { PostalCodeField } from './PostalCodeField'
import { customerSchema, type CheckoutInput } from '../schemas/checkout.schema'
import type { AddressRecord } from '../../address/types/address.type'

interface StepContactProps {
  email?: string
}

export function StepContact({ email }: StepContactProps) {
  const form = useFormContext<CheckoutInput>()
  const { addresses, addAddress } = useAddressBook(email)
  const [saveToBook, setSaveToBook] = useState(false)

  const applyAddress = (address: AddressRecord) => {
    form.setValue('fullName', address.fullName)
    form.setValue('phone', address.phone)
    form.setValue('address', address.address)
    form.setValue('addressLine2', address.addressLine2 ?? '')
    form.setValue('city', address.city)
    form.setValue('province', address.province ?? '')
    form.setValue('postalCode', address.postalCode)
    form.setValue('countryCode', (address.countryCode ?? 'ID') as CheckoutInput['countryCode'])
    form.trigger([
      'fullName',
      'phone',
      'address',
      'addressLine2',
      'city',
      'province',
      'postalCode',
      'countryCode',
    ])
    toast.success(`${address.label} address applied`)
  }

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
      fullName: values.fullName,
      phone: values.phone,
      address: values.address,
      addressLine2: values.addressLine2,
      city: values.city,
      province: values.province,
      postalCode: values.postalCode,
      countryCode: values.countryCode,
    })
    setSaveToBook(true)
    toast.success('Address saved to your book')
  }

  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Delivery details</legend>

      {addresses.length > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-2 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Saved addresses
          </p>
          <RadioGroup
            className="grid gap-2"
            onValueChange={(id) => {
              const address = addresses.find((a) => a.id === id)
              if (address) applyAddress(address)
            }}
          >
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-foreground/40"
              >
                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Home className="size-3.5" /> {address.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {address.fullName} · {address.address}, {address.city} {address.postalCode}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <PostalCodeField />
      <CheckoutField
        name="fullName"
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
      <CheckoutField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+62 812 3456 7890" />
      <CheckoutField
        name="address"
        label="Street address"
        className="sm:col-span-2"
        autoComplete="street-address"
        placeholder="Jl. Contoh No. 12"
      />
      <CheckoutField
        name="addressLine2"
        label="Address line 2 (optional)"
        className="sm:col-span-2"
        autoComplete="address-line2"
        placeholder="RT/RW, block, unit"
      />
      <CheckoutField
        name="city"
        label="City"
        autoComplete="address-level2"
        placeholder="Kota / Kabupaten"
      />
      <CheckoutField
        name="province"
        label="Province"
        autoComplete="address-level1"
        placeholder="Provinsi"
      />

      <div className="flex items-center gap-2 sm:col-span-2">
        <Switch
          id="save-to-book"
          checked={saveToBook}
          onCheckedChange={handleSaveToggle}
        />
        <Label htmlFor="save-to-book" className="text-sm text-muted-foreground">
          Save this address to my address book
        </Label>
      </div>

      <p className="text-xs text-muted-foreground sm:col-span-2">
        Your order will be linked to your account email and appear in your profile.
      </p>
    </fieldset>
  )
}
