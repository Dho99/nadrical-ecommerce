import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { POSTAL_DEBOUNCE_MS, POSTAL_MIN_LENGTH } from '../constants/postal.constants'
import { postalService, type PostalPlace } from '../services/postal.service'

export function usePostalLookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PostalPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const lastFetchedRef = useRef('')
  const debounced = useDebounce(query, POSTAL_DEBOUNCE_MS)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const code = debounced.trim()
      if (code.length < POSTAL_MIN_LENGTH) {
        setResults((prev) => (prev.length ? [] : prev))
        setSearched(false)
        setIsSearching(false)
        lastFetchedRef.current = ''
        return
      }
      if (code === lastFetchedRef.current) return
      setIsSearching(true)
      const places = await postalService.lookup(code)
      if (cancelled) return
      lastFetchedRef.current = code
      setResults(places)
      setSearched(true)
      setIsSearching(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [debounced])

  const resetLookup = useCallback(() => {
    setQuery('')
    setResults([])
    setSearched(false)
    setIsSearching(false)
    lastFetchedRef.current = ''
  }, [])

  return { query, setQuery, results, isSearching, searched, resetLookup }
}
