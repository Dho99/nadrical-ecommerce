import { z } from 'zod'

export const productFiltersSchema = z.object({
  category_id: z
    .enum(['all', 'electronics', 'apparel', 'home', 'accessories', 'outdoors'])
    .optional(),
  query: z
    .string()
    .trim()
    .max(80, 'Query is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'stock']).optional(),
  in_stock_only: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  min_price: z.coerce.number().min(0).max(100000).optional(),
  max_price: z.coerce.number().min(0).max(100000).optional(),
  specs: z
    .string()
    .transform((v) => {
      try {
        const parsed = JSON.parse(v) as Record<string, string[]>
        if (parsed && typeof parsed === 'object') return parsed
        return undefined
      } catch {
        return undefined
      }
    })
    .optional(),
  discount_only: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
export type ProductFiltersRaw = z.input<typeof productFiltersSchema>
