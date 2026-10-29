import { useMemo } from 'react'
import { HelpCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, EmptyState, Skeleton } from '../../../shared/components/ui'
import { useFAQ } from '../hooks/useFAQ'

function formatCategoryTitle(category: string): string {
  if (!category) return 'General'
  const lower = category.toLowerCase()
  if (lower === 'ecommerce') return 'E-Commerce & Belanja'
  if (lower === 'general') return 'Umum'
  if (lower === 'shipping') return 'Pengiriman & Kurir'
  if (lower === 'payment') return 'Pembayaran'
  return category
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function FAQPage() {
  const { data: faqs, loading, error } = useFAQ()

  const grouped = useMemo(() => {
    const map: Record<string, Array<{ uuid: string; question: string; answer: string; order: number }>> = {}
    for (const item of faqs) {
      const catKey = formatCategoryTitle(item.category || 'General')
      if (!map[catKey]) map[catKey] = []
      map[catKey].push({
        uuid: item.uuid,
        question: item.question,
        answer: item.answer,
        order: item.order ?? 0,
      })
    }
    for (const catKey of Object.keys(map)) {
      map[catKey].sort((a, b) => a.order - b.order)
    }
    return map
  }, [faqs])

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 text-center sm:mb-12">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Help & Support</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Temukan jawaban cepat seputar pemesanan, pembayaran, dan layanan kami. Butuh bantuan lebih lanjut? Hubungi admin via live chat.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : faqs.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="size-10" />}
          title="Belum ada FAQ"
          description="Belum ada pertanyaan yang dipublikasikan."
        />
      ) : (
        <div className="grid gap-6 sm:gap-8 md:grid-cols-1 lg:gap-10">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
              <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">{category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {items.map((faq) => (
                  <AccordionItem key={faq.uuid} value={faq.uuid} className="rounded-lg border px-3 sm:px-4">
                    <AccordionTrigger className="py-3 text-left text-sm font-medium hover:no-underline sm:py-4 sm:text-[15px]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3 text-sm leading-relaxed text-muted-foreground sm:pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
