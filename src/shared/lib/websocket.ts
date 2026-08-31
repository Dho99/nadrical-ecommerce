type WSCallback = (payload: unknown) => void

let socket: WebSocket | null = null
const listeners = new Set<WSCallback>()

let _url: string | null = null

function getWsUrl(): string {
  if (_url) return _url
  _url = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws'
  return _url
}

export function setWsUrl(url: string): void {
  _url = url
}

function parseMessage(data: string): unknown {
  const parsed = JSON.parse(data) as unknown
  if (
    parsed &&
    typeof parsed === 'object' &&
    'body' in parsed &&
    typeof (parsed as { body?: unknown }).body === 'string'
  ) {
    return JSON.parse((parsed as { body: string }).body) as unknown
  }
  return parsed
}

export const websocketService = {
  connect() {
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      return
    }

    const wsUrl = getWsUrl()
    console.log('Connecting to WebSocket:', wsUrl)

    try {
      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('WebSocket connection established')
      }

      socket.onmessage = (event) => {
        try {
          const payload = parseMessage(event.data)
          listeners.forEach((cb) => cb(payload))
        } catch {
          listeners.forEach((cb) => cb({ type: 'raw', data: event.data }))
        }
      }

      socket.onclose = () => {
        console.log('WebSocket connection closed, reconnecting in 3s...')
        socket = null
        setTimeout(() => this.connect(), 3000)
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      console.error('Failed to establish WebSocket:', err)
      setTimeout(() => this.connect(), 5000)
    }
  },

  subscribe(callback: WSCallback) {
    listeners.add(callback)
    if (!socket) {
      this.connect()
    }
    return () => {
      listeners.delete(callback)
    }
  },

  send(payload: unknown) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
    } else {
      console.warn('WebSocket is not open. Reconnecting...')
      this.connect()
    }
  },

  disconnect() {
    if (socket) {
      socket.close()
      socket = null
    }
  },
}