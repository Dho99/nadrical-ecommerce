import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import type { Product } from '../../../shared/types/product.type'
import { CATEGORY_OPTIONS } from '../schemas/product-form.schema'
import { useProductForm } from '../hooks/useProductForm'
import { ImageUrlField } from './ImageUrlField'
import { SpecsEditor } from './SpecsEditor'
import { VariantsEditor } from './VariantsEditor'
import {
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
} from '../../../shared/components/ui'

const NO_BADGE = '__none__'
const BADGE_OPTIONS = ['NEW', 'SALE', 'BEST SELLER'] as const

export function ProductForm({ product }: { product?: Product }) {
  const {
    form,
    fields,
    append,
    remove,
    variantFields,
    appendVariant,
    removeVariant,
    isSubmitting,
    onSubmit,
  } = useProductForm(product)

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate>
        <Card>
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Product name</FormLabel>
                    <FormControl>
                      <Input placeholder="Wireless Over-Ear Headphones" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <Select
                      value={field.value === '' ? NO_BADGE : field.value}
                      onValueChange={(value) => field.onChange(value === NO_BADGE ? '' : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No badge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_BADGE}>None</SelectItem>
                        {BADGE_OPTIONS.map((badge) => (
                          <SelectItem key={badge} value={badge}>
                            {badge}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" inputMode="decimal" placeholder="149" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" inputMode="numeric" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>Surfaces on the homepage and sort order.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="is_preorder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                    <div>
                      <FormLabel>Pre-order</FormLabel>
                      <FormDescription>Allow ordering when stock is 0 with future ETA.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  name="preorder_eta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETA date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Estimated delivery for pre-orders.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="preorder_deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="49" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <FormField
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Studio-tuned wireless headphones with active noise cancelling…"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Shown on cards and the product detail page.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUrlField />
            </div>

            <Separator />

            <SpecsEditor control={form.control} fields={fields} append={append} remove={remove} />

            <Separator />

            <VariantsEditor
              control={form.control}
              fields={variantFields}
              append={appendVariant}
              remove={removeVariant}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Saving…
                  </>
                ) : product ? (
                  'Save changes'
                ) : (
                  'Create product'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}