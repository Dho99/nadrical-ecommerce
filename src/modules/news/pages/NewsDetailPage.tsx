import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Newspaper } from 'lucide-react'
import { Button, Card, EmptyState, Skeleton } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { useNewsArticle } from '../hooks/useNews'

function fmtDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { item, loading, error } = useNewsArticle(slug)

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-5 py-10 sm:px-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <EmptyState
          icon={<Newspaper className="size-10" />}
          title="Berita tidak ditemukan"
          description={error || 'Artikel ini tidak tersedia atau sudah dihapus.'}
          action={
            <Button asChild variant="outline">
              <Link to="/news">Kembali ke berita</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Semua berita
      </Link>

      <header className="mt-5">
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" /> {fmtDate(item.created_at)}
          {item.category?.name ? <span>· {item.category.name}</span> : null}
          {item.views_count !== undefined ? <span>· {item.views_count} views</span> : null}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{item.title}</h1>
        {item.excerpt && <p className="mt-3 text-base text-muted-foreground">{item.excerpt}</p>}
      </header>

      {item.thumbnail && (
        <div className="mt-6 aspect-video overflow-hidden rounded-xl border bg-muted">
          <ProductImage src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}

      <Card className="mt-6 p-5 sm:p-8">
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
          {item.content}
        </div>
      </Card>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag.uuid} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
