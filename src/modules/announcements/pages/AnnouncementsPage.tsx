import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Megaphone } from 'lucide-react'
import { Button, Card, EmptyState, Skeleton } from '../../../shared/components/ui'
import { announcementService, type Announcement } from '../services/announcement.service'

function fmtDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    announcementService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setItems(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([])
          setError(err instanceof Error ? err.message : 'Gagal memuat pengumuman')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <div className="mx-auto max-w-3xl space-y-3 px-5 py-10 sm:px-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
  }

  if (error) {
    return <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><Card className="p-6 text-sm text-destructive">{error}</Card></div>
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <EmptyState icon={<Megaphone className="size-10" />} title="Belum ada pengumuman" description="Belum ada pengumuman yang dipublikasikan." />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Information</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Pengumuman</h1>
      </header>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.uuid} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-display text-lg font-bold tracking-tight">{item.title}</h2>
              <span className="text-xs text-muted-foreground">{fmtDate(item.created_at)}</span>
            </div>
            <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{item.content}</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to={`/announcements/${item.uuid}`}>Baca selengkapnya</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch lifecycle
    setLoading(true)
    announcementService
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          setItem(data)
          setError(data ? null : 'Pengumuman tidak ditemukan')
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItem(null)
          setError(err instanceof Error ? err.message : 'Pengumuman tidak ditemukan')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div className="mx-auto max-w-3xl space-y-3 px-5 py-10 sm:px-8"><Skeleton className="h-5 w-28" /><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>

  if (error || !item) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <EmptyState icon={<Megaphone className="size-10" />} title="Pengumuman tidak ditemukan" description={error || 'Pengumuman ini tidak tersedia.'} action={<Button asChild variant="outline"><Link to="/announcements">Kembali</Link></Button>} />
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <Link to="/announcements" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Semua pengumuman</Link>
      <p className="mt-5 text-xs text-muted-foreground">{fmtDate(item.created_at)}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{item.title}</h1>
      <Card className="mt-5 p-5 sm:p-8"><p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">{item.content}</p></Card>
    </article>
  )
}
