import { formatPrice } from '../../../shared/utils/format'
import { getAuthToken } from '../../../shared/lib/api'
import { orderRepository } from '../../checkout/services/order.repository'
import type { AppNotification } from '../types/notification.type'
import { notificationRepository } from './notification.repository'
import { websocketService } from '../../../shared/lib/websocket'
import { announcementService } from '../../announcements/services/announcement.service'

function now(): string {
  return new Date().toISOString()
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export const notificationService = {
  getStoredNotifications(): AppNotification[] {
    const store = notificationRepository.load()
    return [...store.items].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  },

  async syncNotifications(email: string): Promise<AppNotification[]> {
    const store = notificationRepository.load()
    let changed = false

    try {
      const activeAnnouncements = await announcementService.getActive()
      for (const ann of activeAnnouncements) {
        const id = `ann-${ann.uuid}`
        const exists = store.items.some((item) => item.id === id)
        if (!exists) {
          store.items.push({
            id,
            type: 'announcement',
            title: ann.title,
            content: ann.content,
            created_at: ann.created_at || now(),
            is_read: false,
          })
          changed = true
        }
      }
    } catch {
      // ignore
    }

    if (email && getAuthToken()) {
      try {
        const orders = await orderRepository.list()
        const target = email.toLowerCase()
        const visibleOrders = orders.filter(
          (order) =>
            (order.email ?? '').toLowerCase() === target ||
            (order.user_id ?? '').toLowerCase() === target ||
            !order.email,
        )

        for (const order of visibleOrders) {
        const current = order.status ?? 'pending_payment'
        const last = store.lastStatus[order.order_number]
        const etaDays = order.shipping_method === 'express' ? 1 : 4

        if (!last) {
          store.lastStatus[order.order_number] = current
          changed = true
          if (current === 'processing') {
            const item: AppNotification = {
              id: `order-${order.order_number}`,
              type: 'order',
              title: 'Order confirmed',
              content: `Your order ${order.order_number} is confirmed — ${formatPrice(order.grand_total)} total.`,
              created_at: order.placed_at ?? now(),
              is_read: false,
              order_id: order.order_number,
              user_id: email,
            }
            store.items.push(item)
            websocketService.send({ type: 'notification', payload: item })
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
            const item: AppNotification = {
              id: `order-${order.order_number}-${current}`,
              type: 'order',
              title: msg.title,
              content: msg.content,
              created_at: now(),
              is_read: false,
              order_id: order.order_number,
              user_id: email,
            }
            store.items.push(item)
            websocketService.send({ type: 'notification', payload: item })
          }
          }
        }
      } catch {
        // ignore
      }
    }

    if (changed) notificationRepository.save(store)
    return [...store.items].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  },

  broadcast(title: string, content: string): AppNotification {
    const store = notificationRepository.load()
    const item: AppNotification = {
      id: makeId('ann'),
      type: 'announcement',
      title: title.trim(),
      content: content.trim(),
      created_at: now(),
      is_read: false,
    }
    store.items.push(item)
    notificationRepository.save(store)

    websocketService.send({
      type: 'announcement',
      payload: item,
    })

    return item
  },

  receiveIncoming(item: AppNotification): void {
    const store = notificationRepository.load()
    if (!store.items.some((i) => i.id === item.id)) {
      store.items.push(item)
      notificationRepository.save(store)
    }
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
