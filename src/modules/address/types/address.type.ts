import type { DbUserAddress } from '../../../shared/types/database.type'

export type UserAddress = DbUserAddress
export type CountryCode = 'ID' | 'US' | 'MY' | 'SG'
export type AddressInput = Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
