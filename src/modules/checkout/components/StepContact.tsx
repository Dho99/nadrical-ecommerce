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
import type { UserAddress } from '../../address/types/address.type'

interface StepContactProps {
  email?: string
}

export function StepContact({ email }: StepContactProps) {
  const form = useFormContext<CheckoutInput>()
  const { addresses, addAddress } = useAddressBook(email)
  const [saveToBook, setSaveToBook] = useState(false)

  const applyAddress = (address: UserAddress) => {
    form.setValue('recipient_name', address.recipient_name)
    form.setValue('recipient_phone', address.recipient_phone)
    form.setValue('shipping_address_line_1', address.address_line_1)
    form.setValue('shipping_address_line_2', address.address_line_2 ?? '')
    form.setValue('shipping_city', address.city ?? '')
    form.setValue('shipping_province', address.province ?? '')
    form.setValue('shipping_postal_code', address.postal_code ?? '')
    form.setValue(
      'shipping_country_code',
      (address.country_code ?? 'ID') as CheckoutInput['shipping_country_code'],
    )
    form.trigger([
      'recipient_name',
      'recipient_phone',
      'shipping_address_line_1',
      'shipping_address_line_2',
      'shipping_city',
      'shipping_province',
      'shipping_postal_code',
      'shipping_country_code',
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
                    {address.recipient_name} · {address.address_line_1}, {address.city}{' '}
                    {address.postal_code}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
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
