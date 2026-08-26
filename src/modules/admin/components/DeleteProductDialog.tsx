import { AlertTriangle } from 'lucide-react'
import type { Product } from '../../../shared/types/product.type'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui'

interface DeleteProductDialogProps {
  product: Product | null
  onOpenChange: (open: boolean) => void
  onConfirm: (product: Product) => void
}

export function DeleteProductDialog({ product, onOpenChange, onConfirm }: DeleteProductDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            This will permanently remove the product from the catalog. Storefront pages will update
            immediately.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{product.name}</AlertTitle>
            <AlertDescription>
              {product.sku} · {product.specs.length} specifications — gone forever.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={product === null}
            onClick={() => product && onConfirm(product)}
          >
            Delete product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}