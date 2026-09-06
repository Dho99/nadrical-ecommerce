import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '../../../shared/components/ui'
import { guestProfileSchema, type GuestProfileInput } from '../schemas/guest.schema'

interface GuestIdentityFormProps {
  initialValues?: Partial<GuestProfileInput>
  onSubmit: (values: GuestProfileInput) => void
  onLogin: () => void
}

export function GuestIdentityForm({ initialValues, onSubmit, onLogin }: GuestIdentityFormProps) {
  const form = useForm<GuestProfileInput>({
    resolver: zodResolver(guestProfileSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', ...initialValues },
  })

  const submit = form.handleSubmit((values) => {
    onSubmit(values)
  })

  return (
    <div className="flex flex-col gap-4 overflow-y-auto bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">
        Halo! Isi data diri kamu dulu agar tim support bisa menghubungi balik.
      </p>

      <Form {...form}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Nama</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Nama kamu" className="h-10 bg-background" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="email@contoh.com" className="h-10 bg-background" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Nomor HP</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" placeholder="0812 3456 7890" className="h-10 bg-background" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-1 w-full">
            Mulai chat <Send />
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        Sudah punya akun?{' '}
        <Link to="/login" onClick={onLogin} className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
