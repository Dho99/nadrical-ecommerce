import { useState } from 'react'
import { MapPinPlus } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { AddressCard, AddressFormDialog, useAddressBook } from '../../modules/address'
import type { UserAddress, AddressSchema } from '../../modules/address'
import { useAuth } from '../../modules/auth'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
} from '../../shared/components/ui'

export function AddressBookPage() {
  const { user } = useAuth()
  const { addresses, addAddress, updateAddress, removeAddress } = useAddressBook(user?.email)
  const [editing, setEditing] = useState<UserAddress | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<UserAddress | null>(null)

  const handleCreate = (values: AddressSchema) => {
    addAddress(values)
    toast.success('Address saved')
  }

  const handleUpdate = (values: AddressSchema) => {
    if (editing) updateAddress(editing.id, values)
    setEditing(null)
    toast.success('Address updated')
  }

  const handleSetPrimary = (address: UserAddress) => {
    const { id, ...rest } = address
    updateAddress(id, { ...rest, is_primary: true })
    toast.success(`${address.label} is now the primary address`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'} — used to
          pre-fill checkout.
        </p>
        <Button onClick={() => setCreating(true)}>
          <MapPinPlus /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPinPlus className="size-10" />}
          title="No saved addresses yet"
          description="Add your first address and checkout will pre-fill automatically."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li key={address.id}>
              <AddressCard
                address={address}
                onEdit={setEditing}
                onDelete={setDeleting}
                onSetPrimary={handleSetPrimary}
              />
            </li>
          ))}
        </ul>
      )}

      <AddressFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Add address"
        submitLabel="Save address"
        onSubmit={handleCreate}
      />

      <AddressFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        defaultValues={
          editing
            ? {
                label: editing.label,
                recipient_name: editing.recipient_name,
                recipient_phone: editing.recipient_phone,
                address_line_1: editing.address_line_1,
                address_line_2: editing.address_line_2,
                district: editing.district,
                city: editing.city,
                province: editing.province,
                postal_code: editing.postal_code,
                country_code: (editing.country_code ?? 'ID') as AddressSchema['country_code'],
                is_primary: editing.is_primary ?? false,
              }
            : undefined
        }
        title="Edit address"
        submitLabel="Save changes"
        onSubmit={handleUpdate}
      />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete address?</DialogTitle>
            <DialogDescription>
              {deleting?.label} — {deleting?.address_line_1}, {deleting?.city}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleting) {
                  removeAddress(deleting.id)
                  toast.success('Address deleted')
                }
                setDeleting(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
