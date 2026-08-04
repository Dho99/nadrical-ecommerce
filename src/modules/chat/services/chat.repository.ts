import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'

const STORAGE_KEY = 'store-chat-v1'

export const chatRepository = {
  list(): ChatConversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as ChatConversation[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // fall through to empty
    }
    return []
  },

  save(conversations: ChatConversation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
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

  findByCustomer(customerId: string): ChatConversation | null {
    return this.list().find((c) => c.customerId === customerId) ?? null
  },

  insertMessage(conversationId: string, message: ChatMessage): ChatConversation | null {
    const conversation = this.get(conversationId)
    if (!conversation) return null
    return this.upsert({
      ...conversation,
      messages: [...conversation.messages, message],
      lastActivityAt: message.at,
    })
  },

  ensureConversation(identity: ChatIdentity): ChatConversation {
    const existing = this.findByCustomer(identity.id)
    if (existing) return existing
    const now = new Date().toISOString()
    return this.upsert({
      id: `conv-${Math.random().toString(36).slice(2, 10)}`,
      customerId: identity.id,
      customerName: identity.name,
      email: identity.email,
      createdAt: now,
      lastActivityAt: now,
      messages: [],
      customerReadAt: now,
      agentReadAt: now,
    })
  },

  markRead(conversationId: string, by: 'customer' | 'agent'): ChatConversation | null {
    const conversation = this.get(conversationId)
    if (!conversation) return null
    const patch =
      by === 'customer' ? { customerReadAt: new Date().toISOString() } : { agentReadAt: new Date().toISOString() }
    return this.upsert({ ...conversation, ...patch })
  },
}
