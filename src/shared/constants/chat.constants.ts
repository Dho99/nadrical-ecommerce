export const CHAT_OPEN_EVENT = 'nadrical:open-chat'

export interface ProductChatContext {
  id: string
  name: string
  price: number
  currency: string
  category: string
  availability: string
  description: string
  image: string
}

export interface ChatOpenDetail {
  message?: string
  productId?: string
  product?: ProductChatContext
}
