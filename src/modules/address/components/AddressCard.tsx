import { MapPin, Pencil, Star, Trash2 } from 'lucide-react'
import { Badge, Button } from '../../../shared/components/ui'
import type { UserAddress } from '../types/address.type'

interface AddressCardProps {
  address: UserAddress
  onEdit: (address: UserAddress) => void
  onDelete: (address: UserAddress) => void
  onSetPrimary: (address: UserAddress) => void
}

export function AddressCard({ address, onEdit, onDelete, onSetPrimary }: AddressCardProps) {
  const addressText = [
    address.address_line_1,
    address.address_line_2,
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
            {address.postal_code}
          </Badge>
          {address.is_primary && (
            <Badge className="font-mono text-[10px] uppercase tracking-wider">Primary</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {address.recipient_name} · {address.recipient_phone}
        </p>
        <p className="text-sm text-muted-foreground">
          {addressText} {address.postal_code} {address.country_code}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {!address.is_primary && (
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
