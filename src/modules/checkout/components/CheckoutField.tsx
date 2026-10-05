import { Input } from '../../../shared/components/ui'
import { useRef } from 'react'
import { useInputMask, type MaskType } from '../../../shared/hooks/useInputMask'
import type { CheckoutInput } from '../schemas/checkout.schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../shared/components/ui'

interface CheckoutFieldProps extends React.ComponentProps<typeof Input> {
  name: keyof CheckoutInput
  label: string
  mask?: MaskType
}

export function CheckoutField({ name, label, className, mask, ...inputProps }: CheckoutFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useInputMask(inputRef as React.RefObject<HTMLInputElement>, mask ?? null)

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              ref={(el) => {
                inputRef.current = el as HTMLInputElement
                if (typeof field.ref === 'function') field.ref(el)
                else if (field.ref && typeof field.ref === 'object' && 'current' in field.ref) {
                  (field.ref as React.MutableRefObject<HTMLInputElement | null>).current = el as HTMLInputElement
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
