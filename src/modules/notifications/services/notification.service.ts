import { formatPrice } from '../../../shared/utils/format'
import { orderRepository } from '../../checkout/services/order.repository'
import { SEED_ANNOUNCEMENTS } from '../constants/notification.constants'
import type { AppNotification } from '../types/notification.type'
import { notificationRepository } from './notification.repository'

function now(): string {
  return new Date().toISOString()
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export const notificationService = {
  syncNotifications(email: string): AppNotification[] {
    const store = notificationRepository.load()
    let changed = false

    if (store.items.length === 0 && Object.keys(store.lastStatus).length === 0) {
      SEED_ANNOUNCEMENTS.forEach((a, i) => {
        store.items.push({ ...a, id: `ann-seed-${i}`, created_at: now(), is_read: false })
      })
      changed = true
    }

    const orders = orderRepository
      .list()
      .filter((o) => (o.user_id ?? '').toLowerCase() === email.toLowerCase())

    for (const order of orders) {
      const current = order.status ?? 'pending_payment'
      const last = store.lastStatus[order.order_number]
      const etaDays = order.shipping_method === 'express' ? 1 : 4

      if (!last) {
        store.lastStatus[order.order_number] = current
        changed = true
        if (current === 'processing') {
          store.items.push({
            id: `order-${order.order_number}`,
            type: 'order',
            title: 'Order confirmed',
            content: `Your order ${order.order_number} is confirmed — ${formatPrice(order.grand_total)} total.`,
            created_at: order.placed_at ?? now(),
            is_read: false,
            order_id: order.order_number,
            user_id: email,
          })
        }
        continue
      }

      if (last !== current) {
        store.lastStatus[order.order_number] = current
        changed = true
        const messages: Record<string, { title: string; content: string }> = {
          paid: {
            title: 'Payment received',
            content: `Your payment for ${order.order_number} has been confirmed.`,
          },
          processing: {
            title: 'Order processing',
            content: `Your order ${order.order_number} is being prepared for shipment.`,
          },
          shipped: {
            title: 'Order shipped',
            content: `Your order ${order.order_number} has shipped — ETA ${etaDays} ${etaDays === 1 ? 'day' : 'days'}.`,
          },
          completed: {
            title: 'Order delivered',
            content: `Your order ${order.order_number} was delivered. Enjoy!`,
          },
          cancelled: {
            title: 'Order cancelled',
            content: `Your order ${order.order_number} has been cancelled.`,
          },
          refunded: {
            title: 'Refund issued',
            content: `A refund for order ${order.order_number} has been issued.`,
          },
        }
        const msg = messages[current]
        if (msg) {
          store.items.push({
            id: `order-${order.order_number}-${current}`,
            type: 'order',
            title: msg.title,
            content: msg.content,
            created_at: now(),
            is_read: false,
            order_id: order.order_number,
            user_id: email,
          })
        }
      }
    }

    if (changed) notificationRepository.save(store)
    return [...store.items].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  },

  broadcast(title: string, content: string): void {
    const store = notificationRepository.load()
    store.items.push({
      id: makeId('ann'),
      type: 'announcement',
      title: title.trim(),
      content: content.trim(),
      created_at: now(),
      is_read: false,
    })
    notificationRepository.save(store)
  },

  markRead(id: string): void {
    const store = notificationRepository.load()
    const item = store.items.find((i) => i.id === id)
    if (item && !item.is_read) {
      item.is_read = true
      notificationRepository.save(store)
    }
  },

  markAllRead(): void {
    const store = notificationRepository.load()
    let changed = false
    for (const item of store.items) {
      if (!item.is_read) {
        item.is_read = true
        changed = true
      }
    }
    if (changed) notificationRepository.save(store)
  },

  clearAll(): void {
    const store = notificationRepository.load()
    store.items = []
    notificationRepository.save(store)
  },
}
