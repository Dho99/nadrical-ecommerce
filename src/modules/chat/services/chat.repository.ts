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
      customer_phone: conversation.customer_phone,
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

  findByCustomer(customer_user_id?: string): ChatConversation | null {
    if (!customer_user_id) return null
    return this.list().find((c) => c.customer_user_id === customer_user_id) ?? null
  },

  insertMessage(
    conversation_id: string,
    message: ChatMessage,
    fallbackConversation?: Partial<ChatConversation>,
  ): ChatConversation {
    let conversation = this.get(conversation_id)
    if (!conversation) {
      const now = new Date().toISOString()
      conversation = this.upsert({
        id: conversation_id,
        customer_user_id: fallbackConversation?.customer_user_id ?? 'unknown',
        customer_name: fallbackConversation?.customer_name ?? 'Customer',
        customer_email: fallbackConversation?.customer_email,
        status: fallbackConversation?.status ?? 'active',
        created_at: fallbackConversation?.created_at ?? now,
        last_activity_at: message.created_at || now,
        messages: [],
        customer_read_at: fallbackConversation?.customer_read_at ?? now,
        agent_read_at: fallbackConversation?.agent_read_at ?? now,
      })
    }
    if (conversation.messages.some((m) => m.id === message.id)) return conversation
    return this.upsert({
      ...conversation,
      messages: [...conversation.messages, message],
      last_activity_at: message.created_at,
    })
  },

  ensureConversation(identity: ChatIdentity): ChatConversation {
    const normalizedEmail = identity.customer_email?.trim().toLowerCase()
    const normalizedPhone = identity.customer_phone?.trim()

    // 1. Match by customer_user_id
    let existing = this.findByCustomer(identity.customer_user_id)

    // 2. If not found by customer_user_id, match by email or phone
    if (!existing && (normalizedEmail || normalizedPhone)) {
      existing =
        this.list().find((c) => {
          const emailMatch =
            normalizedEmail && c.customer_email?.trim().toLowerCase() === normalizedEmail
          const phoneMatch =
            normalizedPhone && c.customer_phone?.trim() === normalizedPhone
          return emailMatch || phoneMatch
        }) ?? null
    }

    if (existing) {
      const needsUpgrade =
        identity.customer_user_id && existing.customer_user_id !== identity.customer_user_id
      const needsUpdate =
        needsUpgrade ||
        (identity.customer_name && identity.customer_name !== existing.customer_name) ||
        (identity.customer_email && identity.customer_email !== existing.customer_email) ||
        (identity.customer_phone && identity.customer_phone !== existing.customer_phone)

      if (needsUpdate) {
        return this.upsert({
          ...existing,
          customer_user_id: identity.customer_user_id || existing.customer_user_id,
          customer_name: identity.customer_name || existing.customer_name,
          customer_email: identity.customer_email ?? existing.customer_email,
          customer_phone: identity.customer_phone ?? existing.customer_phone,
        })
      }
      return existing
    }

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

    const now = new Date().toISOString()
    return this.upsert({
      id: generateUUID(),
      customer_user_id: identity.customer_user_id || undefined,
      customer_name: identity.customer_name,
      customer_email: identity.customer_email,
      customer_phone: identity.customer_phone,
      status: 'active',
      created_at: now,
      last_activity_at: now,
      messages: [],
      customer_read_at: now,
      agent_read_at: now,
    })
  },

  syncConversationId(oldId: string, newId: string): void {
    if (!oldId || !newId || oldId === newId) return
    const db = loadDb()
    const existingNewIndex = db.conversations.findIndex((c) => c.id === newId)
    const oldIndex = db.conversations.findIndex((c) => c.id === oldId)
    if (oldIndex !== -1) {
      if (existingNewIndex !== -1) {
        db.conversations.splice(oldIndex, 1)
      } else {
        db.conversations[oldIndex].id = newId
      }
    }
    db.messages = db.messages.map((m) =>
      m.conversation_id === oldId ? { ...m, conversation_id: newId } : m,
    )
    saveDb(db.conversations, db.messages)
  },

  markRead(conversation_id: string, by: 'customer' | 'agent'): ChatConversation | null {
    const conversation = this.get(conversation_id)
    if (!conversation) return null
    const now = new Date().toISOString()
    const patch =
      by === 'customer'
        ? { customer_read_at: now }
        : { agent_read_at: now }

    const nextMessages = conversation.messages.map((m) => {
      const isOpposite =
        by === 'customer'
          ? m.sender_role === 'agent' || m.sender_role === 'admin' || m.sender_role === 'bot'
          : m.sender_role === 'customer'
      if (isOpposite && !m.is_read) {
        return { ...m, is_read: true }
      }
      return m
    })

    return this.upsert({ ...conversation, ...patch, messages: nextMessages })
  },

  handleIncomingReadReceipt(
    conversation_id: string,
    reader_role: 'customer' | 'admin' | 'agent',
  ): ChatConversation | null {
    const conversation = this.get(conversation_id)
    if (!conversation) return null

    const nextMessages = conversation.messages.map((m) => {
      const isOpposite =
        reader_role === 'admin' || reader_role === 'agent'
          ? m.sender_role === 'customer'
          : m.sender_role === 'agent' || m.sender_role === 'admin'
      if (isOpposite && !m.is_read) {
        return { ...m, is_read: true }
      }
      return m
    })

    return this.upsert({ ...conversation, messages: nextMessages })
  },

  transferGuestHistory(identity: ChatIdentity): ChatConversation | null {
    const normalizedEmail = identity.customer_email?.trim().toLowerCase()
    const normalizedPhone = identity.customer_phone?.trim()
    if (!normalizedEmail && !normalizedPhone) return null

    const conversations = this.list()
    const targetConv = conversations.find((c) => {
      if (c.customer_user_id === identity.customer_user_id) return false
      const emailMatch =
        normalizedEmail && c.customer_email?.trim().toLowerCase() === normalizedEmail
      const phoneMatch =
        normalizedPhone && c.customer_phone?.trim() === normalizedPhone
      return emailMatch || phoneMatch
    })

    if (!targetConv) return null

    const updated: ChatConversation = {
      ...targetConv,
      customer_user_id: identity.customer_user_id,
      customer_name: identity.customer_name || targetConv.customer_name,
      customer_email: identity.customer_email ?? targetConv.customer_email,
      customer_phone: identity.customer_phone ?? targetConv.customer_phone,
      messages: targetConv.messages.map((m) =>
        m.sender_role === 'customer'
          ? { ...m, sender_user_id: identity.customer_user_id }
          : m,
      ),
    }

    this.upsert(updated)
    return updated
  },
}
