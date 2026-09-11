import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Pencil, Upload, X } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '../../../shared/components/ui'
import { useAuth } from '../../auth'
import { profileSchema, type ProfileInput } from '../schemas/profile.schema'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function EditProfileDialog() {
  const { user, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch not memoizable by React Compiler
  const avatarUrl = form.watch('avatar_url')
  const displayPreview = preview ?? avatarUrl ?? user?.avatar_url ?? null

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max 2MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Must be an image')
      return
    }
    form.setValue('avatar_file', file, { shouldValidate: true, shouldDirty: true })
    const dataUrl = await fileToDataUrl(file)
    setPreview(dataUrl)
    form.setValue('avatar_url', dataUrl, { shouldDirty: true })
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setFormError(null)
    try {
      let dataUrl: string | undefined = values.avatar_url || undefined
      if (values.avatar_file) {
        dataUrl = await fileToDataUrl(values.avatar_file)
      } else if (preview) {
        dataUrl = preview
      }
      await updateProfile({
        full_name: values.full_name,
        phone: values.phone || undefined,
        avatar_url: dataUrl,
        current_password: values.current_password || undefined,
        new_password: values.new_password || undefined,
      })
      toast.success('Profile updated')
      setOpen(false)
      setPreview(null)
      form.reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Update failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil /> Edit profile
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) {
            setPreview(null)
            form.reset({
              full_name: user?.full_name ?? '',
              phone: user?.phone ?? '',
              avatar_url: user?.avatar_url ?? '',
            })
          } else {
            setPreview(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your account details. Email cannot be changed.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                  {displayPreview ? (
                    <img src={displayPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload /> Upload image
                  </Button>
                  {displayPreview ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreview(null)
                        form.setValue('avatar_url', '', { shouldDirty: true })
                        form.setValue('avatar_file', undefined, { shouldDirty: true })
                        if (fileRef.current) fileRef.current.value = ''
                      }}
                    >
                      <X /> Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <FormField
                name="avatar_file"
                render={() => (
                  <FormItem>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">JPG/PNG/WebP, max 2MB. Preview shown before save.</p>
                  </FormItem>
                )}
              />
              <FormField
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" placeholder="+1 555 010 2030" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" placeholder="Only required to change password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="Leave blank to keep current" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && (
                <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
