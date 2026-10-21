import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, Clock, AlertTriangle, UploadCloud, Copy, Eye, RefreshCw, Building2 } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, Card, Badge } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { orderRepository } from '../../checkout/services/order.repository'
import type { OrderWithItems } from '../types/order.type'
import { cn } from '../../../shared/utils/cn'

interface PaymentProofCardProps {
  order: OrderWithItems
  onUpdated: () => void
}

const MANUAL_ACCOUNTS = [
  { bank: 'BCA', number: '8001234567', name: 'PT Nadrical Compro' },
  { bank: 'Mandiri', number: '1370012345678', name: 'PT Nadrical Compro' },
  { bank: 'BRI', number: '012301001234567', name: 'PT Nadrical Compro' },
]

function resolveProofUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1').replace(/\/api\/v1\/?$/, '')
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export function PaymentProofCard({ order, onUpdated }: PaymentProofCardProps) {
  const payment = order.payment
  const isPaid = (order.status ?? '').toLowerCase() === 'paid' || payment?.status === 'PAID' || payment?.status === 'success'
  const isRejected = payment?.status === 'REJECTED'
  const hasProof = Boolean(payment?.payment_proof_url)
  const isPendingVerification = !isPaid && hasProof && !isRejected

  const [accounts, setAccounts] = useState(MANUAL_ACCOUNTS)
  const [showUploadForm, setShowUploadForm] = useState(!hasProof || isRejected)
  const [senderName, setSenderName] = useState(payment?.sender_name || payment?.payer_name || order.recipient_name || '')
  const [senderBank, setSenderBank] = useState(payment?.sender_bank || payment?.payer_bank || 'BCA')
  const [referenceNumber, setReferenceNumber] = useState(payment?.reference_number || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    orderRepository.fetchPaymentMethods().then((methods) => {
      if (methods && methods.length > 0) {
        const banks = methods
          .filter((m) => (m.gateway_code === 'manual' || m.category === 'BANK_TRANSFER') && m.account_number)
          .map((m) => ({
            bank: m.bank_name || m.name,
            number: m.account_number || '',
            name: m.account_holder_name || m.account_holder || 'PT Nadrical Compro',
          }))
        if (banks.length > 0) {
          setAccounts(banks)
        }
      }
    }).catch(() => {})
  }, [])

  const copyText = (text: string, label: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      toast.success(`${label} berhasil disalin!`)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senderName.trim()) {
      toast.error('Nama pemilik rekening pengirim wajib diisi')
      return
    }
    if (!senderBank.trim()) {
      toast.error('Nama bank pengirim wajib diisi')
      return
    }
    if (!selectedFile && !hasProof) {
      toast.error('Silakan pilih foto atau screenshot bukti transfer')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('sender_name', senderName.trim())
      formData.append('sender_bank', senderBank.trim())
      formData.append('amount_paid', String(order.grand_total ?? order.subtotal ?? 0))
      if (referenceNumber.trim()) {
        formData.append('reference_number', referenceNumber.trim())
      }
      if (selectedFile) {
        formData.append('payment_proof', selectedFile)
      }

      await orderRepository.submitPaymentWithProof(order.id, formData)
      toast.success('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.')
      setShowUploadForm(false)
      setSelectedFile(null)
      onUpdated()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden border p-5 sm:p-6 space-y-5">
      {/* 1. Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">Status & Pembayaran</h3>
          <p className="text-xs text-muted-foreground">Metode Pembayaran: Transfer Bank (Verifikasi Manual)</p>
        </div>
        {isPaid ? (
          <Badge className="gap-1.5 bg-emerald-600 text-white border-emerald-600 px-3 py-1">
            <CheckCircle2 className="size-3.5" /> Pembayaran Terverifikasi
          </Badge>
        ) : isPendingVerification ? (
          <Badge className="gap-1.5 bg-blue-600 text-white border-blue-600 px-3 py-1">
            <Clock className="size-3.5" /> Menunggu Verifikasi Admin
          </Badge>
        ) : isRejected ? (
          <Badge className="gap-1.5 bg-destructive text-destructive-foreground px-3 py-1">
            <AlertTriangle className="size-3.5" /> Bukti Ditolak
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 border-amber-500 text-amber-600 px-3 py-1">
            <Clock className="size-3.5" /> Menunggu Pembayaran
          </Badge>
        )}
      </div>

      {/* 2. Paid Success State */}
      {isPaid && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900 dark:text-emerald-300">Pembayaran Sukses Diverifikasi</p>
              <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                Terima kasih, pembayaran sebesar <strong>{formatPrice(order.grand_total ?? order.subtotal)}</strong> telah diverifikasi. Pesanan Anda segera diproses untuk pengiriman.
              </p>
              {payment?.verified_at && (
                <p className="mt-1 text-[11px] text-emerald-600/90 dark:text-emerald-400">
                  Waktu verifikasi: {new Date(payment.verified_at).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Rejection Notice */}
      {isRejected && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Bukti Pembayaran Ditolak</p>
              <p className="mt-0.5 text-xs">
                {payment?.rejection_reason || 'Bukti transfer tidak jelas atau nominal tidak sesuai. Silakan upload ulang bukti pembayaran yang valid.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Pending Verification State with Preview */}
      {isPendingVerification && !showUploadForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-300">Bukti Transfer Sedang Diverifikasi</p>
                <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
                  Bukti pembayaran telah berhasil diterima oleh admin. Tim kami akan memverifikasi dalam 1x24 jam.
                </p>
                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  <p>Pengirim: <strong>{payment?.sender_name || payment?.payer_name}</strong> ({payment?.sender_bank || payment?.payer_bank})</p>
                  {payment?.reference_number && <p>No. Referensi: <strong>{payment.reference_number}</strong></p>}
                </div>
              </div>
            </div>

            {payment?.payment_proof_url && (
              <a
                href={resolveProofUrl(payment.payment_proof_url)}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 group relative overflow-hidden rounded-md border border-border bg-background p-1 hover:border-primary transition-colors"
                title="Lihat Bukti Transfer"
              >
                <img
                  src={resolveProofUrl(payment.payment_proof_url)}
                  alt="Bukti Transfer"
                  className="size-16 object-cover rounded"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="size-4" />
                </span>
              </a>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setShowUploadForm(true)}
            >
              <RefreshCw className="size-3" /> Unggah Ulang Bukti
            </Button>
          </div>
        </div>
      )}

      {/* 5. Bank Account Information (Show if not paid) */}
      {!isPaid && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <h4 className="text-sm font-semibold">Rekening Tujuan Transfer</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total Tagihan:</span>{' '}
              <span className="font-mono text-sm font-bold text-primary">
                {formatPrice(order.grand_total ?? order.subtotal)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Silakan transfer tepat sesuai nominal tagihan ke salah satu rekening resmi kami di bawah ini:
          </p>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {accounts.map((acc) => (
              <div
                key={acc.bank}
                className="relative flex flex-col justify-between rounded-md border bg-card p-3 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary">{acc.bank}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Salin no rek ${acc.bank}`}
                      onClick={() => copyText(acc.number.replace(/-/g, ''), `Nomor rekening ${acc.bank}`)}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                  <p className="mt-1 font-mono text-sm font-semibold tracking-tight">{acc.number}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{acc.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Upload Form (Collapsible or Shown when needed) */}
      {!isPaid && showUploadForm && (
        <form onSubmit={handleSubmitProof} className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <UploadCloud className="size-4 text-primary" /> Formulir Bukti Transfer
            </h4>
            {hasProof && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => setShowUploadForm(false)}
              >
                Batal
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground">Nama Pengirim (Sesuai Rekening) *</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Bank Pengirim *</label>
              <input
                type="text"
                required
                value={senderBank}
                onChange={(e) => setSenderBank(e.target.value)}
                placeholder="Contoh: BCA / Mandiri / BRI"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-foreground">Nomor Referensi Transfer (Opsional)</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Contoh: TRX-9281729 atau kosongkan"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* File input */}
          <div>
            <label className="text-xs font-medium text-foreground">Foto Bukti Transfer (JPG/PNG/WEBP, Maks 5MB) *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors hover:border-primary/60 hover:bg-muted/40',
                previewUrl ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/30'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Preview Bukti"
                    className="max-h-36 rounded-md object-contain border shadow-xs"
                  />
                  <p className="text-xs text-primary font-medium">Klik untuk mengganti foto</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <UploadCloud className="size-7 text-primary/70" />
                  <p className="text-xs font-medium text-foreground">Pilih atau Seret Foto Bukti Transfer ke Sini</p>
                  <p className="text-[11px]">Format: JPG, JPEG, PNG, WEBP (Maksimal 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {hasProof && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUploadForm(false)}
                disabled={submitting}
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={submitting || (!selectedFile && !hasProof)}
              className="gap-2 text-xs"
            >
              {submitting ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" /> Kirim Bukti Pembayaran
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
