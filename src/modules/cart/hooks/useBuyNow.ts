import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import type { ProductBrief } from '../../../shared/types/product.type'
import { useCartStore } from './useCart'

export function useBuyNow() {
  const { isAuthed } = useAuth()
  const navigate = useNavigate()
  const add = useCartStore((s) => s.add)

  return {
    buyNow: (product: ProductBrief, qty?: number) => {
      add(product, qty)
      if (!isAuthed) {
        navigate('/login', { state: { from: '/checkout' } })
        return
      }
      navigate('/checkout')
    },
  }
}