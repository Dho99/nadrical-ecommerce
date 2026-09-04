import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { voucherService } from '../../modules/voucher/services/voucher.service'
import type { Voucher } from '../../modules/voucher/types/voucher.type'
import { formatPrice } from '../../shared/utils/format'
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

export function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Voucher[]>([])

  const refresh = () => setDiscounts(voucherService.list())

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from localStorage
    refresh()
  }, [])

  const handleDelete = (code: string) => {
    if (!window.confirm(`Delete discount ${code}?`)) return
    voucherService.remove(code)
    toast.success(`Discount ${code} deleted`)
    refresh()
  }

  const handleReset = () => {
    if (!window.confirm('Reset discounts to seed data?')) return
    voucherService.reset()
    toast.success('Discounts reset')
    refresh()
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Store admin · {discounts.length} discounts
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Discounts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw /> Reset
          </Button>
          <Button asChild>
            <Link to="/admin/discounts/new">
              <Plus /> New discount
            </Link>
          </Button>
        </div>
      </header>

      {discounts.length === 0 ? (
        <EmptyState
          icon={<BadgePercent className="size-10" />}
          title="No discounts"
          description="Create a voucher code to give customers a discount."
          action={
            <Button asChild>
              <Link to="/admin/discounts/new">
                <Plus /> New discount
              </Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((d) => (
                <TableRow key={d.code}>
                  <TableCell className="font-mono text-xs font-bold">{d.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {d.type === 'percent' ? `${d.value}%` : formatPrice(d.value)}
                    {d.max_discount ? ` (max ${formatPrice(d.max_discount)})` : ''}
                    {d.code === 'FREESHIP' ? ' — Free shipping' : ''}
                  </TableCell>
                  <TableCell>{d.min_subtotal ? formatPrice(d.min_subtotal) : '—'}</TableCell>
                  <TableCell>
                    {d.active === false ? <Badge variant="destructive">Inactive</Badge> : <Badge variant="secondary">Active</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/admin/discounts/${d.code}/edit`}>
                          <Pencil className="size-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(d.code)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
