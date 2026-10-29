import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Newspaper, Search } from 'lucide-react'
import { Button, Card, EmptyState, Input, Skeleton } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { useNewsList, useNewsCategories } from '../hooks/useNews'

function fmtDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function NewsListPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const limit = 9
  const categories = useNewsCategories()
  const { items, total, loading, error } = useNewsList({ search: query, category, page, limit })
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Journal</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Berita & Artikel</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Kabar terbaru, panduan, dan cerita dari Nadrical.
        </p>
      </header>

      <form
        className="mb-6 flex max-w-lg gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          setPage(1)
          setQuery(search.trim())
        }}
      >
        <div className="relative grow">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari berita…"
            className="pl-9"
            aria-label="Cari berita"
          />
        </div>
        <Button type="submit" variant="outline">Cari</Button>
      </form>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => { setCategory(''); setPage(1) }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${category === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-accent'}`}
          >
            Semua
          </button>
          {categories.map((item) => (
            <button
              key={item.uuid}
              type="button"
              onClick={() => { setCategory(item.slug); setPage(1) }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${category === item.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-accent'}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-sm text-destructive">{error}</Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-10" />}
          title="Belum ada berita"
          description="Belum ada artikel yang dipublikasikan."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.uuid} className="overflow-hidden">
                <Link to={`/news/${encodeURIComponent(item.slug)}`} className="block">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {item.thumbnail ? (
                      <ProductImage src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Newspaper className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarDays className="size-3" /> {fmtDate(item.created_at)}
                      {item.category?.name ? ` · ${item.category.name}` : ''}
                    </p>
                    <h2 className="mt-2 line-clamp-2 font-display text-lg font-bold tracking-tight">{item.title}</h2>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Sebelumnya
              </Button>
              <span className="font-mono text-xs text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
                Berikutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
