import { orderStatus } from '../../../shared/utils/order-status'
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
        store.items.push({ ...a, id: `ann-seed-${i}`, createdAt: now(), read: false })
      })
      changed = true
    }

    const orders = orderRepository
      .list()
      .filter((o) => o.email.toLowerCase() === email.toLowerCase())

    for (const order of orders) {
      const current = orderStatus(order.placedAt)
      const last = store.lastStatus[order.orderNumber]

      if (!last) {
        store.lastStatus[order.orderNumber] = current
        changed = true
        if (current === 'Processing') {
          store.items.push({
            id: `order-${order.orderNumber}`,
            type: 'order',
            title: 'Order confirmed',
            message: `Your order ${order.orderNumber} is confirmed — ${formatPrice(order.total)} total.`,
            createdAt: order.placedAt,
            read: false,
            orderNumber: order.orderNumber,
            email,
          })
        }
        continue
      }

      if (last !== current) {
        store.lastStatus[order.orderNumber] = current
        changed = true
        store.items.push({
          id: `order-${order.orderNumber}-${current.toLowerCase()}`,
          type: 'order',
          title: current === 'Shipped' ? 'Order shipped' : 'Order delivered',
          message:
            current === 'Shipped'
              ? `Your order ${order.orderNumber} has shipped — ETA ${order.etaDays} ${order.etaDays === 1 ? 'day' : 'days'}.`
              : `Your order ${order.orderNumber} was delivered. Enjoy!`,
          createdAt: now(),
          read: false,
          orderNumber: order.orderNumber,
          email,
        })
      }
    }

    if (changed) notificationRepository.save(store)
    return [...store.items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  },

  broadcast(title: string, message: string): void {
    const store = notificationRepository.load()
    store.items.push({
      id: makeId('ann'),
      type: 'announcement',
      title: title.trim(),
      message: message.trim(),
      createdAt: now(),
      read: false,
    })
    notificationRepository.save(store)
  },

  markRead(id: string): void {
    const store = notificationRepository.load()
    const item = store.items.find((i) => i.id === id)
    if (item && !item.read) {
      item.read = true
      notificationRepository.save(store)
    }
  },

  markAllRead(): void {
    const store = notificationRepository.load()
    let changed = false
    for (const item of store.items) {
      if (!item.read) {
        item.read = true
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