import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { ProductBrief } from '../../../shared/types/product.type'
import { HERO_STATS } from '../constants/home.constants'

interface HomeHeroProps {
  products: ProductBrief[]
}

export function HomeHero({ products }: HomeHeroProps) {
  const tiles = products.slice(0, 4)

  return (
    <section className="border-b bg-muted/40">
      <div className="container mx-auto grid items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="mb-3 font-mono text-xs font-medium tracking-[0.14em] text-primary uppercase">
            General store · Curated, always in stock
          </p>
          <h1 className="font-display text-4xl leading-[0.95] font-bold tracking-tight sm:text-6xl">
            Everything for
            <span className="block text-primary">everyday living</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            A catalog built on quality — electronics, apparel, home, and more —
            shipped within 48 hours with free 30-day returns.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/products">
              <Button size="lg">
                Browse the store <ArrowRight />
              </Button>
            </Link>
            <Link to="/products?category=apparel">
              <Button size="lg" variant="outline">
                Shop apparel
              </Button>
            </Link>
          </div>
          <dl className="mt-9 grid grid-cols-3 gap-4 border-t pt-5">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-2xl font-bold tracking-tight">{stat.value}</dd>
                <dt className="mt-0.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tiles.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-card"
            >
              <ProductImage
                src={product.cover_image_url}
                alt={product.name}
                className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute right-2.5 bottom-2.5 rounded-md bg-background/90 px-2 py-1 text-xs font-semibold shadow-sm">
                ${product.base_price.toFixed(2)}
              </span>
              <span className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pt-10 pb-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="line-clamp-1 text-sm font-medium text-white">
                  {product.name}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
