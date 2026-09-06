import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Film, ImagePlus, LoaderCircle, PackageOpen, Trash2 } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import {
  Button,
  Card,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import { refundRequestSchema, REFUND_REASONS, type RefundInput } from '../schemas/refund.schema'
import { refundService } from '../services/refund.service'
import type { OrderWithItems } from '../types/order.type'
import type { RefundProof, RefundRecord } from '../types/refund.type'

interface RefundRequestFormProps {
  order: OrderWithItems
  onSubmitted: (record: RefundRecord) => void
}

export function RefundRequestForm({ order, onSubmitted }: RefundRequestFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [proofs, setProofs] = useState<RefundProof[]>([])
  const form = useForm<RefundInput>({
    resolver: zodResolver(refundRequestSchema),
    mode: 'onTouched',
    defaultValues: { note: '' },
  })
  const reason = useWatch({ control: form.control, name: 'reason' })

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const list: RefundProof[] = []
    for (const file of Array.from(files)) {
      const kind: RefundProof['kind'] = file.type.startsWith('video') ? 'video' : 'image'
      list.push({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
      })
    }
    setProofs((prev) => [...prev, ...list])
  }

  const removeProof = (id: string) => {
    setProofs((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const submit = form.handleSubmit((values) => {
    setSubmitting(true)
    const record = refundService.request({
      orderId: order.id,
      orderNumber: order.order_number,
      reason: values.reason,
      note: values.note || undefined,
      proofs,
    })
    setSubmitting(false)
    onSubmitted(record)
    toast.success('Refund request submitted')
  })

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="space-y-6">
        <Card className="p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Step 1 · Order information
          </h3>
          <p className="mt-2 font-display text-lg font-bold tracking-tight">{order.order_number}</p>
          <ul className="mt-3 divide-y">
            {order.order_items.map((line, i) => (
              <li key={`${line.id}-${i}`} className="flex items-center gap-3 py-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <PackageOpen className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.product_name_snapshot}</p>
                  <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                </div>
                <span className="font-mono text-sm font-semibold">{formatPrice(line.line_total)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Step 2 · Refund reason
          </h3>
          <FormField
            name="reason"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel className="sr-only">Refund reason</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2">
                    {REFUND_REASONS.map((option) => {
                      const selected = field.value === option
                      return (
                        <div
                          key={option}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all',
                            selected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/40',
                          )}
                        >
                          <RadioGroupItem value={option} id={`refund-${option}`} />
                          <label
                            htmlFor={`refund-${option}`}
                            className={cn(
                              'flex-1 cursor-pointer text-sm',
                              selected ? 'font-semibold text-primary' : 'font-medium',
                            )}
                          >
                            {option}
                          </label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Step 3 · Additional note
          </h3>
          <FormField
            name="note"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel className="sr-only">Note (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Explain your problem (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Step 4 · Upload proof (optional)
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add photos or videos as evidence. Files stay in this session until the request is sent.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5">
              <ImagePlus className="size-4" /> Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5">
              <Film className="size-4" /> Video
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          {proofs.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {proofs.map((proof) => (
                <li key={proof.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                  {proof.kind === 'image' ? (
                    <img src={proof.preview} alt={proof.name} className="aspect-video w-full object-cover" />
                  ) : (
                    <video src={proof.preview} muted className="aspect-video w-full object-cover" />
                  )}
                  <div className="flex items-center gap-1 bg-background/90 px-2 py-1 text-[11px] backdrop-blur">
                    {proof.kind === 'image' ? <Camera className="size-3" /> : <Film className="size-3" />}
                    <span className="truncate">{proof.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${proof.name}`}
                      onClick={() => removeProof(proof.id)}
                      className="ml-auto rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            size="lg"
            className="bg-[#f34e7b] text-white hover:bg-[#f34e7b]/90"
            disabled={submitting || !reason}
          >
            {submitting && <LoaderCircle className="animate-spin" />}
            Submit refund request
          </Button>
        </div>
      </form>
    </Form>
  )
}
