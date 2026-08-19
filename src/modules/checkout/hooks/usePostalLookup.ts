import { useEffect, useState } from 'react'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { POSTAL_DEBOUNCE_MS, POSTAL_MIN_LENGTH } from '../constants/postal.constants'
import { postalService, type PostalPlace } from '../services/postal.service'

export function usePostalLookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PostalPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounced = useDebounce(query, POSTAL_DEBOUNCE_MS)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const code = debounced.trim()
      if (code.length < POSTAL_MIN_LENGTH) {
        setResults([])
        setSearched(false)
        setIsSearching(false)
        return
      }
      setIsSearching(true)
      const places = await postalService.lookup(code)
      if (cancelled) return
      setResults(places)
      setSearched(true)
      setIsSearching(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [debounced])

  return { query, setQuery, results, isSearching, searched }
}
