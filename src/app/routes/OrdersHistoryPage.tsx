import { OrderHistoryList, useOrderHistory } from '../../modules/profile'
import { useAuth } from '../../modules/auth'

export function OrdersHistoryPage() {
  const { user } = useAuth()
  const { orders, status, error, refetch } = useOrderHistory(user?.email ?? null)

  return <OrderHistoryList orders={orders} status={status} error={error} onRetry={refetch} />
}
