import { z } from 'zod'
import { CATEGORY_LABEL } from '../../../shared/constants/product.constants'

const badgeOptions = ['NEW', 'SALE', 'BEST SELLER'] as const

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long (max 120)'),
  category_id: z.enum(
    ['electronics', 'apparel', 'home', 'accessories', 'outdoors'],
    { message: 'Choose a category' },
  ),
  base_price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine((v) => Number.isFinite(Number(v)), 'Price must be a number')
    .refine((v) => Number(v) > 0, 'Price must be greater than 0')
    .refine((v) => Number(v) <= 9999999, 'Price is too large'),
  stock: z
    .string()
    .trim()
    .min(1, 'Stock is required')
    .refine((v) => Number.isInteger(Number(v)), 'Stock must be a whole number')
    .refine((v) => Number(v) >= 0, 'Stock cannot be negative'),
  cover_image_url: z
    .string()
    .trim()
    .url('Enter a valid image URL'),
  badge: z.enum(badgeOptions).or(z.literal('')),
  is_featured: z.boolean(),
  is_preorder: z.boolean(),
  preorder_eta: z.string().trim().optional().or(z.literal('')),
  preorder_deposit: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), 'Deposit must be 0 or more'),
  summary: z
    .string()
    .trim()
    .min(10, 'Summary must be at least 10 characters')
    .max(600, 'Summary is too long (max 600)'),
  specs: z
    .array(
      z
        .object({
          spec_name: z.string().trim().max(40, 'Label is too long'),
          spec_value: z.string().trim().max(200, 'Value is too long'),
        })
        .superRefine((spec, ctx) => {
          const { spec_name, spec_value } = spec
          if ((spec_name || spec_value) && (!spec_name || !spec_value)) {
            ctx.addIssue({
              code: 'custom',
              path: ['spec_value'],
              message: 'Fill in both label and value',
            })
          }
        }),
    )
    .max(10, 'Up to 10 specifications allowed'),
  variants: z
    .array(
      z
        .object({
          id: z.string().optional(),
          variant_name: z.string().trim().max(40, 'Variant name is too long'),
          price_delta: z
            .string()
            .trim()
            .refine(
              (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0),
              'Price delta must be 0 or more',
            ),
          stock: z
            .string()
            .trim()
            .refine(
              (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
              'Stock must be a whole number ≥ 0',
            ),
        })
        .superRefine((variant, ctx) => {
          if (variant.variant_name.trim() && !variant.stock.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['stock'],
              message: 'Stock is required',
            })
          }
        }),
    )
    .max(10, 'Up to 10 variants allowed'),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormOutput = z.output<typeof productFormSchema>

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([id, label]) => ({ id, label }))
