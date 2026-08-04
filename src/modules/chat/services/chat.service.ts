import { mockDelay } from '../../../shared/lib/mock'
import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import { BOT_REPLIES, BOT_REPLY_DELAY_MS, GUEST_ID_KEY } from '../constants/chat.constants'
import { chatRepository } from './chat.repository'

function makeMessage(role: ChatMessage['role'], text: string): ChatMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 12)}`,
    role,
    text,
    at: new Date().toISOString(),
  }
}

function pickBotReply(conversation: ChatConversation): string {
  const botCount = conversation.messages.filter((m) => m.role === 'bot').length
  return BOT_REPLIES[botCount % BOT_REPLIES.length]
}

export const chatService = {
  getGuestId(): string {
    try {
      const existing = localStorage.getItem(GUEST_ID_KEY)
      if (existing) return existing
      const id = `guest-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(GUEST_ID_KEY, id)
      return id
    } catch {
      return `guest-${Math.random().toString(36).slice(2, 10)}`
    }
  },

  async getOrCreate(identity: ChatIdentity): Promise<ChatConversation> {
    await mockDelay(220)
    return chatRepository.ensureConversation(identity)
  },

  async sendCustomerMessage(identity: ChatIdentity, text: string): Promise<ChatConversation> {
    await mockDelay(200)
    const conversation = chatRepository.ensureConversation(identity)
    const updated = chatRepository.insertMessage(conversation.id, makeMessage('customer', text))
    if (!updated) throw new Error('Conversation not found')

    const botReply = pickBotReply(updated)
    setTimeout(() => {
      chatRepository.insertMessage(updated.id, makeMessage('bot', botReply))
    }, BOT_REPLY_DELAY_MS)

    return updated
  },

  async sendAgentMessage(conversationId: string, text: string): Promise<ChatConversation> {
    await mockDelay(180)
    const updated = chatRepository.insertMessage(conversationId, makeMessage('agent', text))
    if (!updated) throw new Error('Conversation not found')
    return updated
  },

  async markRead(conversationId: string, by: 'customer' | 'agent'): Promise<void> {
    await mockDelay(60)
    chatRepository.markRead(conversationId, by)
  },
}
