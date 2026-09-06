import { z } from 'zod'
import type { PaymentKind } from '../types/checkout.type'

export const customerSchema = z.object({
  recipient_name: z
    .string()
    .trim()
    .min(3, 'Enter your full name')
    .max(60, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  recipient_phone: z
    .string()
    .trim()
    .min(8, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s()-]+$/, 'Phone can only contain digits and + - ( )'),
  shipping_address_line_1: z
    .string()
    .trim()
    .min(8, 'Enter a complete street address')
    .max(120, 'Address is too long'),
  shipping_address_line_2: z
    .string()
    .trim()
    .max(120, 'Address is too long')
    .optional()
    .or(z.literal('')),
  shipping_city: z.string().trim().min(2, 'Enter your city').max(60, 'City name is too long'),
  shipping_province: z
    .string()
    .trim()
    .min(2, 'Enter the province')
    .max(60, 'Province name is too long')
    .optional()
    .or(z.literal('')),
  shipping_postal_code: z
    .string()
    .trim()
    .min(3, 'Enter a valid postal code')
    .max(12, 'Postal code is too long'),
  shipping_country_code: z.enum(['ID', 'US', 'MY', 'SG']).optional(),
})

export const shippingSchema = z.object({
  shipping_method: z.enum(['standard', 'express', 'jne', 'jnt', 'sicepat']),
})

export const cardSchema = z.object({
  card_name: z.string().trim().min(3, 'Enter the name on the card'),
  card_number: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format'),
  cvc: z.string().trim().regex(/^\d{3,4}$/, 'CVC is 3 or 4 digits'),
})

export const paymentMethodSchema = z.object({
  payment_method: z.enum(['bank', 'e-money', 'card'] as const).default('card'),
  payment_provider: z.string().trim().optional(),
})

export const checkoutSchema = customerSchema
  .merge(shippingSchema)
  .merge(paymentMethodSchema)
  .merge(cardSchema.partial())
  .superRefine((data, ctx) => {
    if (data.payment_method === 'card') {
      const card = cardSchema.safeParse(data)
      if (!card.success) {
        for (const issue of card.error.issues) {
          ctx.addIssue({ ...issue, path: [...issue.path] })
        }
      }
    }
  })

export type CustomerInput = z.infer<typeof customerSchema>
export type ShippingInput = z.infer<typeof shippingSchema>
export type CardInput = z.infer<typeof cardSchema>
export type PaymentMethodKind = PaymentKind
export type CheckoutInput = z.infer<typeof checkoutSchema>
