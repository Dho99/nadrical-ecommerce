import { useState } from 'react'
import { useForm, type Path, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutService } from '../services/checkout.service'
import { checkoutSchema, type CheckoutInput } from '../schemas/checkout.schema'
import type { OrderConfirmation, OrderPayload, PaymentDetail } from '../types/checkout.type'
import { useVoucher } from '../../voucher/hooks/useVoucher'
import { shippingService } from '../services/shipping.service'
import { paymentService } from '../services/payment.service'
import { useCheckoutRuntime } from './useCheckoutRuntime'

export const CHECKOUT_STEPS = [
  { num: '01', label: 'Delivery' },
  { num: '02', label: 'Shipping' },
  { num: '03', label: 'Payment' },
] as const

export type CheckoutStepIndex = 0 | 1 | 2

const STEP_FIELDS: Array<Array<keyof CheckoutInput>> = [
  [
    'recipient_name',
    'email',
    'recipient_phone',
    'shipping_address_line_1',
    'shipping_city',
    'shipping_postal_code',
  ],
  ['shipping_method'],
  ['card_name', 'card_number', 'expiry', 'cvc'],
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
  initialValues: Partial<Pick<CheckoutInput, 'recipient_name' | 'email'>> = {},
): UseCheckoutResult {
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as unknown as Resolver<CheckoutInput>,
    mode: 'onTouched',
    defaultValues: {
      shipping_method: 'standard',
      payment_method: 'card',
      ...initialValues,
    },
  })
  const [step, setStep] = useState<CheckoutStepIndex>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)
  const { applied, discount } = useVoucher()
  const shippingMethod = useCheckoutRuntime((s) => s.shippingMethod)
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)

  const isFirstStep = step === 0
  const isLastStep = step === CHECKOUT_STEPS.length - 1

  const fieldsForStep = (): Array<keyof CheckoutInput> => {
    if (step !== 2) return STEP_FIELDS[step]
    const method = (form.getValues('payment_method') ?? 'card') as CheckoutInput['payment_method']
    return method === 'card'
      ? [...STEP_FIELDS[2], 'payment_method']
      : ['payment_method']
  }

  const next = async () => {
    const fields = fieldsForStep().map((f) => f as Path<CheckoutInput>)
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
      const subtotal = payloadBase.totals.subtotal
      const quote = shippingService.quote(shippingMethod, subtotal)
      const voucherDiscount = applied ? discount(subtotal, quote.cost) : 0
      const paymentFee = paymentService.fee(paymentKind, subtotal)
      const grandTotal = Math.max(
        0,
        subtotal - voucherDiscount + quote.cost + paymentFee,
      )

      const payment: PaymentDetail = {
        kind: values.payment_method ?? paymentKind,
        provider:
          values.payment_provider ||
          useCheckoutRuntime.getState().paymentProvider ||
          undefined,
      }
      if (payment.kind === 'card') {
        payment.card_name = values.card_name
        payment.card_number = values.card_number
        payment.expiry = values.expiry
        payment.cvc = values.cvc
      }

      const payload: OrderPayload = {
        customer: {
          recipient_name: values.recipient_name,
          email: values.email,
          recipient_phone: values.recipient_phone,
          shipping_address_line_1: values.shipping_address_line_1,
          shipping_address_line_2: values.shipping_address_line_2,
          shipping_city: values.shipping_city,
          shipping_province: values.shipping_province,
          shipping_postal_code: values.shipping_postal_code,
          shipping_country_code: values.shipping_country_code,
        },
        shipping_method: shippingMethod,
        payment,
        items: payloadBase.items,
        totals: {
          subtotal,
          shipping_total: quote.cost,
          discount: voucherDiscount,
          payment_fee: paymentFee,
          voucher_code: applied?.code,
          grand_total: grandTotal,
        },
        voucher_code: applied?.code,
      }
      const result = await checkoutService.placeOrder(payload)
      setConfirmation(result)
      useCheckoutRuntime.getState().reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { step, isFirstStep, isLastStep, isSubmitting, error, confirmation, form, next, back, goTo, submit }
}
