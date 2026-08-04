import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ImageIcon, Minus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORY_LABEL } from '../../../shared/constants/product.constants'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product } from '../../../shared/types/product.type'
import { formatQty } from '../../../shared/utils/format'
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui'
import { adminProductService } from '../services/admin-product.service'
import { DeleteProductDialog } from './DeleteProductDialog'
import { ListPagination } from './ListPagination'

function Thumb({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }
  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-12 w-12 shrink-0 rounded-md border object-cover"
    />
  )
}

interface ProductAdminTableProps {
  products: Product[]
  status: AsyncStatus
  error: string | null
  onRetry: () => void
  onDeleted: () => void
  total?: number
  pageStart?: number
  loading?: boolean
  onPrev?: () => void
  onNext?: () => void
}

export function ProductAdminTable({
  products,
  status,
  error,
  onRetry,
  onDeleted,
  total,
  pageStart = 1,
  loading = false,
  onPrev,
  onNext,
}: ProductAdminTableProps) {
  const [pending, setPending] = useState<Product | null>(null)

  const handleDelete = async (product: Product) => {
    try {
      await adminProductService.deleteProduct(product.id)
      toast.success(`${product.name} deleted`)
      setPending(null)
      onDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-14 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/5" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {status === 'success' &&
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb product={product} />
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium">{product.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{product.partNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{CATEGORY_LABEL[product.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${product.price.toLocaleString('en-US')}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Out</Badge>
                    ) : (
                      <span className="text-muted-foreground">{formatQty(product.stock)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.badge ? <Badge variant="secondary">{product.badge}</Badge> : <Minus className="h-4 w-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPending(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {total !== undefined && onPrev && onNext && (
          <ListPagination
            pageStart={pageStart}
            pageEnd={pageStart + products.length - 1}
            total={total}
            loading={loading}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </div>

      <DeleteProductDialog
        product={pending}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        onConfirm={handleDelete}
      />
    </>
  )
}