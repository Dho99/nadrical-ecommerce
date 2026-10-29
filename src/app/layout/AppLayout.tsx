import { useEffect, useMemo } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { PromoPopupModal } from './PromoPopupModal'
import { ChatWidget } from '../../modules/chat'
import { useAuth, useInitializeAuth } from '../../modules/auth/hooks/useAuth'
import { chatService } from '../../modules/chat/services/chat.service'
import type { ChatIdentity } from '../../modules/chat/types/chat.type'

export function AppLayout() {
  useInitializeAuth()
  const { user, isAuthed } = useAuth()
  const identity: ChatIdentity = useMemo(() => {
    return user
      ? { customer_user_id: user.id, customer_name: user.full_name ?? 'Guest', customer_email: user.email }
      : { customer_name: 'Guest' }
  }, [user?.id, user?.email, user?.full_name])

  useEffect(() => {
    if (user?.email) {
      chatService.transferGuestHistory(identity)
    }
  }, [user?.id, user?.email, identity])

  return (
    <div className="flex min-h-svh flex-col">
      <ScrollRestoration />
      <SiteHeader />
      <main className="grow">
        <Outlet />
      </main>
      <SiteFooter />
      <PromoPopupModal />
      <ChatWidget identity={identity} isGuest={!isAuthed} />
    </div>
  )
}
