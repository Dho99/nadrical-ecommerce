import * as React from 'react'
import { Input } from './input'
import { useInputMask, type MaskType } from '../../hooks/useInputMask'

export const MaskedInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { mask?: MaskType }
>((props, ref) => {
  const { mask, ...rest } = props
  const innerRef = React.useRef<HTMLInputElement>(null)
  useInputMask(innerRef as React.RefObject<HTMLInputElement>, mask ?? null)

  const setRef = (el: HTMLInputElement | null) => {
    innerRef.current = el
    if (typeof ref === 'function') {
      ref(el)
    } else if (ref) {
      ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = el
    }
  }

  return <Input {...rest} ref={setRef} />
})
MaskedInput.displayName = 'MaskedInput'