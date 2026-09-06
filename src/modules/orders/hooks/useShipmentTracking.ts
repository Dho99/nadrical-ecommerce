import { useMemo } from 'react'
import { shipmentService } from '../services/shipment.service'
import type { OrderWithItems } from '../types/order.type'
import type { ShipmentEvent, ShipmentInfo } from '../types/shipment.type'

export function useShipmentTracking(order: OrderWithItems | null) {
  const trackable = order ? shipmentService.isTrackable(order) : false
  const info: ShipmentInfo | null = useMemo(
    () => (trackable && order ? shipmentService.info(order) : null),
    [order, trackable],
  )
  const events: ShipmentEvent[] = useMemo(
    () => (order ? shipmentService.events(order) : []),
    [order],
  )

  return { trackable, info, events }
}
