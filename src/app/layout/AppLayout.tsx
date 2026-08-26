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
    ? { customer_user_id: user.id, customer_name: user.full_name ?? 'Guest', customer_email: user.email }
    : { customer_user_id: chatService.getGuestId(), customer_name: 'Guest' }

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
