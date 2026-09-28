import { useEffect, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useBlocker, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Separator,
} from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { CHECKOUT_STEPS, useCheckout, type CheckoutStepIndex } from '../hooks/useCheckout'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'
import type { CheckoutInput } from '../schemas/checkout.schema'
import { StepContact } from './StepContact'
import { StepShipping } from './StepShipping'
import { PaymentAccordion } from './PaymentAccordion'

const CONFIRMATION_STORAGE_KEY = 'last-order-confirmation'

interface CheckoutFormProps {
  payloadBase: Pick<OrderPayload, 'items' | 'totals'>
  initialValues?: Partial<Pick<CheckoutInput, 'recipient_name' | 'email'>>
  onOrderPlaced: (confirmation: OrderConfirmation) => void
}

export function CheckoutForm({ payloadBase, initialValues, onOrderPlaced }: CheckoutFormProps) {
  const { step, isFirstStep, isLastStep, isSubmitting, error, confirmation, form, next, back, goTo, submit } =
    useCheckout(payloadBase, initialValues)

  const [leaveOpen, setLeaveOpen] = useState(false)
  const [pendingStep, setPendingStep] = useState<CheckoutStepIndex | null>(null)
  const [confirmPayOpen, setConfirmPayOpen] = useState(false)
  const [leaveCheckoutOpen, setLeaveCheckoutOpen] = useState(false)
  const navigate = useNavigate()
  const shouldBlockCheckout = !confirmation && !isSubmitting

  const blocker = useBlocker(shouldBlockCheckout)

  useEffect(() => {
    if (!confirmation) return
    try {
      const storable = {
        order_number: confirmation.order_number,
        placed_at: confirmation.placed_at instanceof Date ? confirmation.placed_at.toISOString() : String(confirmation.placed_at),
        email: confirmation.email,
        eta_days: confirmation.eta_days,
        grand_total: confirmation.grand_total,
      }
      sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(storable))
    } catch {
      // ignore storage errors
    }
    onOrderPlaced(confirmation)
  }, [confirmation, onOrderPlaced])

  const handleSubmit = form.handleSubmit(async (values) => {
    await submit(values)
  })

  const goToStep = (index: CheckoutStepIndex) => {
    if (index === step) return
    if (step === 1 && index !== 1) {
      setPendingStep(index)
      setLeaveOpen(true)
      return
    }
    if (index < step) goTo(index)
  }

  const handleLeaveConfirm = () => {
    if (pendingStep !== null) goTo(pendingStep)
    setLeaveOpen(false)
    setPendingStep(null)
  }

  const isBlocked = blocker.state === 'blocked'
  const isLeaveDialogOpen = leaveCheckoutOpen || isBlocked

  useEffect(() => {
    if (!shouldBlockCheckout) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Intentionally no auto-dialog; in-app navigation is guarded by useBlocker above.
      }
    }
    const onBlur = () => {
      if (shouldBlockCheckout) {
        // Defer to next tick so click inside dialog isn't treated as blur
        setTimeout(() => {
          if (document.hasFocus()) return
          setLeaveCheckoutOpen(true)
        }, 300)
      }
    }
    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [shouldBlockCheckout])

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} noValidate>
        <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Checkout steps">
          {CHECKOUT_STEPS.map((s, i) => {
            const current = i === step
            const done = i < step
            return (
              <li key={s.num}>
                <button
                  type="button"
                  onClick={() => goToStep(i as CheckoutStepIndex)}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    done && 'border-transparent bg-primary/10 text-primary hover:bg-primary/20',
                    current && 'border-transparent bg-primary text-primary-foreground',
                    !done && !current && 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  <span className="font-mono text-xs">{s.num}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
          {step === 0 && <StepContact email={initialValues?.email} />}
          {step === 1 && <StepShipping subtotal={payloadBase.totals.subtotal} />}
          {step === 2 && <PaymentAccordion />}

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
            {!isFirstStep ? (
              <Button variant="outline" onClick={back} disabled={isSubmitting}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <span />
            )}
            {isLastStep ? (
              <Button type="button" size="lg" disabled={isSubmitting} onClick={() => setConfirmPayOpen(true)}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Placing order…
                  </>
                ) : (
                  <>
                    Place order <ArrowRight />
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={next}>
                Continue <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-5">
        <Separator />
        <p className="mt-2 text-right font-mono text-xs text-muted-foreground">
          SECURE DEMO CHECKOUT · NO CARD IS CHARGED
        </p>
      </div>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari proses transaksi?</AlertDialogTitle>
            <AlertDialogDescription>Apakah anda ingin keluar dari proses transaksi? Progress pengisian shipping akan hilang jika anda keluar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStep(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm}>Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isLeaveDialogOpen}
        onOpenChange={(open) => {
          setLeaveCheckoutOpen(open)
          if (!open && blocker.state === 'blocked') blocker.reset?.()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda ingin mengakhiri proses checkout?</AlertDialogTitle>
            <AlertDialogDescription>
              Proses checkout akan dihentikan dan data yang sudah diisi tidak akan disimpan. Yakin ingin keluar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset?.()
              }}
            >
              Lanjutkan checkout
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blocker.state === 'blocked') blocker.proceed?.()
                setLeaveCheckoutOpen(false)
                navigate('/products', { replace: true })
              }}
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPayOpen} onOpenChange={setConfirmPayOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>Apakah anda yakin akan melanjutkan ke proses pembayaran? Pesanan akan dibuat dan tidak dapat dibatalkan dari form ini.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmPayOpen(false)
                void handleSubmit()
              }}
            >
              Ya, lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  )
}
