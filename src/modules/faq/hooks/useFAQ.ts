import { useEffect, useState } from 'react'
import { faqService, type FAQ } from '../services/faq.service'

export function useFAQ(category?: string) {
  const [data, setData] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [category])

  return { data, loading, error }
}
