export type CountryCode = 'ID' | 'US' | 'MY' | 'SG'

export interface AddressRecord {
  id: string
  email: string
  label: string
  fullName: string
  phone: string
  address: string
  addressLine2?: string
  district?: string
  city: string
  province?: string
  postalCode: string
  countryCode?: CountryCode
  isPrimary?: boolean
}

export type AddressInput = Omit<AddressRecord, 'id' | 'email'>