import { CheckoutField } from './CheckoutField'

export function StepPayment() {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Payment details</legend>
      <p className="text-sm text-muted-foreground sm:col-span-2">
        Demo checkout — no card is charged. Use any 16-digit number, e.g. 4242 4242 4242 4242.
      </p>
      <CheckoutField
        name="cardName"
        label="Name on card"
        className="sm:col-span-2"
        autoComplete="cc-name"
        placeholder="A. Lovelace"
      />
      <CheckoutField
        name="cardNumber"
        label="Card number"
        className="sm:col-span-2"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="4242 4242 4242 4242"
        maxLength={19}
      />
      <CheckoutField name="expiry" label="Expiry (MM/YY)" placeholder="08/28" maxLength={5} />
      <CheckoutField name="cvc" label="CVC" inputMode="numeric" placeholder="123" maxLength={4} type="password" />
    </fieldset>
  )
}
