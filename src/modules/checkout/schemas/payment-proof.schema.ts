import { z } from 'zod'
import {
  PAYMENT_PROOF_ACCEPTED_TYPES,
  PAYMENT_PROOF_MAX_SIZE_MB,
} from '../constants/payment-proof.constants'

export const paymentProofSchema = z.object({
  amount_paid: z
    .number({ message: 'Nominal transfer wajib diisi' })
    .positive('Nominal transfer harus lebih dari 0'),
  proof: z
    .instanceof(File, { message: 'Lampirkan bukti transfer terlebih dahulu' })
    .refine(
      (file) => PAYMENT_PROOF_ACCEPTED_TYPES.includes(file.type),
      'Format harus JPG, PNG, WebP, atau PDF',
    )
    .refine(
      (file) => file.size <= PAYMENT_PROOF_MAX_SIZE_MB * 1024 * 1024,
      `Ukuran file maksimal ${PAYMENT_PROOF_MAX_SIZE_MB}MB`,
    ),
  note: z
    .string()
    .trim()
    .max(200, 'Catatan maksimal 200 karakter')
    .optional()
    .or(z.literal('')),
})

export type PaymentProofInput = z.infer<typeof paymentProofSchema>
