import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Package } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { productService } from '../../modules/products/services/product.service'
import type { Product } from '../../shared/types/product.type'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui'
import { ProductImage } from '../../shared/components/ProductImage'

export function AdminPreordersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const all = await productService.getProducts()
    setProducts(all.filter((p) => p.is_preorder))
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    refresh()
  }, [])

  const togglePreorder = async (p: Product) => {
    const next = !p.is_preorder
    await productService.updateProduct(p.id, { is_preorder: next } as unknown as Partial<Product>)
    toast.success(next ? 'Marked as pre-order' : 'Removed from pre-order')
    refresh()
  }

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store admin · {products.length} pre-orders
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Pre-orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Products with stock 0 but orderable for future delivery.</p>
      </header>

      {products.length === 0 ? (
        <EmptyState
          icon={<Clock className="size-10" />}
          title="No pre-orders"
          description="Mark a product as pre-order from the product edit page."
          action={
            <Button asChild>
              <Link to="/admin/products">Go to products</Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.cover_image_url} alt={p.name} className="size-10 rounded-md border bg-muted object-cover" />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{p.sku} · {p.category_id}</p>
                      </div>
                      <Badge className="ml-2 bg-amber-500 text-white">PRE-ORDER</Badge>
                    </div>
                  </TableCell>
                  <TableCell>${p.base_price.toFixed(2)}</TableCell>
                  <TableCell>{p.preorder_eta ? new Date(p.preorder_eta).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => togglePreorder(p)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="flex items-center gap-2 font-medium"><Package className="size-4" /> How pre-order works</p>
        <p className="mt-1 text-muted-foreground">Products marked pre-order can be added to cart even when stock is 0. Orders show ETA at checkout.</p>
      </div>
    </div>
  )
}
