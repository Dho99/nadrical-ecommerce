import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, SectionHead } from '../../../shared/components/ui'
import { CATEGORY_ICONS } from '../constants/home.constants'

export interface CategoryLink {
  id: string
  label: string
  tagline: string
}

interface CategoryIndexProps {
  categories: CategoryLink[]
}

export function CategoryIndex({ categories }: CategoryIndexProps) {
  return (
    <section className="container mx-auto px-5 py-12 sm:px-8 sm:py-16">
      <SectionHead
        eyebrow="Categories"
        title="Shop by category"
        action={
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ALL CATALOG <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] ?? ArrowRight
          return (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="group">
              <Card className="flex h-full flex-col items-start gap-2 p-5 transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="font-display text-base font-semibold tracking-tight">{cat.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{cat.tagline}</p>
                <span className="mt-1 font-mono text-xs font-medium tracking-[0.1em] text-primary uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  SHOP →
                </span>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
