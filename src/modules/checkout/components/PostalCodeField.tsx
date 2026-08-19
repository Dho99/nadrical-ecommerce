import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { MapPin } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { POSTAL_MIN_LENGTH } from '../constants/postal.constants'
import { usePostalLookup } from '../hooks/usePostalLookup'
import type { PostalPlace } from '../services/postal.service'

interface PostalCodeFieldProps {
  className?: string
  postalCodeName?: string
  cityName?: string
  addressName?: string
  districtName?: string
  provinceName?: string
  countryName?: string
}

export function PostalCodeField({
  className = 'sm:col-span-2',
  postalCodeName = 'postalCode',
  cityName = 'city',
  addressName = 'address',
  districtName = 'district',
  provinceName = 'province',
  countryName = 'countryCode',
}: PostalCodeFieldProps) {
  const form = useFormContext<Record<string, unknown>>()
  const { setQuery, results, isSearching, searched } = usePostalLookup()
  const [open, setOpen] = useState(false)

  const handleSelect = (place: PostalPlace) => {
    form.setValue(postalCodeName, place.postalCode)
    form.setValue(cityName, place.city)
    form.setValue(districtName, place.district)
    form.setValue(provinceName, place.state)
    form.setValue(countryName, 'ID')
    const currentAddress = (form.getValues(addressName) || '') as string
    const prefix = `Kel. ${place.village}, `
    if (!currentAddress.startsWith('Kel. ')) {
      form.setValue(addressName, prefix + currentAddress)
    }
    form.trigger([postalCodeName, cityName, districtName, provinceName, countryName, addressName])
    setQuery('')
    setOpen(false)
  }

  return (
    <FormField
      name={postalCodeName}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel>Postal code</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <FormControl>
                <Input
                  autoComplete="postal-code"
                  placeholder="10110"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    setQuery(e.target.value)
                    if (e.target.value.trim().length >= POSTAL_MIN_LENGTH) setOpen(true)
                  }}
                />
              </FormControl>
            </PopoverAnchor>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="w-[var(--radix-popover-anchor-width)] p-0"
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {isSearching ? (
                    <CommandLoading>Looking up postal code…</CommandLoading>
                  ) : results.length > 0 ? (
                    <CommandGroup heading="Places">
                      {results.map((place) => (
                        <CommandItem
                          key={`${place.postalCode}-${place.village}`}
                          value={`${place.postalCode} ${place.village}`}
                          onSelect={() => handleSelect(place)}
                        >
                          <MapPin />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">Kel. {place.village}, Kec. {place.district}</span>
                            <span className="text-xs text-muted-foreground">
                              {place.city}, {place.state}
                            </span>
                          </div>
                          <span className="ml-auto font-mono text-xs text-muted-foreground">
                            {place.postalCode}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : searched ? (
                    <CommandEmpty>No places found for this code</CommandEmpty>
                  ) : (
                    <CommandEmpty>
                      Type at least {POSTAL_MIN_LENGTH} digits to look up
                    </CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
          <p className="text-xs text-muted-foreground">
            Select a suggestion to auto-fill city, district, province & address.
          </p>
        </FormItem>
      )}
    />
  )
}
