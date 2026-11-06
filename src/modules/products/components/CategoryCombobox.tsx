import { useMemo } from 'react'
import type { ProductCategory } from '../types/product.type'
import { cn } from '../../../shared/utils/cn'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../../shared/components/ui/combobox'

interface CategoryOption {
  id: string
  label: string
}

interface CategoryComboboxProps {
  categories: ProductCategory[]
  value?: string
  onSelect: (categoryId: string) => void
  className?: string
}

export function CategoryCombobox({ categories, value, onSelect, className }: CategoryComboboxProps) {
  const options = useMemo<CategoryOption[]>(
    () => [
      { id: 'all', label: 'All products' },
      ...categories.map((category) => ({ id: category.id, label: category.label })),
    ],
    [categories],
  )

  const selected = options.find((option) => option.id === value) ?? options[0]

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => onSelect(option?.id ?? 'all')}
      itemToStringLabel={(option: CategoryOption) => option.label}
      itemToStringValue={(option: CategoryOption) => option.id}
      isItemEqualToValue={(a: CategoryOption | null, b: CategoryOption | null) => {
        if (!a || !b) return a === b
        return a.id === b.id
      }}
    >
      <ComboboxInput
        placeholder="Category"
        aria-label="Browse category"
        className={cn('h-9 w-[150px]', className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>No category found</ComboboxEmpty>
        <ComboboxList>
          {(option: CategoryOption) => (
            <ComboboxItem key={option.id} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
