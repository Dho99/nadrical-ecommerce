import api from "../../../shared/lib/api";
import type { CursorPage } from "../../../shared/types/common.type";
import type {
    Product,
    ProductCategory,
    ProductFilters,
    ProductSpec,
    ProductVariant,
} from "../types/product.type";
import { CATEGORIES } from "../constants/product.constants";
import { productRepository } from "./product.repository";

interface BackendCategory {
    uuid?: string;
    id?: string;
    name: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
}

interface BackendProduct {
    uuid?: string;
    id?: string;
    sku?: string;
    name: string;
    slug?: string;
    summary?: string;
    description?: string;
    image?: string;
    cover_image_url?: string;
    price?: number;
    base_price?: number;
    stock?: number;
    is_featured?: boolean;
    category_uuid?: string;
    category_id?: string;
    category?: {
        uuid?: string;
        name?: string;
        slug?: string;
    };
    specifications?: Array<{
        name?: string;
        spec_name?: string;
        values?: Array<{ value: string }>;
        spec_value?: string;
    }>;
    specs?: Array<{
        spec_name?: string;
        name?: string;
        spec_value?: string;
        value?: string;
    }>;
    variants?: Array<{
        uuid?: string;
        id?: string;
        variant_name?: string;
        name?: string;
        price_delta?: number;
        stock?: number;
    }>;
}

interface StandardApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

function mapBackendProduct(bp: BackendProduct): Product {
    const specs: ProductSpec[] = [];
    if (Array.isArray(bp.specifications)) {
        bp.specifications.forEach((s) => {
            const val =
                s.values && s.values.length > 0
                    ? s.values[0].value
                    : s.spec_value || "";
            specs.push({
                spec_name: s.name || s.spec_name || "",
                spec_value: val,
            });
        });
    } else if (Array.isArray(bp.specs)) {
        bp.specs.forEach((s) => {
            specs.push({
                spec_name: s.spec_name || s.name || "",
                spec_value: s.spec_value || s.value || "",
            });
        });
    }

    const variants: ProductVariant[] = [];
    if (Array.isArray(bp.variants)) {
        bp.variants.forEach((v) => {
            variants.push({
                id: v.uuid || v.id || "",
                variant_name: v.variant_name || v.name || "",
                price_delta: Number(v.price_delta || 0),
                stock: Number(v.stock || 0),
            });
        });
    }

    const categorySlug =
        bp.category?.slug ||
        bp.category_id ||
        bp.category_uuid ||
        "electronics";

    return {
        id: bp.uuid || bp.id || "",
        sku: bp.sku || `SKU-${bp.uuid || bp.id || ""}`,
        name: bp.name,
        category_id: categorySlug as any,
        base_price: Number(bp.price ?? bp.base_price ?? 0),
        stock: Number(bp.stock ?? 0),
        cover_image_url: bp.image || bp.cover_image_url || "",
        is_featured: Boolean(bp.is_featured),
        summary: bp.summary || bp.description?.slice(0, 120) || "",
        specs,
        variants: variants.length > 0 ? variants : undefined,
    };
}

function matchesQuery(product: Product, query?: string): boolean {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.summary.toLowerCase().includes(q)
    );
}

function filterAndSort(
    products: Product[],
    filters: ProductFilters,
): Product[] {
    const query = filters.query?.trim();
    let result = products.filter(
        (p) =>
            matchesQuery(p, query) &&
            (filters.category_id === undefined ||
                filters.category_id === "all" ||
                p.category_id === filters.category_id) &&
            (!filters.in_stock_only || p.stock > 0),
    );

    switch (filters.sort) {
        case "price-asc":
            result = [...result].sort((a, b) => a.base_price - b.base_price);
            break;
        case "price-desc":
            result = [...result].sort((a, b) => b.base_price - a.base_price);
            break;
        case "stock":
            result = [...result].sort((a, b) => b.stock - a.stock);
            break;
        default:
            result = [...result].sort(
                (a, b) =>
                    Number(b.is_featured ?? false) -
                        Number(a.is_featured ?? false) ||
                    a.sku.localeCompare(b.sku),
            );
    }
    return result;
}

export type ProductDraft = Omit<Product, "id" | "sku">;

function paginate<T>(
    items: T[],
    cursor: number | null,
    limit: number,
): CursorPage<T> {
    const offset = Math.max(0, cursor ?? 0);
    const total = items.length;
    const nextOffset = offset + limit;
    return {
        id: p.uuid,
        sku: p.sku,
        name: p.name,
        category_id: p.category_uuid,
        base_price: Number(p.price),
        stock: p.stock,
        cover_image_url: p.image,
        badge: p.badge as Product["badge"] | undefined,
        is_featured: p.is_featured,
        summary: p.description,
        specs: [],
        variants: [],
    };
}

interface ApiProduct {
    uuid: string;
    name: string;
    description: string;
    price: string;
    original_price?: string;
    discount_percent?: number;
    stock: number;
    average_rating?: number;
    category_uuid: string;
    image: string;
    sku: string;
    is_featured?: boolean;
    badge?: string;
    created_at?: string;
    updated_at?: string;
}

interface ApiProductCategory {
    uuid: string;
    name: string;
}

