import type { DbChatConversation, DbChatMessage } from '../../../shared/types/database.type'

export type ChatMessage = DbChatMessage

export type ChatConversation = DbChatConversation & {
  messages: ChatMessage[]
}

export interface ChatIdentity {
  customer_user_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
}
