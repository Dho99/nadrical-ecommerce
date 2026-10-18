import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import type { ProductChatContext } from '../../../shared/constants/chat.constants'
import { BOT_REPLIES, BOT_REPLY_DELAY_MS, GUEST_ID_KEY } from '../constants/chat.constants'
import { chatRepository } from './chat.repository'
import { websocketService } from '../../../shared/lib/websocket'
import { api } from '../../../shared/lib/api'

function makeMessage(
  conversation_id: string,
  sender_role: ChatMessage['sender_role'],
  message: string,
  product_context?: ProductChatContext,
  reply_to?: { id: string; sender_role: string; message: string } | null,
  reply_to_id?: string | null,
  attachments?: ChatMessage['attachments'],
): ChatMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 12)}`,
    conversation_id,
    sender_role,
    message,
    product_context,
    reply_to,
    reply_to_id,
    attachments,
    created_at: new Date().toISOString(),
  }
}

function toProductAttachments(products: ProductChatContext[]): ChatMessage['attachments'] {
  if (products.length === 0) return undefined
  return products.map((p) => ({
    id: `att-${p.id}-${Math.random().toString(36).slice(2, 6)}`,
    chat_message_id: '',
    type: 'product' as const,
    value: p.id,
    metadata: p as unknown as Record<string, unknown>,
  }))
}

function pickBotReply(conversation: ChatConversation): string {
  const botCount = conversation.messages.filter((m) => m.sender_role === 'bot').length
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
    const local = chatRepository.ensureConversation(identity)
    try {
      const synced = await this.syncConversationRemote(identity, local)
      return synced || local
    } catch {
      return local
    }
  },

  async syncConversationRemote(identity: ChatIdentity, localConv: ChatConversation): Promise<ChatConversation> {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
      const res = await fetch(`${apiBase}/ecommerce/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_user_id:
            identity.customer_user_id && !identity.customer_user_id.startsWith('guest-')
              ? identity.customer_user_id
              : null,
          customer_name: identity.customer_name || localConv.customer_name || 'Tamu',
          customer_email: identity.customer_email || localConv.customer_email || '',
          customer_phone: identity.customer_phone || localConv.customer_phone || '',
        }),
      })

      if (!res.ok) return localConv
      const data = await res.json()
      const remoteConv = data?.data
      if (!remoteConv || !remoteConv.id) return localConv

      const oldId = localConv.id
      const remoteId = remoteConv.id

      if (oldId !== remoteId) {
        chatRepository.syncConversationId(oldId, remoteId)
      }

      // Populate remote messages into local repository
      if (Array.isArray(remoteConv.messages) && remoteConv.messages.length > 0) {
        for (const rm of remoteConv.messages) {
          chatRepository.insertMessage(remoteId, {
            id: rm.id,
            conversation_id: remoteId,
            sender_role: rm.sender_role,
            sender_user_id: rm.sender_user_id,
            sender_name: rm.sender_name,
            sender_avatar: rm.sender_avatar,
            message: rm.message,
            reply_to_id: rm.reply_to_id || null,
            reply_to: rm.reply_to || null,
            is_read: rm.is_read,
            created_at: rm.created_at,
          })
        }
      }

      return chatRepository.get(remoteId) || { ...localConv, id: remoteId }
    } catch (err) {
      console.warn('[ChatService] Failed to sync conversation with backend DB:', err)
      return localConv
    }
  },

  async persistMessageRemote(
    conversationId: string,
    messageText: string,
    identity: ChatIdentity,
    replyToId?: string,
  ): Promise<void> {
    let targetId = conversationId
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId)) {
      try {
        const synced = await this.getOrCreate(identity)
        if (synced && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(synced.id)) {
          targetId = synced.id
        } else {
          return
        }
      } catch {
        return
      }
    }
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
      await fetch(`${apiBase}/ecommerce/chats/${targetId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: 'customer',
          sender_user_id:
            identity.customer_user_id && !identity.customer_user_id.startsWith('guest-')
              ? identity.customer_user_id
              : null,
          message: messageText,
          reply_to_id: replyToId || undefined,
        }),
      })
    } catch (err) {
      console.warn('[ChatService] Failed to persist message to PostgreSQL:', err)
    }
  },

  async sendCustomerMessage(
    identity: ChatIdentity,
    text: string,
    productContext?: ProductChatContext,
    replyTo?: ChatMessage | null,
    productContexts?: ProductChatContext[],
  ): Promise<ChatConversation> {
    const conversation = chatRepository.ensureConversation(identity)
    const replyMeta = replyTo
      ? {
          id: replyTo.id,
          sender_role: replyTo.sender_role || 'customer',
          message: replyTo.message,
        }
      : null
    const attachments = productContexts && productContexts.length > 0 ? toProductAttachments(productContexts) : undefined
    const effectiveCtx = productContext || (productContexts && productContexts.length > 0 ? productContexts[productContexts.length - 1] : undefined)

    const message = makeMessage(
      conversation.id,
      'customer',
      text,
      effectiveCtx,
      replyMeta,
      replyTo ? replyTo.id : null,
      attachments,
    )
    if (message.attachments) {
      for (const a of message.attachments) a.chat_message_id = message.id
    }
    const updated = chatRepository.insertMessage(conversation.id, message)

    websocketService.send({
      type: 'chat_message',
      conversation_id: conversation.id,
      customer_email: identity.customer_email || conversation.customer_email,
      customer_phone: identity.customer_phone || conversation.customer_phone,
      customer_user_id: identity.customer_user_id || conversation.customer_user_id,
      conversation: {
        ...updated,
        product_context: productContext,
      },
      message,
    })

    void this.persistMessageRemote(conversation.id, text, identity, replyTo ? replyTo.id : undefined)

    // Only invoke mock bot if WebSocket is NOT connected (offline fallback simulation)
    if (!websocketService.isConnected()) {
      const botReply = pickBotReply(updated)
      setTimeout(() => {
        const botMsg = makeMessage(updated.id, 'bot', botReply)
        const afterBot = chatRepository.insertMessage(updated.id, botMsg)
        if (afterBot) {
          websocketService.send({
            type: 'chat_message',
            conversation_id: updated.id,
            conversation: afterBot,
            message: botMsg,
          })
        }
      }, BOT_REPLY_DELAY_MS)
    }

    return updated
  },

  async sendAgentMessage(conversation_id: string, text: string): Promise<ChatConversation> {
    const message = makeMessage(conversation_id, 'agent', text)
    const updated = chatRepository.insertMessage(conversation_id, message)

    websocketService.send({
      type: 'chat_message',
      conversation_id,
      conversation: updated,
      message,
    })

    return updated
  },

  async markRead(conversation_id: string, by: 'customer' | 'agent'): Promise<void> {
    chatRepository.markRead(conversation_id, by)
    websocketService.sendReadReceipt({
      conversation_id,
      reader_role: by === 'customer' ? 'customer' : 'admin',
      read_at: new Date().toISOString(),
    })
  },

  handleIncomingReadReceipt(
    conversation_id: string,
    reader_role: 'customer' | 'admin' | 'agent',
  ): ChatConversation | null {
    return chatRepository.handleIncomingReadReceipt(conversation_id, reader_role)
  },

  transferGuestHistory(identity: ChatIdentity): ChatConversation | null {
    const updated = chatRepository.transferGuestHistory(identity)
    if (updated) {
      websocketService.sendPresence({
        role: 'customer',
        conversation_id: updated.id,
        user_id: identity.customer_user_id,
        customer_user_id: identity.customer_user_id,
        customer_email: identity.customer_email,
        user_name: identity.customer_name,
        status: 'online',
        timestamp: Date.now(),
      })

      if (identity.customer_user_id && identity.customer_email) {
        void api.post('/ecommerce/chats/transfer', {
          email: identity.customer_email,
          phone: identity.customer_phone || '',
          customer_user_id: identity.customer_user_id,
          customer_name: identity.customer_name,
        }).catch((e) => console.warn('[ChatService] Backend transfer failed:', e))
      }
    }
    return updated
  },

  getLocalMessagesPage(
    conversationId: string,
    limit = 20,
    before?: string,
  ): { messages: ChatMessage[]; hasMore: boolean } {
    const conv = chatRepository.get(conversationId)
    let all = conv?.messages ? [...conv.messages] : []
    all.sort(
      (a, b) =>
        (a.created_at ? new Date(a.created_at).getTime() : 0) -
        (b.created_at ? new Date(b.created_at).getTime() : 0),
    )

    if (before) {
      const beforeMs = new Date(before).getTime()
      all = all.filter(
        (m) => (m.created_at ? new Date(m.created_at).getTime() : 0) < beforeMs,
      )
    }

    const startIndex = Math.max(0, all.length - limit)
    const paged = all.slice(startIndex)
    const hasMore = startIndex > 0

    return {
      messages: paged,
      hasMore,
    }
  },

  async fetchMessagesPage(
    conversationId: string,
    limit = 20,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)
    if (!isUUID) {
      return this.getLocalMessagesPage(conversationId, limit, before)
    }

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
      let url = `${apiBase}/ecommerce/chats/${conversationId}/messages?limit=${limit}`
      if (before) {
        url += `&before=${encodeURIComponent(before)}`
      }

      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        return this.getLocalMessagesPage(conversationId, limit, before)
      }

      const json = await res.json()
      const remoteMsgs = json?.data
      if (!Array.isArray(remoteMsgs)) {
        return this.getLocalMessagesPage(conversationId, limit, before)
      }

      const mappedMsgs: ChatMessage[] = remoteMsgs.map((rm) => ({
        id: rm.id,
        conversation_id: conversationId,
        sender_role: rm.sender_role,
        sender_user_id: rm.sender_user_id,
        sender_name: rm.sender_name,
        sender_avatar: rm.sender_avatar,
        message: rm.message,
        reply_to_id: rm.reply_to_id || null,
        reply_to: rm.reply_to || null,
        is_read: rm.is_read,
        created_at: rm.created_at,
      }))

      for (const msg of mappedMsgs) {
        chatRepository.insertMessage(conversationId, msg)
      }

      const hasMore =
        typeof json?.meta?.has_more === 'boolean'
          ? json.meta.has_more
          : mappedMsgs.length >= limit

      return {
        messages: mappedMsgs,
        hasMore,
      }
    } catch (err) {
      console.warn('[ChatService] Failed to fetch paged messages:', err)
      return this.getLocalMessagesPage(conversationId, limit, before)
    }
  },
}
