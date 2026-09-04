import { BadgePercent, Clock, LayoutDashboard, MessageSquare, Package, Receipt, type LucideIcon } from 'lucide-react'
import { unsplashUrl } from '../../../shared/utils/unsplash'

export const ADMIN_NAV_ITEMS: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/discounts', label: 'Discounts', icon: BadgePercent },
  { to: '/admin/preorders', label: 'Pre-orders', icon: Clock },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
  { to: '/admin/chat', label: 'Chat', icon: MessageSquare },
]

export function adminPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/products/new')) return 'New product'
  if (pathname.startsWith('/admin/products/')) return 'Edit product'
  const match = ADMIN_NAV_ITEMS.find((item) => pathname.startsWith(item.to))
  if (match) return match.label
  return 'Store Admin'
}

export interface PresetImage {
  id: string
  label: string
  url: string
}

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'headphones', label: 'Headphones', url: unsplashUrl('photo-1505740420928-5e560c06d30e') },
  { id: 'smartwatch', label: 'Smart watch', url: unsplashUrl('photo-1523275335684-37898b6baf30') },
  { id: 'backpack', label: 'Backpack', url: unsplashUrl('photo-1553062407-98eeb64c6a62') },
  { id: 'sunglasses', label: 'Sunglasses', url: unsplashUrl('photo-1572635196237-14b3f281503f') },
  { id: 'hoodie', label: 'Hoodie', url: unsplashUrl('photo-1556821840-3a63f95609a7') },
  { id: 'sneakers', label: 'Sneakers', url: unsplashUrl('photo-1542291026-7eec264c27ff') },
  { id: 'sofa', label: 'Sofa', url: unsplashUrl('photo-1555041469-a586c61ea9bc') },
  { id: 'tent', label: 'Tent', url: unsplashUrl('photo-1504280390367-361c6d9f38f4') },
  { id: 'camera', label: 'Camera', url: unsplashUrl('photo-1526170375885-4d8ecf77b99f') },
  { id: 'bottle', label: 'Bottle', url: unsplashUrl('photo-1602143407151-7111542de6e8') },
]

export const MAX_SPECS = 10
export const MAX_VARIANTS = 10