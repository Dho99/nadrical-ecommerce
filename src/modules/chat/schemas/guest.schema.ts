import { z } from 'zod'

export const guestProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(60, 'Nama terlalu panjang'),
  email: z.string().trim().email('Masukkan email valid'),
  phone: z
    .string()
    .trim()
    .min(8, 'Nomor HP minimal 8 digit')
    .max(20, 'Nomor HP terlalu panjang')
    .regex(/^\+?[0-9\s-]+$/, 'Nomor HP hanya angka, spasi, atau + -'),
})

export type GuestProfileInput = z.infer<typeof guestProfileSchema>
