import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import type { DbChatConversation, DbChatMessage } from '../../../shared/types/database.type'

const CONVERSATIONS_KEY = 'db-chat-conversations'
const MESSAGES_KEY = 'db-chat-messages'

function loadDb(): { conversations: DbChatConversation[]; messages: DbChatMessage[] } {
  try {
    const rawC = localStorage.getItem(CONVERSATIONS_KEY)
    if (rawC !== null) {
      const conversations = JSON.parse(rawC) as DbChatConversation[]
      const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') as DbChatMessage[]
      return { conversations, messages }
    }
  } catch {
    // fall through
  }
  return { conversations: [], messages: [] }
}

function saveDb(conversations: DbChatConversation[], messages: DbChatMessage[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

function withMessages(conversation: DbChatConversation, messages: DbChatMessage[]): ChatConversation {
  return {
    ...conversation,
    messages: messages.filter((m) => m.conversation_id === conversation.id),
  }
}

export const chatRepository = {
  list(): ChatConversation[] {
    const db = loadDb()
    return db.conversations.map((c) => withMessages(c, db.messages))
  },

  save(conversations: ChatConversation[]): void {
    const dbConversations: DbChatConversation[] = conversations.map((conversation) => ({
      id: conversation.id,
      customer_user_id: conversation.customer_user_id,
      customer_name: conversation.customer_name,
      customer_email: conversation.customer_email,
      status: conversation.status,
      created_at: conversation.created_at,
      last_activity_at: conversation.last_activity_at,
      customer_read_at: conversation.customer_read_at,
      agent_read_at: conversation.agent_read_at,
      closed_at: conversation.closed_at,
    }))
    const dbMessages: DbChatMessage[] = conversations.flatMap((c) => c.messages)
    saveDb(dbConversations, dbMessages)
  },

  get(id: string): ChatConversation | null {
    return this.list().find((c) => c.id === id) ?? null
  },

  upsert(conversation: ChatConversation): ChatConversation {
    const conversations = this.list()
    const index = conversations.findIndex((c) => c.id === conversation.id)
    const next =
      index === -1
        ? [...conversations, conversation]
        : conversations.map((c) => (c.id === conversation.id ? conversation : c))
    this.save(next)
    return conversation
  },

  findByCustomer(customer_user_id: string): ChatConversation | null {
    return this.list().find((c) => c.customer_user_id === customer_user_id) ?? null
  },

  insertMessage(conversation_id: string, message: ChatMessage): ChatConversation | null {
    const conversation = this.get(conversation_id)
    if (!conversation) return null
    if (conversation.messages.some((m) => m.id === message.id)) return conversation
    return this.upsert({
      ...conversation,
      messages: [...conversation.messages, message],
      last_activity_at: message.created_at,
    })
  },

  ensureConversation(identity: ChatIdentity): ChatConversation {
    const existing = this.findByCustomer(identity.customer_user_id)
    if (existing) return existing
    const now = new Date().toISOString()
    return this.upsert({
      id: `conv-${Math.random().toString(36).slice(2, 10)}`,
      customer_user_id: identity.customer_user_id,
      customer_name: identity.customer_name,
      customer_email: identity.customer_email,
      status: 'active',
      created_at: now,
      last_activity_at: now,
      messages: [],
      customer_read_at: now,
      agent_read_at: now,
    })
  },

  markRead(conversation_id: string, by: 'customer' | 'agent'): ChatConversation | null {
    const conversation = this.get(conversation_id)
    if (!conversation) return null
    const patch =
      by === 'customer'
        ? { customer_read_at: new Date().toISOString() }
        : { agent_read_at: new Date().toISOString() }
    return this.upsert({ ...conversation, ...patch })
  },
}
