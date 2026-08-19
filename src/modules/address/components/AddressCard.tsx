import { MapPin, Pencil, Star, Trash2 } from 'lucide-react'
import { Badge, Button } from '../../../shared/components/ui'
import type { AddressRecord } from '../types/address.type'

interface AddressCardProps {
  address: AddressRecord
  onEdit: (address: AddressRecord) => void
  onDelete: (address: AddressRecord) => void
  onSetPrimary: (address: AddressRecord) => void
}

export function AddressCard({ address, onEdit, onDelete, onSetPrimary }: AddressCardProps) {
  const addressText = [
    address.address,
    address.addressLine2,
    address.district,
    address.city,
    address.province,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <h3 className="font-display text-base font-semibold tracking-tight">{address.label}</h3>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
            {address.postalCode}
          </Badge>
          {address.isPrimary && (
            <Badge className="font-mono text-[10px] uppercase tracking-wider">Primary</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {address.fullName} · {address.phone}
        </p>
        <p className="text-sm text-muted-foreground">
          {addressText} {address.postalCode} {address.countryCode}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {!address.isPrimary && (
          <Button variant="ghost" size="sm" onClick={() => onSetPrimary(address)}>
            <Star /> Set as primary
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          <Pencil /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(address)}>
          <Trash2 /> Delete
        </Button>
      </div>
    </div>
  )
}