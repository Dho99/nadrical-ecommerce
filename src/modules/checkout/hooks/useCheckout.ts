import { useState } from 'react'
import { useForm, type Path, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutService } from '../services/checkout.service'
import { checkoutSchema, type CheckoutInput } from '../schemas/checkout.schema'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'

export const CHECKOUT_STEPS = [
  { num: '01', label: 'Delivery' },
  { num: '02', label: 'Shipping' },
  { num: '03', label: 'Payment' },
] as const

export type CheckoutStepIndex = 0 | 1 | 2

const STEP_FIELDS: Array<Array<keyof CheckoutInput>> = [
  ['fullName', 'email', 'phone', 'address', 'city', 'postalCode'],
  ['shippingMethod'],
  ['cardName', 'cardNumber', 'expiry', 'cvc'],
]

interface UseCheckoutResult {
  step: CheckoutStepIndex
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  error: string | null
  confirmation: OrderConfirmation | null
  form: ReturnType<typeof useForm<CheckoutInput>>
  next: () => Promise<void>
  back: () => void
  goTo: (index: CheckoutStepIndex) => void
  submit: SubmitHandler<CheckoutInput>
}

export function useCheckout(
  payloadBase: Pick<OrderPayload, 'items' | 'totals'>,
  initialValues: Partial<Pick<CheckoutInput, 'fullName' | 'email'>> = {},
): UseCheckoutResult {
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      shippingMethod: 'standard',
      ...initialValues,
    },
  })
  const [step, setStep] = useState<CheckoutStepIndex>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)

  const isFirstStep = step === 0
  const isLastStep = step === CHECKOUT_STEPS.length - 1

  const next = async () => {
    const fields = STEP_FIELDS[step].map((f) => f as Path<CheckoutInput>)
    const valid = await form.trigger(fields)
    if (!valid) return
    setError(null)
    setStep((prev) => Math.min(prev + 1, CHECKOUT_STEPS.length - 1) as CheckoutStepIndex)
  }

  const back = () => {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 0) as CheckoutStepIndex)
  }

  const goTo = (index: CheckoutStepIndex) => {
    if (index < step) setStep(index)
  }

  const submit: SubmitHandler<CheckoutInput> = async (values) => {
    if (!isLastStep) return
    setIsSubmitting(true)
    setError(null)
    try {
      const payload: OrderPayload = {
        customer: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          addressLine2: values.addressLine2,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode,
          countryCode: values.countryCode,
        },
        shippingMethod: values.shippingMethod,
        payment: {
          cardName: values.cardName,
          cardNumber: values.cardNumber,
          expiry: values.expiry,
          cvc: values.cvc,
        },
        items: payloadBase.items,
        totals: payloadBase.totals,
      }
      const result = await checkoutService.placeOrder(payload)
      setConfirmation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { step, isFirstStep, isLastStep, isSubmitting, error, confirmation, form, next, back, goTo, submit }
}
