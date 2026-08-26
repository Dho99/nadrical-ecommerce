import type { LucideIcon } from 'lucide-react'
import { Armchair, Shirt, Smartphone, Tent, Watch } from 'lucide-react'

export interface HeroCalloutConfig {
  num: string
  role: string
  sku: string
}

export const HERO_STATS: Array<{ value: string; label: string }> = [
  { value: '24k+', label: 'Products available' },
  { value: '48h', label: 'Dispatch window' },
  { value: '30-day', label: 'Free returns' },
]

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronics: Smartphone,
  apparel: Shirt,
  home: Armchair,
  accessories: Watch,
  outdoors: Tent,
}