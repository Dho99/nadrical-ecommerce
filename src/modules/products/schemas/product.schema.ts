import { z } from 'zod'

export const productFiltersSchema = z.object({
  category: z
    .enum(['all', 'electronics', 'apparel', 'home', 'accessories', 'outdoors'])
    .optional(),
  query: z
    .string()
    .trim()
    .max(80, 'Query is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'stock']).optional(),
  inStockOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
export type ProductFiltersRaw = z.input<typeof productFiltersSchema>
