import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, FileText, Loader2, ShieldCheck, UploadCloud, X } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, Card, Input, Separator } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import type { OrderConfirmation } from '../types/checkout.type'
import { paymentProofSchema, type PaymentProofInput } from '../schemas/payment-proof.schema'
import { paymentProofService } from '../services/payment-proof.service'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { isManualPaymentMethod } from '../utils/gateway'
import {
  PAYMENT_PROOF_ACCEPT_ATTRIBUTE,
  PAYMENT_PROOF_MAX_SIZE_MB,
} from '../constants/payment-proof.constants'

interface UploadProofFormProps {
  confirmation: OrderConfirmation
  onUploaded: () => void
}

interface AccountView {
  bank: string
  number: string
  holder: string
  instructions?: string
}

export function UploadProofForm({ confirmation, onUploaded }: UploadProofFormProps) {
  const previewUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { methods, loading, error } = usePaymentMethods()
  const {
    register,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentProofInput>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      sender_name: '',
      sender_bank: '',
      amount_paid: confirmation.grand_total,
      note: '',
    },
  })

  const proof = watch('proof')

  const accounts = useMemo<AccountView[]>(() => {
    const manual = methods.filter(isManualPaymentMethod)
    const selected = confirmation.payment_method_code
      ? manual.find((method) => method.code === confirmation.payment_method_code)
      : manual[0]
    const chosen = selected ? [selected] : manual

    if (chosen.length > 0) {
      return chosen.map((method) => ({
        bank: method.bank_name || method.name,
        number: method.account_number || '',
        holder: method.account_holder_name || method.account_holder || '',
        instructions: method.instructions,
      }))
    }

    if (confirmation.payment_account_number) {
      return [{
        bank: confirmation.payment_bank_name || confirmation.payment_method_name || 'Transfer Bank',
        number: confirmation.payment_account_number,
        holder: confirmation.payment_account_holder || '',
        instructions: confirmation.payment_instructions,
      }]
    }

    return []
  }, [
    methods,
    confirmation.payment_method_code,
    confirmation.payment_account_number,
    confirmation.payment_account_holder,
    confirmation.payment_bank_name,
    confirmation.payment_instructions,
    confirmation.payment_method_name,
  ])

  useEffect(() => {
    if (accounts[0]?.bank) setValue('sender_bank', accounts[0].bank)
  }, [accounts, setValue])

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    clearErrors('proof')
    if (!file) {
      setValue('proof', undefined as unknown as File, { shouldValidate: false })
      return
    }
    if (file.type.startsWith('image/')) {
      previewUrlRef.current = URL.createObjectURL(file)
    }
    setValue('proof', file, { shouldValidate: true })
  }

  const clearFile = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setValue('proof', undefined as unknown as File, { shouldValidate: false })
    clearErrors('proof')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: PaymentProofInput) => {
    if (!confirmation.order_id) {
      toast.error('Order ID tidak ditemukan. Buka halaman ini dari detail pesanan.')
      return
    }
    try {
      await paymentProofService.upload(confirmation.order_id, confirmation.order_number, values)
      toast.success('Bukti transfer berhasil diupload')
      onUploaded()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengupload bukti transfer. Coba lagi.'
      toast.error(message)
      setError('proof', { message })
    }
  }

  return (
    <Card className="mx-auto max-w-lg p-6 sm:p-8">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <UploadCloud className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-center font-display text-3xl font-bold tracking-tight">Upload Bukti Transfer</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Lakukan transfer sebesar{' '}
        <span className="font-semibold text-foreground">{formatPrice(confirmation.grand_total)}</span> ke rekening
        tujuan di bawah, lalu upload bukti transfernya.
      </p>

      <Separator className="my-5" />

      <div className="rounded-lg border bg-muted/40 p-4 text-left">
        <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <Banknote className="size-3.5" /> Rekening Tujuan
        </div>
        {loading && accounts.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Memuat rekening…
          </p>
        ) : accounts.length === 0 ? (
          <p className="mt-3 text-xs text-destructive">
            Rekening tujuan belum tersedia. {error || 'Hubungi admin toko.'}
          </p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {accounts.map((acc) => (
              <li key={`${acc.bank}-${acc.number}`} className="space-y-0.5">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <span className="font-mono text-xs font-semibold">
                    {acc.bank} — {acc.number}
                  </span>
                  {acc.holder && <span className="text-muted-foreground">a.n. {acc.holder}</span>}
                </div>
                {acc.instructions && (
                  <p className="text-[11px] leading-snug text-muted-foreground">{acc.instructions}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-left text-xs text-muted-foreground">
        <span className="font-mono">{confirmation.order_number}</span>
        <span className="float-right font-mono">{formatPrice(confirmation.grand_total)}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="sender-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Nama pengirim
            </label>
            <Input
              id="sender-name"
              placeholder="Nama sesuai rekening"
              maxLength={255}
              {...register('sender_name')}
            />
            {errors.sender_name && <p className="mt-1.5 text-xs text-destructive">{errors.sender_name.message}</p>}
          </div>
          <div>
            <label htmlFor="sender-bank" className="mb-1 block text-xs font-medium text-muted-foreground">
              Bank pengirim
            </label>
            <Input
              id="sender-bank"
              placeholder="BCA / Mandiri / BRI"
              maxLength={100}
              {...register('sender_bank')}
            />
            {errors.sender_bank && <p className="mt-1.5 text-xs text-destructive">{errors.sender_bank.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="amount-paid" className="mb-1 block text-xs font-medium text-muted-foreground">
            Nominal transfer
          </label>
          <Input
            id="amount-paid"
            type="number"
            min={1}
            step="any"
            {...register('amount_paid', { valueAsNumber: true })}
          />
          {errors.amount_paid && <p className="mt-1.5 text-xs text-destructive">{errors.amount_paid.message}</p>}
        </div>

        <div>
          {proof ? (
            <div className="relative rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Hapus file terpilih"
              >
                <X className="size-4" />
              </button>
              {proof.type.startsWith('image/') && previewUrlRef.current ? (
                <img
                  src={previewUrlRef.current}
                  alt="Preview bukti transfer"
                  className="mx-auto max-h-48 rounded-md object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-5 text-primary" />
                  <span className="truncate font-medium">{proof.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {(proof.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          ) : (
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary/50',
                errors.proof && 'border-destructive/60',
              )}
            >
              <UploadCloud className="size-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Klik untuk memilih file bukti transfer</span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP, atau PDF — maks {PAYMENT_PROOF_MAX_SIZE_MB}MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={PAYMENT_PROOF_ACCEPT_ATTRIBUTE}
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
          )}
          {errors.proof && <p className="mt-1.5 text-xs text-destructive">{errors.proof.message}</p>}
        </div>

        <div>
          <Input
            placeholder="Referensi / No. transaksi (opsional)"
            maxLength={200}
            aria-label="Referensi transaksi"
            {...register('note')}
          />
          {errors.note && <p className="mt-1.5 text-xs text-destructive">{errors.note.message}</p>}
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting || accounts.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Mengupload bukti…
            </>
          ) : (
            <>Upload Bukti Transfer</>
          )}
        </Button>

        {!confirmation.order_id && (
          <p className="text-center text-xs text-destructive">
            Order ID tidak tersedia. Buka halaman upload dari detail pesanan.
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" /> Bukti transfer hanya digunakan untuk verifikasi pembayaran
        </div>
      </form>
    </Card>
  )
}
