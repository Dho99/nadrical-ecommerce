export type WSConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export type WSCallback<T = unknown> = (payload: T) => void
export type WSStatusCallback = (status: WSConnectionStatus) => void

export interface WSEvent<T = unknown> {
  type: string
  payload?: T
  [key: string]: unknown
}

let _overrideUrl: string | null = null

export function setWsUrl(url: string): void {
  _overrideUrl = url
}

function resolveWsUrl(): string {
  if (_overrideUrl) return _overrideUrl

  if (import.meta.env.VITE_WEBSOCKET_URL) {
    return import.meta.env.VITE_WEBSOCKET_URL
  }

  const host = import.meta.env.VITE_WS_HOST
  const port = import.meta.env.VITE_WS_PORT
  if (host && port) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${host}:${port}/ws`
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (apiBase) {
    try {
      const url = new URL(apiBase, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8080')
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${url.host}/ws`
    } catch {
      // ignore
    }
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const hostname = window.location.hostname || '127.0.0.1'
    return `${protocol}//${hostname}:8080/ws`
  }

  return 'ws://127.0.0.1:8080/ws'
}

function parseMessage(data: string): unknown {
  try {
    const parsed = JSON.parse(data) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'body' in parsed &&
      typeof (parsed as { body?: unknown }).body === 'string'
    ) {
      try {
        return JSON.parse((parsed as { body: string }).body) as unknown
      } catch {
        return parsed
      }
    }
    return parsed
  } catch {
    return { type: 'raw', data }
  }
}

class WebSocketService {
  private socket: WebSocket | null = null
  private listeners = new Set<WSCallback>()
  private typeListeners = new Map<string, Set<WSCallback>>()
  private statusListeners = new Set<WSStatusCallback>()
  private status: WSConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private messageQueue: string[] = []
  private isManuallyClosed = false

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.status === 'disconnected' || this.status === 'reconnecting') {
          this.reconnectAttempts = 0
          this.connect()
        }
      })
    }
  }

  public getStatus(): WSConnectionStatus {
    return this.status
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  private setStatus(next: WSConnectionStatus) {
    if (this.status !== next) {
      this.status = next
      this.statusListeners.forEach((cb) => {
        try {
          cb(next)
        } catch (err) {
          console.error('[WebSocket] Status listener error:', err)
        }
      })
    }
  }

  public onStatusChange(callback: WSStatusCallback): () => void {
    this.statusListeners.add(callback)
    callback(this.status)
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  public connect(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
    ) {
      return
    }

    this.isManuallyClosed = false
    this.clearReconnectTimer()

    const wsUrl = resolveWsUrl()
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.reconnectAttempts = 0
        this.setStatus('connected')
        this.startHeartbeat()
        this.flushQueue()
      }

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const payload = parseMessage(event.data)
          this.listeners.forEach((cb) => {
            try {
              cb(payload)
            } catch (err) {
              console.error('[WebSocket] Listener error:', err)
            }
          })

          if (payload && typeof payload === 'object' && 'type' in payload && typeof (payload as { type: unknown }).type === 'string') {
            const eventType = (payload as { type: string }).type
            const handlers = this.typeListeners.get(eventType)
            if (handlers) {
              handlers.forEach((cb) => {
                try {
                  cb(payload)
                } catch (err) {
                  console.error(`[WebSocket] Type listener error for '${eventType}':`, err)
                }
              })
            }
          }
        } catch (err) {
          console.error('[WebSocket] Message processing error:', err)
        }
      }

      this.socket.onclose = () => {
        this.stopHeartbeat()
        this.socket = null

        if (this.isManuallyClosed) {
          this.setStatus('disconnected')
          return
        }

        this.setStatus('disconnected')
        this.scheduleReconnect()
      }

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Connection issue:', error)
      }
    } catch (err) {
      console.error('[WebSocket] Failed to establish connection:', err)
      this.socket = null
      this.setStatus('disconnected')
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.isManuallyClosed || this.reconnectTimer !== null) return

    const baseDelay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000)
    const jitter = Math.random() * 500
    const delay = Math.round(baseDelay + jitter)

    this.reconnectAttempts++
    this.setStatus('reconnecting')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.socket?.send(JSON.stringify({ type: 'ping' }))
        } catch {
          // ignore
        }
      }
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private flushQueue(): void {
    if (!this.isConnected()) return
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()
      if (msg) {
        try {
          this.socket?.send(msg)
        } catch (err) {
          console.error('[WebSocket] Failed to flush queued message:', err)
          this.messageQueue.unshift(msg)
          break
        }
      }
    }
  }

  public subscribe(callback: WSCallback): () => void {
    this.listeners.add(callback)
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect()
    }
    return () => {
      this.listeners.delete(callback)
    }
  }

  public on<T = unknown>(eventType: string, callback: WSCallback<T>): () => void {
    if (!this.typeListeners.has(eventType)) {
      this.typeListeners.set(eventType, new Set())
    }
    const set = this.typeListeners.get(eventType)!
    set.add(callback as WSCallback)

    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect()
    }

    return () => {
      set.delete(callback as WSCallback)
      if (set.size === 0) {
        this.typeListeners.delete(eventType)
      }
    }
  }

  public send(payload: unknown): boolean {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload)
    if (this.isConnected()) {
      try {
        this.socket!.send(raw)
        return true
      } catch (err) {
        console.error('[WebSocket] Error sending message, queueing:', err)
      }
    }

    if (this.messageQueue.length < 100) {
      this.messageQueue.push(raw)
    }

    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect()
    }

    return false
  }

  public disconnect(): void {
    this.isManuallyClosed = true
    this.clearReconnectTimer()
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.setStatus('disconnected')
  }
}

export const websocketService = new WebSocketService()
