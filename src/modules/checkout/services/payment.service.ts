import type { GatewayPaymentMethod } from './order.repository'
import { gatewayPaymentFee } from '../utils/gateway'

export const paymentService = {
  fee(method: GatewayPaymentMethod | null | undefined, subtotal: number): number {
    return gatewayPaymentFee(method, subtotal)
  },
}
