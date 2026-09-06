import { z } from 'zod'

export const REFUND_REASONS = [
  'Product damaged',
  'Wrong item received',
  'Item not as expected',
  'Size issue',
  'Other',
] as const

export const refundRequestSchema = z.object({
  reason: z.enum(REFUND_REASONS, { message: 'Select a refund reason' }),
  note: z
    .string()
    .trim()
    .max(500, 'Note is too long')
    .optional()
    .or(z.literal('')),
})

export type RefundInput = z.infer<typeof refundRequestSchema>
