import type { OrderWithItems } from '../types/order.type'
import type { ShipmentEvent, ShipmentInfo } from '../types/shipment.type'

const COURIER_LABEL: Record<string, string> = {
  standard: 'JNE Standard',
  express: 'JNE Express',
  jne: 'JNE Standard',
  jnt: 'J&T Express',
  sicepat: 'SiCepat',
}

export const shipmentService = {
  courierLabel(method?: string): string {
    if (!method) return 'Standard'
    const key = method.toLowerCase()
    return COURIER_LABEL[key] ?? method
  },

  trackingNumber(order: OrderWithItems): string {
    return order.tracking_number?.trim() || ''
  },

  trackingUrl(courier?: string, trackingNumber?: string): string | null {
    if (!trackingNumber || !trackingNumber.trim()) return null
    const c = (courier || '').toLowerCase()
    if (c.includes('jne')) return 'https://www.jne.co.id/id/tracking/trace'
    if (c.includes('sicepat')) return 'https://www.sicepat.com/checkAwb'
    if (c.includes('j&t') || c.includes('jnt')) return 'https://www.jet.co.id/track'
    return `https://cekresi.com/?noresi=${encodeURIComponent(trackingNumber.trim())}`
  },

  statusLabel(order: OrderWithItems): string {
    const s = (order.status ?? 'pending_payment').toLowerCase()
    if (s === 'completed' || s === 'delivering') return 'Delivered'
    if (s === 'shipped') return 'In Transit'
    if (s === 'processing' || s === 'paid') return 'Processing'
    return 'Order placed'
  },

  isTrackable(order: OrderWithItems): boolean {
    return Boolean(order.tracking_number?.trim())
  },

  events(order: OrderWithItems): ShipmentEvent[] {
    const events: ShipmentEvent[] = []
    if (order.placed_at) {
      events.push({ id: `placed-${order.id}`, title: 'Order placed', location: '', time: order.placed_at, done: true })
    }
    if (order.shipped_at || order.tracking_number) {
      events.push({
        id: `shipped-${order.id}`,
        title: 'Package handed to courier',
        location: '',
        time: order.shipped_at || order.placed_at || '',
        done: true,
      })
    }
    if (order.delivered_at) {
      events.push({
        id: `delivered-${order.id}`,
        title: 'Delivered',
        location: '',
        time: order.delivered_at,
        done: true,
      })
    }
    return events
  },

  info(order: OrderWithItems): ShipmentInfo {
    return {
      courier: this.courierLabel(order.shipping_courier || order.shipping_method),
      tracking: this.trackingNumber(order),
      statusLabel: this.statusLabel(order),
    }
  },
}
