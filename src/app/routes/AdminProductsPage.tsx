import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ProductAdminTable, useAdminProducts } from '../../modules/admin'
import { adminProductService } from '../../modules/admin/services/admin-product.service'
import { CATEGORIES } from '../../shared/constants/product.constants'
import type { ProductCategoryId } from '../../shared/types/product.type'
import {
  Button,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from '../../shared/components/ui'
import type { AdminProductFilters } from '../../modules/admin/types/admin.type'

export function AdminProductsPage() {
  const [query, setQuery] = useState('')
  const [category_id, setCategory] = useState<ProductCategoryId | 'all'>('all')
  const [in_stock_only, setInStockOnly] = useState(false)

  const filters: AdminProductFilters = { query, category_id, in_stock_only }
  const { products, total, pageStart, status, error, refetch, goNext, goPrev } =
    useAdminProducts(filters)

  const handleReset = async () => {
    if (!window.confirm('Reset the entire catalog back to the seed data? All admin changes will be lost.')) {
      return
    }
    try {
      await adminProductService.resetCatalog()
      toast.success('Catalog reset to seed data')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset catalog')
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Store admin · {total} products live
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Products
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw /> Reset catalog
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus /> New product
            </Link>
          </Button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, SKU, summary…"
            aria-label="Search products"
            className="h-9 pl-9"
          />
        </div>
        <Select value={category_id} onValueChange={(v) => setCategory(v as ProductCategoryId | 'all')}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={in_stock_only} onCheckedChange={setInStockOnly} />
          In stock only
        </label>
      </div>

      <Separator className="mb-6" />

      {status === 'success' && products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting the search or filters, or create a new product."
          action={
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus /> New product
              </Link>
            </Button>
          }
        />
      ) : (
        <ProductAdminTable
          products={products}
          status={status}
          error={error}
          onRetry={refetch}
          onDeleted={refetch}
          total={total}
          pageStart={pageStart}
          loading={status === 'loading'}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  )
}