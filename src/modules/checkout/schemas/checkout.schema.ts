import { z } from 'zod'

export const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Enter your full name')
    .max(60, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(8, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s()-]+$/, 'Phone can only contain digits and + - ( )'),
  address: z
    .string()
    .trim()
    .min(8, 'Enter a complete street address')
    .max(120, 'Address is too long'),
  city: z.string().trim().min(2, 'Enter your city').max(60, 'City name is too long'),
  postalCode: z
    .string()
    .trim()
    .min(3, 'Enter a valid postal code')
    .max(12, 'Postal code is too long'),
})

export const shippingSchema = z.object({
  shippingMethod: z.enum(['standard', 'express']),
})

export const paymentSchema = z.object({
  cardName: z.string().trim().min(3, 'Enter the name on the card'),
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format'),
  cvc: z.string().trim().regex(/^\d{3,4}$/, 'CVC is 3 or 4 digits'),
})

export const checkoutSchema = customerSchema
  .merge(shippingSchema)
  .merge(paymentSchema)

export type CustomerInput = z.infer<typeof customerSchema>
export type ShippingInput = z.infer<typeof shippingSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
