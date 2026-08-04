import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '../../../shared/types/product.type'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui'

interface LowStockListProps {
  products: Product[]
}

export function LowStockList({ products }: LowStockListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low stock</CardTitle>
        <p className="text-sm text-muted-foreground">Products with fewer than 10 units</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {products.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">All products well stocked.</p>
        )}
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 rounded-lg border p-2.5"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="size-10 shrink-0 rounded-md border object-cover"
            />
            <div className="min-w-0 grow">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{product.partNumber}</p>
            </div>
            <Badge variant="destructive">{product.stock} left</Badge>
            <Button asChild variant="ghost" size="sm">
              <Link to={`/admin/products/${product.id}/edit`}>
                <ArrowUpRight className="size-4" />
                <span className="sr-only">Edit {product.name}</span>
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
