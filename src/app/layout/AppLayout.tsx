import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { ChatWidget } from '../../modules/chat'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { chatService } from '../../modules/chat/services/chat.service'
import type { ChatIdentity } from '../../modules/chat/types/chat.type'

export function AppLayout() {
  const { user } = useAuth()
  const identity: ChatIdentity = user
    ? { id: user.id, name: user.name, email: user.email }
    : { id: chatService.getGuestId(), name: 'Guest' }

  return (
    <div className="flex min-h-svh flex-col">
      <ScrollRestoration />
      <SiteHeader />
      <main className="grow">
        <Outlet />
      </main>
      <SiteFooter />
      <ChatWidget identity={identity} />
    </div>
  )
}
