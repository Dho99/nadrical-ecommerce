import { Plus, Trash2 } from 'lucide-react'
import type { Control, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form'
import { MAX_VARIANTS } from '../constants/admin.constants'
import type { ProductFormValues } from '../types/admin.type'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from '../../../shared/components/ui'

interface VariantsEditorProps {
  control: Control<ProductFormValues>
  fields: Array<{ id: string }>
  append: UseFieldArrayAppend<ProductFormValues, 'variants'>
  remove: UseFieldArrayRemove
}

export function VariantsEditor({ control, fields, append, remove }: VariantsEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Variants</p>
        <p className="text-sm text-muted-foreground">
          Optional size / color / style choices. Each variant has its own stock and an optional
          price delta from the base price.
        </p>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_6rem_5rem_auto]">
              <FormField
                control={control}
                name={`variants.${index}.variant_name`}
                render={({ field: variantField }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="e.g. Size M" {...variantField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${index}.price_delta`}
                render={({ field: variantField }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" inputMode="decimal" placeholder="+0" {...variantField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${index}.stock`}
                render={({ field: variantField }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" min="0" step="1" inputMode="numeric" placeholder="Stock" {...variantField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5"
                onClick={() => remove(index)}
                aria-label={`Remove variant row ${index + 1}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length >= MAX_VARIANTS}
          onClick={() => append({ variant_name: '', price_delta: '', stock: '' })}
      >
        <Plus /> Add variant
      </Button>
    </div>
  )
}
