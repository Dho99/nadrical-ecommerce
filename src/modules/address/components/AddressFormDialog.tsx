import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '../../../shared/components/ui'
import { ADDRESS_LABELS, COUNTRY_OPTIONS, DEFAULT_COUNTRY } from '../constants/address.constants'
import { addressSchema, type AddressSchema } from '../schemas/address.schema'
import { PostalCodeField } from '../../checkout/components/PostalCodeField'

interface AddressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<AddressSchema>
  title: string
  submitLabel: string
  onSubmit: (values: AddressSchema) => void
}

export function AddressFormDialog({
  open,
  onOpenChange,
  defaultValues,
  title,
  submitLabel,
  onSubmit,
}: AddressFormDialogProps) {
  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: {
      label: 'Home',
      recipient_name: '',
      recipient_phone: '',
      address_line_1: '',
      address_line_2: '',
      district: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: DEFAULT_COUNTRY,
      is_primary: false,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open)
      form.reset({
        label: 'Home',
        recipient_name: '',
        recipient_phone: '',
        address_line_1: '',
        address_line_2: '',
        district: '',
        city: '',
        province: '',
        postal_code: '',
        country_code: DEFAULT_COUNTRY,
        is_primary: false,
        ...defaultValues,
      })
  }, [open, defaultValues, form])

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values)
    onOpenChange(false)
    form.reset()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Saved addresses are used to pre-fill checkout for this account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormField
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-label="Address label">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_LABELS.map((label) => (
                          <SelectItem key={label} value={label}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="recipient_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" placeholder="+62 812 3456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PostalCodeField
              postalCodeName="postal_code"
              cityName="city"
              addressName="address_line_1"
              districtName="district"
              provinceName="province"
              countryName="country_code"
            />

            <FormField
              name="address_line_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Textarea
                      autoComplete="street-address"
                      placeholder="Jl. Contoh No. 12"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="address_line_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address line 2 (optional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="address-line2" placeholder="RT/RW, block, unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level3" placeholder="Kecamatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" placeholder="Kota / Kabupaten" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level1" placeholder="Provinsi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-label="Country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((code) => (
                            <SelectItem key={code} value={code}>
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="is_primary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        id="is_primary"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Set as primary address"
                      />
                    </FormControl>
                    <Label htmlFor="is_primary" className="text-sm text-muted-foreground">
                      Set as primary address
                    </Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}