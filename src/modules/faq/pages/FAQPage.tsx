import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../shared/components/ui'

type DummyFAQ = {
  uuid: string
  question: string
  answer: string
  category: string
  order: number
}

const DUMMY_FAQS: DummyFAQ[] = [
  {
    uuid: 'ship-1',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 2–4 business days within Indonesia. Express shipping is available for next-day delivery in major cities. All orders are processed within 24 hours.',
    category: 'Shipping & Delivery',
    order: 1,
  },
  {
    uuid: 'ship-2',
    question: 'Do you ship internationally?',
    answer: 'Currently we ship across Indonesia only. International shipping is on our roadmap — subscribe to our newsletter to be notified when it launches.',
    category: 'Shipping & Delivery',
    order: 2,
  },
  {
    uuid: 'ship-3',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email and in Profile → Order History. Click the tracking number to see real-time courier updates.',
    category: 'Shipping & Delivery',
    order: 3,
  },
  {
    uuid: 'return-1',
    question: 'What is your return policy?',
    answer: 'We offer 14-day no-questions-asked returns. Items must be unused, unwashed, and in original packaging. Initiate a return from Order History → Refund.',
    category: 'Returns & Refunds',
    order: 1,
  },
  {
    uuid: 'return-2',
    question: 'How long do refunds take?',
    answer: 'Refunds are processed within 3–5 business days after we receive the returned item. The amount is credited to your original payment method or store wallet.',
    category: 'Returns & Refunds',
    order: 2,
  },
  {
    uuid: 'return-3',
    question: 'Who pays for return shipping?',
    answer: 'For defective or wrong items, we cover return shipping. For size or preference changes, the customer covers the courier fee. A prepaid label is provided in both cases.',
    category: 'Returns & Refunds',
    order: 3,
  },
  {
    uuid: 'pay-1',
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfer (VA), e-wallets (GoPay, OVO, DANA, ShopeePay), credit/debit cards, and COD for eligible areas. All payments are secured by Midtrans.',
    category: 'Payment & Orders',
    order: 1,
  },
  {
    uuid: 'pay-2',
    question: 'Is my payment information secure?',
    answer: 'Yes. We never store card numbers. All transactions are encrypted via TLS and processed by PCI-DSS certified gateways. 3D Secure is required for card payments.',
    category: 'Payment & Orders',
    order: 2,
  },
  {
    uuid: 'pay-3',
    question: 'Can I change or cancel my order?',
    answer: 'You can cancel within 1 hour after payment while the status is still "Pending". After that, contact support via live chat — we will try to stop fulfillment if possible.',
    category: 'Payment & Orders',
    order: 3,
  },
  {
    uuid: 'prod-1',
    question: 'Are your products authentic?',
    answer: 'All products are sourced directly from official brands or authorized distributors. Each item includes a authenticity guarantee and 2-year warranty where applicable.',
    category: 'Product & Account',
    order: 1,
  },
  {
    uuid: 'prod-2',
    question: 'How do I know my size?',
    answer: 'Each product page includes a detailed size chart and model measurements. Still unsure? Message us via the chat bubble — we reply within minutes during business hours.',
    category: 'Product & Account',
    order: 2,
  },
  {
    uuid: 'prod-3',
    question: 'Do I need an account to order?',
    answer: 'You can browse as guest, but checkout requires an account so you can track orders, manage addresses, save wishlist, and earn loyalty points. Registration takes 30 seconds.',
    category: 'Product & Account',
    order: 3,
  },
]

export function FAQPage() {
  const grouped = DUMMY_FAQS.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = []
      acc[faq.category].push(faq)
      return acc
    },
    {} as Record<string, DummyFAQ[]>,
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 text-center sm:mb-12">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Help & Support</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Find quick answers about shipping, returns, payments, and products. Still stuck? Reach us via live chat.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-1 lg:gap-10">
        {Object.entries(grouped).map(([category, faqs]) => (
          <section key={category} className="rounded-xl border bg-card p-4 sm:p-6">
            <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">{category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs
                .sort((a, b) => a.order - b.order)
                .map((faq) => (
                  <AccordionItem key={faq.uuid} value={faq.uuid} className="rounded-lg border px-3 sm:px-4">
                    <AccordionTrigger className="py-3 text-left text-sm font-medium hover:no-underline sm:py-4 sm:text-[15px]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1 text-sm leading-relaxed text-muted-foreground sm:pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  )
}
