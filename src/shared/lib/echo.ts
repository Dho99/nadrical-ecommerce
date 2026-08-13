import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo: Echo<'reverb'> | null = null

const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST

export function getEcho(): Echo<'reverb'> | null {
  if (echo !== null) return echo
  if (!REVERB_APP_KEY || !REVERB_HOST) return null

  const port = Number(import.meta.env.VITE_REVERB_PORT ?? 443)
  const tls = (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https'

  echo = new Echo<'reverb'>({
    broadcaster: 'reverb',
    key: REVERB_APP_KEY,
    Pusher,
    wsHost: REVERB_HOST,
    wsPort: port,
    wssPort: port,
    forceTLS: tls,
    enabledTransports: ['ws', 'wss'],
  })

  return echo
}

export function destroyEcho(): void {
  echo?.disconnect()
  echo = null
}
