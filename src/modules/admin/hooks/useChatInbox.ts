import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { ChatConversation, ChatMessage } from '../../chat/types/chat.type'
import { chatRepository } from '../../chat/services/chat.repository'
import { chatService } from '../../chat/services/chat.service'
import { websocketService } from '../../../shared/lib/websocket'

function isChatMessagePayload(
  payload: unknown,
): payload is { type: 'chat_message'; conversation_id: string; message: ChatMessage } {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      (payload as { type?: unknown }).type === 'chat_message' &&
      typeof (payload as { conversation_id?: unknown }).conversation_id === 'string' &&
      typeof (payload as { message?: unknown }).message === 'object' &&
      (payload as { message?: unknown }).message !== null,
  )
}

export function useChatInbox(limit = 15) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [total, setTotal] = useState(0)
  const [cursor, setCursor] = useState<number | null>(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  const active = conversations.find((c) => c.id === activeId) ?? null

  const readPage = useCallback(() => {
    const sorted = [...chatRepository.list()].sort(
      (a, b) => Date.parse(b.last_activity_at || '') - Date.parse(a.last_activity_at || ''),
    )
    setTotal(sorted.length)
    const offset = Math.max(0, cursor ?? 0)
    setConversations(sorted.slice(offset, offset + limit))
  }, [cursor, limit])

  useEffect(() => {
    let cancelled = false

    const load = () => {
      if (cancelled) return
      readPage()
      setStatus('success')
    }

    load()

    const unsubscribe = websocketService.subscribe((payload: unknown) => {
      if (isChatMessagePayload(payload)) {
        chatRepository.insertMessage(payload.conversation_id, payload.message)
        load()
      }
    })

    window.addEventListener('storage', load)
    return () => {
      cancelled = true
      window.removeEventListener('storage', load)
      unsubscribe()
    }
  }, [cursor, limit, attempt, readPage])

  useEffect(() => {
    if (activeId) void chatService.markRead(activeId, 'agent')
  }, [activeId])

  const sendReply = async (text: string) => {
    if (!activeId) return
    await chatService.sendAgentMessage(activeId, text)
    readPage()
  }

  const pageStart = (cursor ?? 0) + 1
  const pageEnd = Math.min(total, pageStart + limit - 1)
  const hasNext = pageEnd < total
  const hasPrev = (cursor ?? 0) > 0

  return {
    conversations,
    total,
    cursor,
    pageStart,
    status,
    active,
    activeId,
    open: setActiveId,
    sendReply,
    goNext: () => hasNext && setCursor((prev) => (prev ?? 0) + limit),
    goPrev: () => hasPrev && setCursor((prev) => Math.max(0, (prev ?? 0) - limit)),
    refetch: () => setAttempt((a) => a + 1),
  }
}
