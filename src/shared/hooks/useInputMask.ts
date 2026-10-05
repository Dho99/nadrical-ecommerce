import { useEffect } from 'react'
// @ts-expect-error no types for inputmask
import Inputmask from 'inputmask'

export type MaskType = 'phone' | 'currency'

export function useInputMask(
  ref: React.RefObject<HTMLInputElement>,
  type: MaskType | null,
) {
  useEffect(() => {
    if (!ref.current || !type) return
    if (type === 'phone') {
      Inputmask({
        mask: '+62 999 9999 9999',
        placeholder: '',
        showMaskOnHover: false,
        showMaskOnFocus: true,
      }).mask(ref.current)
    } else if (type === 'currency') {
      Inputmask({
        alias: 'currency',
        prefix: 'Rp ',
        groupSeparator: '.',
        radixPoint: ',',
        autoUnmask: true,
        rightAlign: false,
        placeholder: '0',
        allowMinus: false,
      }).mask(ref.current)
    }
  }, [ref, type])
}
