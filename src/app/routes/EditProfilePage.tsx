import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/shared/lib/alert'
import {
  Button,
  Card,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
} from '../../shared/components/ui'
import { useAuth } from '../../modules/auth'
import { profileSchema, type ProfileInput } from '../../modules/profile/schemas/profile.schema'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../shared/components/ui/alert-dialog'

export function EditProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: { full_name: user?.full_name ?? '', phone: user?.phone ?? '' },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await updateProfile({
        full_name: values.full_name,
        phone: values.phone || undefined,
        current_password: values.current_password || undefined,
        new_password: values.new_password || undefined,
      })
      toast.success('Profile updated')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Update failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleDeleteAccount = () => {
    logout()
    navigate('/login')
    toast.success('Account deleted')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">Edit profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update your account details. Email cannot be changed.</p>

        <Form {...form}>
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium">Email</p>
              <Input value={user?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email is read-only</p>
            </div>

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

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <Card className="h-fit border-destructive/30 p-6">
        <h3 className="font-semibold text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Separator className="my-4" />
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 /> Delete account
        </Button>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, order history, and all saved data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
