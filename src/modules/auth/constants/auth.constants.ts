export const ADMIN_EMAIL = 'admin@store.dev'
export const ADMIN_PASSWORD = 'admin123'

export const SEED_ADMIN = {
  id: 'usr-admin',
  name: 'Store Admin',
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: 'admin',
} as const
