export type AccountStatus = "active" | "inactive" | "blocked";
export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "published" | "archived";
export type DbOrderStatus =
    | "pending_payment"
    | "WAITING_ONGKIR"
    | "WAITING_CONFIRMATION"
    | "DELIVERING"
    | "paid"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled"
    | "refunded";
export type PaymentStatus =
    | "pending"
    | "success"
    | "failed"
    | "refunded"
    | "expired"
    | "SELLER_PAID"
    | "CANCELED";
export type DbNotificationType = "order" | "promo" | "announcement" | "system";
export type ChatSenderRole = "customer" | "agent" | "admin" | "bot";

export interface DbUser {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    password_hash?: string;
    status?: AccountStatus;
    email_verified_at?: string;
    last_login_at?: string;
    last_login_ip?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface DbUserAddress {
    id: string;
    user_id: string;
    label?: string;
    recipient_name: string;
    recipient_phone: string;
    address_line_1: string;
    address_line_2?: string;
    district?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country_code?: string;
    is_primary?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface DbRole {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DbPermission {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DbUserRole {
    id: string;
    user_id: string;
    role_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbRolePermission {
    id: string;
    role_id: string;
    permission_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbProductCategory {
    id: string;
    parent_id?: string;
    name: string;
    slug: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface DbProduct {
    id: string;
    category_id: string;
    type?: ProductType;
    sku?: string;
    name: string;
    slug?: string;
    summary?: string;
    description?: string;
    cover_image_url?: string;
    base_price: number;
    compare_price?: number;
    stock?: number;
    is_featured?: boolean;
    is_preorder?: boolean;
    preorder_eta?: string;
    preorder_deposit?: number;
    status?: ProductStatus;
    average_rating?: number;
    review_count?: number;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface DbProductImage {
    id: string;
    product_id: string;
    image_url: string;
    sort_order?: number;
    created_at?: string;
}

export interface DbProductSpec {
    id: string;
    product_id: string;
    spec_name: string;
    spec_value: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbProductVariant {
    id: string;
    product_id: string;
    variant_sku?: string;
    variant_name: string;
    price_delta?: number;
    override_price?: number;
    stock?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DbCart {
    id: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbCartItem {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price_snapshot: number;
    compare_price_snapshot?: number;
    is_selected?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DbOrder {
    id: string;
    order_number: string;
    user_id?: string;
    user_address_id?: string;
    recipient_name?: string;
    recipient_phone?: string;
    shipping_address_line_1?: string;
    shipping_address_line_2?: string;
    shipping_city?: string;
    shipping_province?: string;
    shipping_postal_code?: string;
    shipping_country_code?: string;
    shipping_method?: string;
    tracking_number?: string;
    status?: DbOrderStatus;
    currency_code?: string;
    subtotal: number;
    discount_total?: number;
    shipping_total?: number;
    service_fee_total?: number;
    tax_total?: number;
    grand_total: number;
    paid_at?: string;
    placed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id?: string;
    product_name_snapshot: string;
    sku_snapshot?: string;
    variant_name_snapshot?: string;
    quantity: number;
    unit_price: number;
    discount_total?: number;
    tax_total?: number;
    line_total: number;
    created_at?: string;
    updated_at?: string;
}

export interface DbOrderItemSpec {
    id: string;
    order_item_id: string;
    spec_name: string;
    spec_value: string;
}

export interface DbOrderTaxLine {
    id: string;
    order_id?: string;
    order_item_id?: string;
    tax_name: string;
    tax_rate?: number;
    tax_amount: number;
}

export interface DbPayment {
    id: string;
    order_id: string;
    payment_method?: string;
    payment_channel?: string;
    payer_name?: string;
    payer_bank?: string;
    reference_number?: string;
    amount: number;
    status?: PaymentStatus;
    payment_proof_url?: string;
    paid_at?: string;
    verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbChatConversation {
    id: string;
    customer_user_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    status?: string;
    created_at?: string;
    last_activity_at?: string;
    customer_read_at?: string;
    agent_read_at?: string;
    closed_at?: string;
}

export interface DbChatMessage {
    id: string;
    conversation_id: string;
    sender_user_id?: string;
    sender_role?: ChatSenderRole;
    message: string;
    is_read?: boolean;
    created_at?: string;
}

export interface DbProductReview {
    id: string;
    user_id: string;
    product_id: string;
    order_item_id?: string;
    rating: number;
    comment?: string;
    image_urls?: string[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface DbAnnouncement {
    id: string;
    created_by_user_id: string;
    title: string;
    content: string;
    target_scope?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DbNotification {
    id: string;
    user_id?: string;
    type?: DbNotificationType;
    title: string;
    content: string;
    is_read?: boolean;
    order_id?: string;
    announcement_id?: string;
    created_at?: string;
    read_at?: string;
}

export interface DbAppSetting {
    id: string;
    setting_key: string;
    setting_name?: string;
    setting_value?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbAuditLog {
    id: string;
    user_id?: string;
    entity_name?: string;
    entity_id?: string;
    action?: string;
    payload?: Record<string, unknown>;
    created_at?: string;
}
