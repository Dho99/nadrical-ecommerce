import type { DbChatConversation, DbChatMessage } from '../../../shared/types/database.type'
import type { ProductChatContext } from '../../../shared/constants/chat.constants'

export type ChatMessage = DbChatMessage & {
  product_context?: ProductChatContext
  reply_to_id?: string | null
  reply_to?: {
    id: string
    sender_role: string
    message: string
  } | null
  client_temp_id?: string | null
}

export type ChatConversation = DbChatConversation & {
  messages: ChatMessage[]
  product_context?: ProductChatContext
}

export interface ChatIdentity {
  customer_user_id?: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
}

export interface WSTypingPayload {
  type: 'typing'
  conversation_id: string
  sender_role: 'customer' | 'admin' | 'agent'
  sender_name?: string
  customer_email?: string
  customer_user_id?: string
  is_typing: boolean
}

export interface WSPresencePayload {
  type: 'presence'
  role: 'customer' | 'admin' | 'agent'
  conversation_id?: string
  user_id?: string | null
  customer_email?: string
  customer_user_id?: string
  user_name?: string
  status: 'online' | 'offline'
  timestamp: number
}

export interface WSPresenceQueryPayload {
  type: 'presence_query'
  sender_role: 'customer' | 'admin' | 'agent'
}

export interface WSReadReceiptPayload {
  type: 'read_receipt'
  conversation_id: string
  reader_role: 'customer' | 'admin' | 'agent'
  reader_id?: string | null
  customer_email?: string | null
  customer_user_id?: string | null
  read_at: string
}
