export const ADMIN_EMAIL = 'admin@nadrical.my.id'
export const ADMIN_PASSWORD = 'Admin123#'

export const SEED_ADMIN = {
  id: 'usr-admin',
  name: 'Store Superadmin',
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: 'admin',
} as const

// Legacy / Quick dev demo fallback
export const DEV_ADMIN_EMAIL = 'admin@store.dev'
export const DEV_ADMIN_PASSWORD = 'admin123'
