import { ChatInbox } from '../../modules/admin'

export function AdminChatPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store admin · Live support
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Chat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conversations from the storefront chat widget. Replies are delivered instantly.
        </p>
      </header>
      <ChatInbox />
    </div>
  )
}
