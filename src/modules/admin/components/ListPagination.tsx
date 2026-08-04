import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../shared/components/ui'

interface ListPaginationProps {
  pageStart: number
  pageEnd: number
  total: number
  loading?: boolean
  onPrev: () => void
  onNext: () => void
}

export function ListPagination({ pageStart, pageEnd, total, loading, onPrev, onNext }: ListPaginationProps) {
  if (total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="font-mono text-xs text-muted-foreground">
        Showing {pageStart}–{pageEnd} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || pageStart === 1}
          onClick={onPrev}
        >
          <ChevronLeft /> Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || pageEnd >= total}
          onClick={onNext}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
