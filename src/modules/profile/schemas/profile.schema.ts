import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name is too long'),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone number is too long')
      .regex(/^[+\d\s()-]*$/, 'Phone can only contain digits and + - ( )')
      .optional()
      .or(z.literal('')),
    currentPassword: z.string().optional().or(z.literal('')),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine((v) => !v.newPassword || !!v.currentPassword, {
    message: 'Enter your current password to set a new one',
    path: ['currentPassword'],
  })

export type ProfileInput = z.infer<typeof profileSchema>
