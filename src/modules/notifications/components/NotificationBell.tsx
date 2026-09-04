import { useState } from 'react'
import { Bell, BellRing, CheckCheck, Megaphone, Package, Trash2 } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import {
  Badge,
  Button,
  EmptyState,
  Separator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui'
import { useNotifications } from '../hooks/useNotifications'
import { timeAgo } from '../utils/notification.utils'
import type { AppNotification } from '../types/notification.type'

function NotificationRow({ item, onOpen }: { item: AppNotification; onOpen: () => void }) {
  const isOrder = item.type === 'order'
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border-l-2 px-3 py-3 text-left transition-colors',
        item.is_read
          ? 'border-transparent opacity-60'
          : 'border-primary bg-primary/5 hover:bg-primary/10',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
          isOrder ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground',
        )}
      >
        {isOrder ? <Package className="size-4" /> : <Megaphone className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {item.content}
        </span>
        <span className="mt-1 block font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          {timeAgo(item.created_at)}
        </span>
      </span>
      {!item.is_read && <span className="mt-1.5 ml-auto size-2 shrink-0 rounded-full bg-primary" />}
    </button>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { items, unreadCount, loaded, sync, markRead, markAllRead, clearAll } = useNotifications()

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) sync()
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          {unreadCount > 0 ? <BellRing /> : <Bell />}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full px-0 text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Bell className="size-5 text-primary" />
          <h2 className="font-display text-base font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-1">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!loaded ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Checking for updates…</p>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Bell className="size-10" />}
              title="You're all caught up"
              description="Order status changes and store announcements will show up here."
            />
          ) : (
            <ul className="flex flex-col gap-1" aria-label="Notifications">
              {items.map((item) => (
                <li key={item.id}>
                  <NotificationRow item={item} onOpen={() => markRead(item.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center gap-2 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="grow"
                disabled={unreadCount === 0}
                onClick={markAllRead}
              >
                <CheckCheck /> Mark all read
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 /> Clear
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
