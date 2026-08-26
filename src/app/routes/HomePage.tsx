import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HomeHero, CategoryIndex } from "../../modules/home";
import {
    ProductGrid,
    useProducts,
    useCategories,
} from "../../modules/products";
import { SectionHead } from "../../shared/components/ui";

export function HomePage() {
    const { products, status, error, refetch } = useProducts({});
    const categories = useCategories();

    const featured = products.filter((p) => p.is_featured).slice(0, 4);
    const heroProducts = products.length > 0 ? products : null;

    return (
        <>
            {heroProducts && <HomeHero products={heroProducts} />}
            <CategoryIndex categories={categories} />

            <section className="mx-auto container px-5 pb-16 sm:px-8">
                <SectionHead
                    eyebrow="This week's picks"
                    title="Featured products"
                    action={
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                            FULL CATALOG <ArrowRight className="size-3.5" />
                        </Link>
                    }
                />
                <div className="mt-6">
                    <ProductGrid
                        products={featured}
                        status={heroProducts ? status : "loading"}
                        error={error}
                        onRetry={refetch}
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    />
                </div>
            </section>

            {/* <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-14 text-center sm:px-8">
          <p className="font-mono text-xs font-medium tracking-[0.14em] uppercase opacity-80">
            The full catalog
          </p>
          <h2 className="max-w-2xl font-display text-4xl leading-[0.95] font-bold tracking-tight sm:text-5xl">
            No browsing required. Everything is one click away.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-primary-foreground/80">
            18 curated products with real specs and live stock. Filter by category,
            sort by price, or search by name and SKU.
          </p>
          <Link to="/products" className="mt-2">
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Browse catalog <ArrowRight />
            </Button>
          </Link>
        </div>
      </section> */}
        </>
    );
}
