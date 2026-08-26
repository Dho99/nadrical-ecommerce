import { z } from 'zod'

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Add a label').max(30, 'Label is too long'),
  recipient_name: z
    .string()
    .trim()
    .min(3, 'Enter a full name')
    .max(60, 'Name is too long'),
  recipient_phone: z
    .string()
    .trim()
    .min(8, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s()-]+$/, 'Phone can only contain digits and + - ( )'),
  address_line_1: z
    .string()
    .trim()
    .min(8, 'Enter a complete street address')
    .max(120, 'Address is too long'),
  address_line_2: z
    .string()
    .trim()
    .max(120, 'Address is too long')
    .optional()
    .or(z.literal('')),
  district: z
    .string()
    .trim()
    .min(2, 'Enter the district')
    .max(60, 'District name is too long')
    .optional()
    .or(z.literal('')),
  city: z.string().trim().min(2, 'Enter your city').max(60, 'City name is too long'),
  province: z
    .string()
    .trim()
    .min(2, 'Enter the province')
    .max(60, 'Province name is too long')
    .optional()
    .or(z.literal('')),
  postal_code: z
    .string()
    .trim()
    .min(3, 'Enter a valid postal code')
    .max(12, 'Postal code is too long'),
  country_code: z.enum(['ID', 'US', 'MY', 'SG']).optional(),
  is_primary: z.boolean().optional(),
})

export type AddressSchema = z.infer<typeof addressSchema>
