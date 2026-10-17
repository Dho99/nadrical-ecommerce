import { useEffect, useState } from 'react'
import { faqService, type FAQ } from '../services/faq.service'
import { websocketService } from '../../../shared/lib/websocket'

export function useFAQ(category?: string) {
  const [data, setData] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRefetch = () => setAttempt((a) => a + 1)
    const unsub1 = websocketService.on('faq_updated', triggerRefetch)
    const unsub2 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'faqs') {
        triggerRefetch()
      }
    })
    const onFocus = () => triggerRefetch()
    window.addEventListener('focus', onFocus)

    return () => {
      unsub1()
      unsub2()
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const list = category ? await faqService.getByCategory(category) : await faqService.list()
        setData(list)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FAQs')
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [category, attempt])

  return { data, loading, error }
}
