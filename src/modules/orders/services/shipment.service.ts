import type { OrderWithItems } from '../types/order.type'
import type { ShipmentEvent, ShipmentInfo } from '../types/shipment.type'

const COURIER_LABEL: Record<string, string> = {
  standard: 'Standard',
  express: 'Express',
  jne: 'JNE REG',
  jnt: 'J&T Express',
  sicepat: 'SiCepat',
}

export const shipmentService = {
  courierLabel(method?: string): string {
    if (!method) return 'Standard'
    return COURIER_LABEL[method.toLowerCase()] ?? COURIER_LABEL[method] ?? 'Standard'
  },

  trackingNumber(order: OrderWithItems): string {
    if (order.tracking_number) return order.tracking_number
    const seed = order.order_number.replace(/\D/g, '') || order.id.replace(/\D/g, '')
    return `RESI${seed.padStart(6, '0')}`
  },

  statusLabel(order: OrderWithItems): string {
    const s = (order.status ?? 'pending_payment').toLowerCase()
    if (s === 'completed' || s === 'delivering') return 'Delivered'
    if (s === 'shipped') return 'In Transit'
    if (s === 'processing' || s === 'paid') return 'Processing'
    return 'Order placed'
  },

  isTrackable(order: OrderWithItems): boolean {
    const s = (order.status ?? '').toLowerCase()
    return s === 'shipped' || s === 'delivering' || s === 'completed'
  },

  events(order: OrderWithItems): ShipmentEvent[] {
    const s = (order.status ?? '').toLowerCase()
    const placed = Date.parse(order.placed_at ?? '') || Date.now()
    const shippedAt = Date.parse(order.shipped_at ?? '') || placed + 6 * 3600_000
    const deliveredAt = Date.parse(order.delivered_at ?? '') || shippedAt + 3 * 86400_000
    const doneStates =
      s === 'completed' || s === 'delivering'
        ? 4
        : s === 'shipped'
          ? 2
          : 0
    const iso = (t: number) => new Date(t).toISOString()

    const base = [
      { title: 'Package received', location: 'Jakarta Hub', time: iso(placed + 3600_000) },
      { title: 'In Transit', location: 'Bekasi Sorting Center', time: iso(shippedAt) },
      { title: 'Out for Delivery', location: 'Jakarta Selatan', time: iso(shippedAt + 8 * 3600_000) },
      { title: 'Delivered', location: 'Destination', time: iso(deliveredAt) },
    ]

    return base.map((e, i) => ({
      id: `evt-${order.id}-${i}`,
      title: e.title,
      location: e.location,
      time: e.time,
      done: i < doneStates,
    }))
  },

  info(order: OrderWithItems): ShipmentInfo {
    return {
      courier: this.courierLabel(order.shipping_method),
      tracking: this.trackingNumber(order),
      statusLabel: this.statusLabel(order),
    }
  },
}
