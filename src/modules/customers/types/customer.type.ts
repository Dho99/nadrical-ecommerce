export interface Customer {
  id: string
  email: string
  full_name: string
  username?: string
  phone?: string
  avatar_url?: string
  status?: string
  role_name?: string
  created_at?: string
}

export interface CustomerPage {
  items: Customer[]
  total: number
  page: number
  limit: number
}
