import api from "../../../shared/lib/api";
import type { CartItem, CartTotals } from "../types/cart.type";

export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 8;

function toCartItem(item: ApiCartItem): CartItem {
    return {
        id: item.uuid,
        product_id: item.product_uuid,
        quantity: item.quantity,
        unit_price: Number(item.total_price),
    };
}

interface ApiCartItem {
    uuid: string;
    product_uuid: string;
    quantity: number;
    total_price: string;
}

export const cartService = {
    subtotal(items: CartItem[]): number {
        return items.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0,
        );
    },

    shipping(subtotal: number): number {
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    },

    totals(items: CartItem[]): CartTotals {
        const subtotal = this.subtotal(items);
        const shipping_total = this.shipping(subtotal);
        return {
            subtotal,
            shipping_total,
            grand_total: subtotal + shipping_total,
        };
    },

    totalQty(items: CartItem[]): number {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    async apiAddToCart(
        productUUID: string,
        quantity: number,
        variantUUID?: string,
    ): Promise<void> {
        try {
            await api.post("/ecommerce/cart", {
                product_uuid: productUUID,
                quantity,
                ...(variantUUID ? { variant_uuid: variantUUID } : {}),
            });
        } catch {
            // Gracefully ignore if offline or guest
        }
    },

    async apiUpdateItem(itemUUID: string, quantity: number): Promise<void> {
        try {
            await api.put(`/ecommerce/cart/items/${itemUUID}`, { quantity });
        } catch {
            // ignore
        }
    },

    async apiRemoveItem(itemUUID: string): Promise<void> {
        try {
            await api.delete(`/ecommerce/cart/items/${itemUUID}`);
        } catch {
            // ignore
        }
    },

    async apiClearCart(): Promise<void> {
        try {
            await api.delete("/ecommerce/cart");
        } catch {
            // ignore
        }
    },
};