export const productService = {
    async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
        try {
            const params: Record<string, string | number> = {
                limit: 100,
                page: 1,
            };
            if (filters.query) params.search = filters.query;
            const res = await api.get<StandardApiResponse<BackendProduct[]>>(
                "/ecommerce/products",
                { params },
            );
            if (Array.isArray(res.data.data) && res.data.data.length > 0) {
                const mapped = res.data.data.map(mapBackendProduct);
                return filterAndSort(mapped, filters);
            }
        } catch {
            // Graceful fallback to repository
        }
        return filterAndSort(productRepository.list(), filters);
    },

    async getProductPage(
        filters: ProductFilters = {},
        cursor: number | null = null,
        limit = 12,
    ): Promise<CursorPage<Product>> {
        const offset = Math.max(0, cursor ?? 0);
        const page = Math.floor(offset / limit) + 1;

        try {
            const params: Record<string, string | number> = {
                limit,
                page,
            };
            if (filters.query) params.search = filters.query;
            const res = await api.get<StandardApiResponse<BackendProduct[]>>(
                "/ecommerce/products",
                { params },
            );
            if (Array.isArray(res.data.data)) {
                const mapped = res.data.data.map(mapBackendProduct);
                const total = res.data.meta?.total ?? mapped.length;
                const nextOffset = offset + limit;
                return {
                    items: mapped,
                    total: Number(total),
                    nextCursor: nextOffset < total ? nextOffset : null,
                    prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
                };
            }
        } catch {
            // Graceful fallback
        }

        return paginate(
            filterAndSort(productRepository.list(), filters),
            cursor,
            limit,
        );
    },

    async getProductById(id: string): Promise<Product | null> {
        try {
            const res = await api.get<StandardApiResponse<BackendProduct>>(
                `/ecommerce/products/${id}`,
            );
            if (res.data.data) {
                return mapBackendProduct(res.data.data);
            }
        } catch {
            // Graceful fallback
        }
        return productRepository.list().find((p) => p.id === id) ?? null;
    },

    async getFeatured(limit = 4): Promise<Product[]> {
        const all = await this.getProducts();
        const featured = all.filter((p) => p.is_featured);
        const rest = all.filter((p) => !p.is_featured);
        return [...featured, ...rest].slice(0, limit);
    },

    async getRelated(product: Product, limit = 3): Promise<Product[]> {
        const all = await this.getProducts();
        const same = all.filter(
            (p) => p.id !== product.id && p.category_id === product.category_id,
        );
        const rest = all.filter(
            (p) => p.id !== product.id && p.category_id !== product.category_id,
        );
        return [...same, ...rest].slice(0, limit);
    },

    async getCategories(): Promise<ProductCategory[]> {
        try {
            const res = await api.get<StandardApiResponse<BackendCategory[]>>(
                "/ecommerce/categories",
            );
            if (Array.isArray(res.data.data) && res.data.data.length > 0) {
                return res.data.data.map((c) => ({
                    id: (c.slug || c.name.toLowerCase()) as any,
                    label: c.name,
                    tagline: c.description || "",
                }));
            }
        } catch {
            // Graceful fallback
        }
        return CATEGORIES;
    },

    async createProduct(draft: ProductDraft): Promise<Product> {
        try {
            const res = await api.post<StandardApiResponse<BackendProduct>>(
                "/ecommerce/products",
                {
                    name: draft.name,
                    original_price: draft.base_price,
                    discount_percent: 0,
                    stock: draft.stock,
                    image: draft.cover_image_url,
                    description: draft.summary || draft.name,
                    category_uuid: draft.category_id,
                },
            );
            if (res.data.data) {
                return mapBackendProduct(res.data.data);
            }
        } catch {
            // Fallback
        }

        const products = productRepository.list();
        const maxSeq = products.reduce((max, p) => {
            const match = /^SKU-(\d+)$/.exec(p.sku);
            return match ? Math.max(max, Number(match[1])) : max;
        }, 1000);
        const sku = `SKU-${maxSeq + 1}`;
        const product: Product = { ...draft, id: sku, sku };
        productRepository.insert(product);
        return product;
    },

    async updateProduct(
        id: string,
        patch: Partial<ProductDraft>,
    ): Promise<Product | null> {
        try {
            const res = await api.put<StandardApiResponse<BackendProduct>>(
                `/ecommerce/products/${id}`,
                {
                    ...(patch.name ? { name: patch.name } : {}),
                    ...(patch.base_price !== undefined
                        ? { price: patch.base_price }
                        : {}),
                    ...(patch.stock !== undefined
                        ? { stock: patch.stock }
                        : {}),
                    ...(patch.cover_image_url
                        ? { cover_image_url: patch.cover_image_url }
                        : {}),
                    ...(patch.summary ? { summary: patch.summary } : {}),
                    ...(patch.is_featured !== undefined
                        ? { is_featured: patch.is_featured }
                        : {}),
                },
            );
            if (res.data.data) {
                return mapBackendProduct(res.data.data);
            }
        } catch {
            // Fallback
        }

        const products = productRepository.update(id, patch);
        return products.find((p) => p.id === id) ?? null;
    },

    async deleteProduct(id: string): Promise<void> {
        try {
            await api.delete(`/ecommerce/products/${id}`);
        } catch {
            // Fallback
        }
        productRepository.remove(id);
    },

    async resetCatalog(): Promise<void> {
        productRepository.reset();
    },
};
