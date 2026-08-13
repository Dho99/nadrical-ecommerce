import { CheckoutField } from './CheckoutField'

export function StepContact() {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Delivery details</legend>
      <CheckoutField
        name="postalCode"
        label="Postal code"
        autoComplete="postal-code"
        placeholder="97201"
        className="sm:col-span-2"
      />
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
      <CheckoutField name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+1 555 010 2030" />
      <CheckoutField
        name="address"
        label="Street address"
        className="sm:col-span-2"
        autoComplete="street-address"
        placeholder="123 Main Street"
      />
      <CheckoutField name="city" label="City" autoComplete="address-level2" placeholder="Portland" />
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Your order will be linked to your account email and appear in your profile.
      </p>
    </fieldset>
  )
}
