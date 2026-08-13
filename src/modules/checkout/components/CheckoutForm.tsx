import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'
import { Button, Separator } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { CHECKOUT_STEPS, useCheckout, type CheckoutStepIndex } from '../hooks/useCheckout'
import type { OrderPayload } from '../types/checkout.type'
import type { CheckoutInput } from '../schemas/checkout.schema'
import { StepContact } from './StepContact'
import { StepShipping } from './StepShipping'
import { StepPayment } from './StepPayment'
import { OrderConfirmationCard } from './OrderConfirmationCard'

interface CheckoutFormProps {
  payloadBase: Pick<OrderPayload, 'items' | 'totals'>
  initialValues?: Partial<Pick<CheckoutInput, 'fullName' | 'email'>>
  onOrderPlaced: () => void
}

export function CheckoutForm({ payloadBase, initialValues, onOrderPlaced }: CheckoutFormProps) {
  const { step, isFirstStep, isLastStep, isSubmitting, error, confirmation, form, next, back, goTo, submit } =
    useCheckout(payloadBase, initialValues)

  useEffect(() => {
    if (confirmation) onOrderPlaced()
  }, [confirmation, onOrderPlaced])

  if (confirmation) {
    return <OrderConfirmationCard confirmation={confirmation} />
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await submit(values)
  })

  const goToStep = (index: CheckoutStepIndex) => {
    if (index < step) goTo(index)
  }

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
          {step === 0 && <StepContact />}
          {step === 1 && <StepShipping subtotal={payloadBase.totals.subtotal} />}
          {step === 2 && <StepPayment />}

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
              <Button type="submit" size="lg" disabled={isSubmitting}>
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
    </FormProvider>
  )
}