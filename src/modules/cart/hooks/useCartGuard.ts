import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import type { ProductBrief } from '../../../shared/types/product.type'
import { useCartStore } from './useCart'

export function useGuardedAdd() {
  const { isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const add = useCartStore((s) => s.add)
  const qtyOf = useCartStore((s) => s.qtyOf)

  return {
    add: (product: ProductBrief, qty?: number) => {
      if (!isAuthed) {
        navigate('/login', { state: { from: location.pathname } })
        return
      }
      add(product, qty)
    },
    qtyOf,
  }
}
