import { z } from 'zod'

export const guestProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(60, 'Nama terlalu panjang'),
  email: z.string().trim().email('Masukkan email valid'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .pipe(
      z
        .string()
        .regex(
          /^(\+62|62|0)8[1-9][0-9]{7,11}$/,
          'Format nomor HP tidak valid (contoh: 08123456789 atau +628123456789)',
        ),
    ),
})

export type GuestProfileInput = z.infer<typeof guestProfileSchema>
