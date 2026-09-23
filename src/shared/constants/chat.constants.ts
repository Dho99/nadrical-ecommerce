export const CHAT_OPEN_EVENT = 'nadrical:open-chat'

export const CHAT_PRODUCT_CONTEXTS_KEY = 'nadrical:chat-product-contexts'

export interface ProductChatContext {
  id: string
  name: string
  price: number
  currency: string
  category: string
  availability: string
  description: string
  image: string
  added_at?: string
}

export interface ChatOpenDetail {
  message?: string
  productId?: string
  product?: ProductChatContext
}
