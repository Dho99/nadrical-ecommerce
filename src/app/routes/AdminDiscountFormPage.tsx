import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { voucherService } from '../../modules/voucher/services/voucher.service'
import type { Voucher, VoucherType } from '../../modules/voucher/types/voucher.type'
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '../../shared/components/ui'

export function AdminDiscountFormPage() {
  const { code } = useParams<{ code: string }>()
  const isEdit = Boolean(code)
  const navigate = useNavigate()

  const [form, setForm] = useState<Voucher>({
    code: '',
    type: 'percent',
    value: 10,
    description: '',
    active: true,
  })

  useEffect(() => {
    if (code) {
      const existing = voucherService.get(code)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate form from localStorage when editing
      if (existing) setForm(existing)
    }
  }, [code])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = form.code.trim().toUpperCase()
    if (!normalized) {
      toast.error('Code required')
      return
    }
    if (form.type === 'percent' && (form.value < 1 || form.value > 100)) {
      toast.error('Percent must be 1-100')
      return
    }
    try {
      if (isEdit && code) {
        const updated = voucherService.update(code, { ...form, code: normalized })
        if (!updated) throw new Error('Not found')
        toast.success('Discount updated')
      } else {
        voucherService.create({ ...form, code: normalized })
        toast.success('Discount created')
      }
      navigate('/admin/discounts')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/discounts">
          <ArrowLeft /> Back to discounts
        </Link>
      </Button>

      <h1 className="font-display text-3xl font-bold tracking-tight">{isEdit ? 'Edit discount' : 'New discount'}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Voucher codes applied at cart and checkout.</p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="code">Code *</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="NADRICAL20" className="font-mono uppercase" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VoucherType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="fixed">Fixed ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Value *</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} min={0} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Min order ($)</Label>
              <Input type="number" value={form.min_subtotal ?? ''} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" />
            </div>
            {form.type === 'percent' && (
              <div className="grid gap-2">
                <Label>Max discount ($)</Label>
                <Input type="number" value={form.max_discount ?? ''} onChange={(e) => setForm({ ...form, max_discount: e.target.value ? Number(e.target.value) : undefined })} placeholder="No limit" />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="10% off, max $20" />
          </div>

          <div className="grid gap-2">
            <Label>Expires at</Label>
            <Input type="date" value={form.expires_at ? form.expires_at.slice(0,10) : ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.active !== false} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <Label>Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/discounts')}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Save changes' : 'Create discount'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
