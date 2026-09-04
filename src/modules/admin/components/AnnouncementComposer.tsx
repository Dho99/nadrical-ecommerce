import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { notificationService } from '../../notifications'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '../../../shared/components/ui'

export function AnnouncementComposer() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Fill in both a title and a message')
      return
    }
    notificationService.broadcast(title, message)
    setTitle('')
    setMessage('')
    toast.success('Announcement broadcast to all customers')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Megaphone className="size-4 text-primary" /> Broadcast to customers
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title — e.g. New drops this Friday"
          aria-label="Announcement title"
        />
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message — shown in every customer's notification panel"
          aria-label="Announcement message"
          rows={4}
        />
        <Button type="button" className="self-end" onClick={handleSend}>
          <Megaphone /> Send announcement
        </Button>
      </CardContent>
    </Card>
  )
}