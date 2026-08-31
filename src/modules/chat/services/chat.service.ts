import { api } from '../../../shared/lib/api'
import { websocketService } from '../../../shared/lib/websocket'
import type { ChatConversation, ChatMessage } from '../types/chat.type'

const GUEST_ID_KEY = 'guest_id'

function getGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = `guest-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

function makeId(): string {
  return `conv-${Math.random().toString(36).slice(2, 10)}`
}

function makeMessageId(): string {
  return `msg-${Math.random().toString(36).slice(2, 12)}`
}

export const chatService = {
  getGuestId(): string {
    return getGuestId()
  },

  async getOrCreate(identity: { customer_user_id: string; customer_name: string; customer_email?: string }): Promise<ChatConversation> {
    let conversation = this.findByCustomer(identity.customer_user_id)
    if (conversation) return conversation
    const now = new Date().toISOString()
    const newConv: ChatConversation = {
      id: makeId(),
      customer_user_id: identity.customer_user_id,
      customer_name: identity.customer_name,
      customer_email: identity.customer_email,
      status: 'active',
      created_at: now,
      last_activity_at: now,
      messages: [],
      customer_read_at: now,
      agent_read_at: now,
    }
    this.save(newConv)
    return newConv
  },

  async sendCustomerMessage(identity: { customer_user_id: string; customer_name: string; customer_email?: string }, text: string): Promise<ChatConversation> {
    const conversation = await this.getOrCreate(identity)
    const message: ChatMessage = {
      id: makeMessageId(),
      conversation_id: conversation.id,
      sender_role: 'customer',
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    websocketService.send({
      type: 'chat_message',
      conversation_id: conversation.id,
      message,
    })
    const updated = this.upsertMessage(conversation.id, message)
    return updated
  },

  async sendAgentMessage(conversation_id: string, text: string): Promise<ChatConversation> {
    const message: ChatMessage = {
      id: makeMessageId(),
      conversation_id,
      sender_role: 'agent',
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    websocketService.send({
      type: 'chat_message',
      conversation_id,
      message,
    })
    const conversation = this.get(conversation_id)
    if (!conversation) throw new Error('Conversation not found')
    const updated = this.upsertMessage(conversation_id, message)
    return updated
  },

  async markRead(conversation_id: string, by: 'customer' | 'agent'): Promise<void> {
    const conversation = this.get(conversation_id)
    if (!conversation) return
    const patch = by === 'customer'
      ? { customer_read_at: new Date().toISOString() }
      : { agent_read_at: new Date().toISOString() }
    this.upsert({ ...conversation, ...patch })
  },

  // Local storage helpers (simulating repository)
  list(): ChatConversation[] {
    try {
      const raw = localStorage.getItem('db-chat-conversations')
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  },

  save(conversations: ChatConversation[]): void {
    localStorage.setItem('db-chat-conversations', JSON.stringify(conversations))
  },

  get(id: string): ChatConversation | null {
    return this.list().find((c) => c.id === id) ?? null
  },

  upsert(conversation: ChatConversation): ChatConversation {
    const conversations = this.list()
    const index = conversations.findIndex((c) => c.id === conversation.id)
    const next = index === -1 ? [...conversations, conversation] : conversations.map((c) => c.id === conversation.id ? conversation : c)
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

  upsertMessage(conversation_id: string, message: ChatMessage): ChatConversation {
    const updated = this.insertMessage(conversation_id, message)
    if (!updated) throw new Error('Failed to insert message')
    return updated
  },
}