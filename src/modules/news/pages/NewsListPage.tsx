import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { DUMMY_NEWS, NEWS_CATEGORIES } from '../constants/news.constants'
import { Button, Input } from '../../../shared/components/ui'

const ITEMS_PER_PAGE = 6

export function NewsListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const filtered = useMemo(() => {
    return DUMMY_NEWS.filter((article) => {
      const matchSearch = !search || article.title.toLowerCase().includes(search.toLowerCase()) || article.excerpt.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !selectedCategory || article.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [search, selectedCategory])

  const total = filtered.length
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Blog & News</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Latest News</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Stay updated with product launches, tips, customer stories, and company updates.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-3 sm:mb-12 sm:space-y-4">
        <div className="w-full">
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:max-w-md"
            aria-label="Search news articles"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter('')}
            className="text-xs sm:text-sm"
          >
            All
          </Button>
          {NEWS_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category)}
              className="text-xs sm:text-sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground sm:text-base">
            {search || selectedCategory ? 'No articles found matching your filters.' : 'No news articles yet.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {paginatedData.length > 0 && (
        <>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedData.map((article) => (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-muted sm:h-48">
                  <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
                  {/* Category Badge */}
                  <span className="inline-block w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {article.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-base font-semibold leading-snug line-clamp-2 sm:text-lg">{article.title}</h3>

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-2 sm:text-sm">{article.excerpt}</p>

                  {/* Metadata */}
                  <div className="mt-auto flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3 sm:text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="size-3" />
                      {article.author}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/news/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-all hover:gap-2.5 sm:text-sm"
                  >
                    Read More <ArrowRight className="size-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 sm:mt-12">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="text-xs sm:text-sm"
              >
                Previous
              </Button>

              <div className="text-xs text-muted-foreground sm:text-sm">
                Page {page} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
