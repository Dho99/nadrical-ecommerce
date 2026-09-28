import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { MapPin } from 'lucide-react'
import { FormField, FormItem, FormLabel, FormMessage } from '../../../shared/components/ui'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../../shared/components/ui/combobox'
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
  postalCodeName = 'postal_code',
  cityName = 'city',
  addressName = 'address',
  districtName = 'district',
  provinceName = 'province',
  countryName = 'countryCode',
}: PostalCodeFieldProps) {
  const form = useFormContext<Record<string, unknown>>()
  const { query, setQuery, results, isSearching, searched } = usePostalLookup()

  const postalCodeValue = form.watch(postalCodeName) as string | undefined
  const selectedPlaceRef = useRef<PostalPlace | null>(null)

  useEffect(() => {
    if (postalCodeValue && !query) {
      setQuery(String(postalCodeValue))
    }
  }, [postalCodeValue, query, setQuery])

  const handleSelect = (place: PostalPlace) => {
    selectedPlaceRef.current = place
    form.setValue(postalCodeName, place.postal_code, { shouldValidate: true, shouldDirty: true })
    if (cityName) {
      form.setValue(cityName, place.city, { shouldValidate: true, shouldDirty: true })
    }
    if (districtName) {
      form.setValue(districtName, place.district, { shouldValidate: true, shouldDirty: true })
    }
    if (provinceName) {
      form.setValue(provinceName, place.province, { shouldValidate: true, shouldDirty: true })
    }
    if (countryName) {
      form.setValue(countryName, 'ID', { shouldValidate: true, shouldDirty: true })
    }
    if (addressName) {
      const currentAddress = (form.getValues(addressName) || '') as string
      const cleanAddress = currentAddress.replace(/^Kel\.\s*[^,]+,\s*(Kec\.\s*[^,]+,\s*)?/, '')
      const prefix = `Kel. ${place.village}, Kec. ${place.district}${cleanAddress ? ', ' : ''}`
      form.setValue(addressName, prefix + cleanAddress, { shouldValidate: true, shouldDirty: true })
    }

    const fieldsToTrigger = [postalCodeName, cityName, districtName, provinceName, countryName, addressName].filter(Boolean)
    form.trigger(fieldsToTrigger)
    setQuery(place.postal_code)
  }

  return (
    <FormField
      name={postalCodeName}
      render={({ field }) => {
        const strValue = field.value != null && field.value !== '' ? String(field.value) : ''
        const found = strValue ? (results.find((p) => p.postal_code === strValue) ?? null) : null
        const selected = strValue
          ? (found ??
              (selectedPlaceRef.current?.postal_code === strValue ? selectedPlaceRef.current : null) ??
              ({ postal_code: strValue, city: '', district: '', province: '', village: '' } as PostalPlace))
          : null

        return (
          <FormItem className={className}>
            <FormLabel>Postal code</FormLabel>
            <Combobox
              items={results}
              value={selected}
              filter={null}
              highlightItemOnHover
              itemToStringLabel={(place: PostalPlace) => place.postal_code}
              itemToStringValue={(place: PostalPlace) => place.postal_code}
              isItemEqualToValue={(a, b) => {
                if (!a || !b) return a === b
                return a.postal_code === b.postal_code && a.village === b.village
              }}
               onInputValueChange={(value: string) => {
                 setQuery(value)
               }}
               onValueChange={(value: PostalPlace | null) => {
                 if (value) {
                   handleSelect(value)
                 } else {
                   field.onChange('')
                 }
               }}
            >
              <ComboboxInput placeholder="Ketik kode pos..." />
              <ComboboxContent>
                {isSearching ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">Looking up postal code…</div>
                ) : null}
                <ComboboxEmpty>
                  {searched ? 'No places found for this code' : `Type at least ${POSTAL_MIN_LENGTH} digits to look up`}
                </ComboboxEmpty>
                <ComboboxList>
                  {(place: PostalPlace) => (
                    <ComboboxItem key={`${place.postal_code}-${place.village}`} value={place}>
                      <MapPin />
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-medium">Kel. {place.village}, Kec. {place.district}</span>
                        <span className="text-xs text-muted-foreground">
                          {place.city}, {place.province}
                        </span>
                      </div>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{place.postal_code}</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FormMessage />
            <p className="text-xs text-muted-foreground">Select a suggestion to auto-fill city, district, province & address.</p>
          </FormItem>
        )
      }}
    />
  )
}
