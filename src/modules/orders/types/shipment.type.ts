export interface ShipmentEvent {
  id: string
  title: string
  location?: string
  time?: string
  done: boolean
}

export interface ShipmentInfo {
  courier: string
  tracking: string
  statusLabel: string
}
