import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '../../../shared/components/ui'
import type { CheckoutInput } from '../schemas/checkout.schema'

interface CheckoutFieldProps extends React.ComponentProps<typeof Input> {
  name: keyof CheckoutInput
  label: string
}

export function CheckoutField({ name, label, className, ...inputProps }: CheckoutFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...inputProps} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
