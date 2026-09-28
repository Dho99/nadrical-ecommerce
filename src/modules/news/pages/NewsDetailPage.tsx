import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import { DUMMY_NEWS } from '../constants/news.constants'
import { Button } from '../../../shared/components/ui'

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  if (!slug) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <p className="text-sm text-muted-foreground sm:text-base">Invalid article slug.</p>
      </div>
    )
  }

  const article = DUMMY_NEWS.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:p-6">
          <p className="text-sm text-destructive">Article not found.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/news')} className="text-xs sm:text-sm">
          <ArrowLeft className="mr-2 size-4" /> Back to News
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6 text-xs sm:mb-8 sm:text-sm" onClick={() => navigate('/news')}>
        <ArrowLeft className="mr-2 size-3.5 sm:size-4" /> Back to News
      </Button>

      {/* Hero image */}
      <div className="relative mb-6 h-64 overflow-hidden rounded-lg bg-muted sm:mb-8 sm:h-96">
        <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
      </div>

      {/* Header */}
      <div className="mb-8 space-y-3 sm:mb-12 sm:space-y-4">
        {/* Category badge */}
        <Link
          to={`/news?category=${article.category}`}
          className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:px-4 sm:py-2 sm:text-sm"
        >
          {article.category}
        </Link>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">{article.title}</h1>

        {/* Excerpt */}
        {article.excerpt && <p className="text-base text-muted-foreground sm:text-lg">{article.excerpt}</p>}

        {/* Metadata */}
        <div className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:gap-6 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 sm:size-4" />
            {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 sm:size-4" />
            {article.author}
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-sm max-w-none space-y-3 text-sm leading-relaxed text-foreground sm:space-y-4 sm:text-base">
        {article.content.split('\n\n').map((paragraph, idx) => {
          // Handle markdown-style headers
          if (paragraph.startsWith('# ')) {
            return (
              <h2 key={idx} className="mt-6 text-xl font-bold sm:text-2xl">
                {paragraph.replace(/^# /, '')}
              </h2>
            )
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h3 key={idx} className="mt-5 text-lg font-semibold sm:text-xl">
                {paragraph.replace(/^## /, '')}
              </h3>
            )
          }
          if (paragraph.startsWith('### ')) {
            return (
              <h4 key={idx} className="mt-4 font-semibold">
                {paragraph.replace(/^### /, '')}
              </h4>
            )
          }
          if (paragraph.startsWith('| ')) {
            // Simple table rendering
            const rows = paragraph.split('\n')
            return (
              <div key={idx} className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <tbody>
                    {rows.map((row, ridx) => (
                      <tr key={ridx} className="border-b">
                        {row.split('|').map((cell, cidx) => (
                          <td
                            key={cidx}
                            className={`px-2 py-1.5 ${ridx === 0 || ridx === 1 ? 'font-semibold bg-muted' : ''}`}
                          >
                            {cell.trim()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          if (paragraph.trim() === '') {
            return null
          }
          return (
            <p key={idx} className="leading-relaxed">
              {paragraph}
            </p>
          )
        })}
      </article>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="border-t pt-6 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Tag className="size-3.5 text-muted-foreground sm:size-4" />
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/news`}
                className="rounded-full bg-muted px-2 py-1 text-xs font-medium transition-colors hover:bg-muted/80 sm:px-3 sm:text-sm"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-4 text-center sm:mt-12 sm:p-8">
        <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">Interested in more articles?</p>
        <Button asChild className="text-xs sm:text-sm">
          <Link to="/news">View All Articles</Link>
        </Button>
      </div>
    </div>
  )
}
