import { Plus, Trash2 } from 'lucide-react'
import type { Control, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form'
import { MAX_SPECS } from '../constants/admin.constants'
import type { ProductFormValues } from '../types/admin.type'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from '../../../shared/components/ui'

interface SpecsEditorProps {
  control: Control<ProductFormValues>
  fields: Array<{ id: string }>
  append: UseFieldArrayAppend<ProductFormValues, 'specs'>
  remove: UseFieldArrayRemove
}

export function SpecsEditor({ control, fields, append, remove }: SpecsEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Specifications</p>
        <p className="text-sm text-muted-foreground">
          Key-value pairs shown on the product detail page. Leave a row empty to skip it.
        </p>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              control={control}
              name={`specs.${index}.spec_name`}
              render={({ field: specField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Label (e.g. Battery)" {...specField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`specs.${index}.spec_value`}
              render={({ field: specField }) => (
                <FormItem className="flex-[1.4]">
                  <FormControl>
                    <Input placeholder="Value (e.g. 30 hours)" {...specField} />
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
              aria-label={`Remove spec row ${index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length >= MAX_SPECS}
          onClick={() => append({ spec_name: '', spec_value: '' })}
      >
        <Plus /> Add specification
      </Button>
    </div>
  )
}