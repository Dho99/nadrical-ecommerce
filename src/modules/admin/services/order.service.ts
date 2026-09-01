import api from "../../../shared/lib/api";
import type { CursorPage } from "../../../shared/types/common.type";
import type { DbOrderItem } from "../../../shared/types/database.type";
import type { OrderWithItems } from "../../../shared/types/order.type";
import { orderRepository } from "../../checkout/services/order.repository";

function mapBackendOrder(bo: any): OrderWithItems {
    const items: DbOrderItem[] = (bo.order_items || []).map((oi: any) => ({
        id: oi.uuid || oi.id,
        order_id: bo.uuid || bo.id,
        product_id: oi.product_uuid || oi.product_id,
        product_name_snapshot:
            oi.product_name_snapshot || oi.product?.name || "Product",
        sku_snapshot: oi.sku_snapshot || oi.product?.sku || undefined,
        variant_name_snapshot: oi.variant_name_snapshot || undefined,
        quantity: Number(oi.quantity || 1),
        unit_price: Number(oi.price || oi.unit_price || 0),
        line_total: Number(
            oi.line_total || Number(oi.price || 0) * Number(oi.quantity || 1),
        ),
        created_at: oi.created_at,
        updated_at: oi.updated_at,
    }));

    let status = bo.status || bo.order_status || "pending_payment";
    if (status === "WAITING_CONFIRMATION" || status === "WAITING_ONGKIR")
        status = "pending_payment";
    else if (status === "PAID") status = "paid";
    else if (status === "DELIVERING") status = "shipped";
    else if (status === "COMPLETED") status = "completed";
    else if (status === "CANCELED") status = "cancelled";

    return {
        id: bo.uuid || bo.id,
        order_number: bo.order_number || `ORD-${bo.uuid?.slice(0, 8) || "000"}`,
        user_id: bo.account_uuid || bo.user_id || bo.account?.email,
        user_address_id: bo.user_address_uuid || bo.user_address_id,
        recipient_name: bo.recipient_name,
        recipient_phone: bo.phone || bo.recipient_phone,
        shipping_address_line_1: bo.address || bo.shipping_address_line_1,
        shipping_address_line_2: bo.shipping_address_line_2,
        shipping_city: bo.city || bo.shipping_city,
        shipping_province: bo.shipping_province,
        shipping_postal_code: bo.postal_code || bo.shipping_postal_code,
        shipping_country_code: bo.shipping_country_code,
        shipping_method: bo.shipping_courier || bo.shipping_method,
        tracking_number: bo.tracking_number,
        status: status.toLowerCase() as any,
        currency_code: bo.currency_code || "IDR",
        subtotal: Number(bo.subtotal || 0),
        discount_total: Number(bo.discount_total || 0),
        shipping_total: Number(bo.shipping_cost || bo.shipping_total || 0),
        service_fee_total: Number(bo.service_fee || bo.service_fee_total || 0),
        tax_total: Number(bo.tax_total || 0),
        grand_total: Number(bo.total || bo.grand_total || 0),
        paid_at: bo.paid_at,
        placed_at: bo.placed_at || bo.created_at,
        shipped_at: bo.shipped_at,
        delivered_at: bo.delivered_at,
        cancelled_at: bo.cancelled_at,
        created_at: bo.created_at,
        updated_at: bo.updated_at,
        order_items: items,
    };
}

export const orderService = {
    async listOrders(): Promise<OrderWithItems[]> {
        try {
            const res = await api.get<{ success: boolean; data: any[] }>(
                "/ecommerce/orders",
                {
                    params: { limit: 100 },
                },
            );
            if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
                return res.data.data.map(mapBackendOrder);
            }
        } catch {
            // fallback
        }
        return orderRepository.list();
    },

    async listOrdersPage(
        cursor: number | null = null,
        limit = 10,
    ): Promise<CursorPage<OrderWithItems>> {
        const offset = Math.max(0, cursor ?? 0);
        const page = Math.floor(offset / limit) + 1;

        try {
            const res = await api.get<{
                success: boolean;
                data: any[];
                meta?: any;
            }>("/ecommerce/orders", {
                params: { page, limit },
            });
            if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
                const items = res.data.data.map(mapBackendOrder);
                const total = res.data.meta?.total ?? items.length;
                const nextOffset = offset + limit;
                return {
                    items,
                    total: Number(total),
                    nextCursor: nextOffset < total ? nextOffset : null,
                    prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
                };
            }
        } catch {
            // fallback
        }

        const ordersList = await orderRepository.list();
        const all = [...ordersList].sort(
            (a, b) =>
                Date.parse(b.placed_at ?? "") - Date.parse(a.placed_at ?? ""),
        );
        const total = all.length;
        const nextOffset = offset + limit;
        return {
            items: all.slice(offset, nextOffset),
            total,
            nextCursor: nextOffset < total ? nextOffset : null,
            prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
        };
    },

    async ensureSeeded(): Promise<OrderWithItems[]> {
        const existing = await this.listOrders();
        if (existing.length > 0) return existing;
        return existing;
    },

    resetOrders(): void {
        orderRepository.reset();
    },
};
