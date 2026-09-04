import { useNavigate } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/shared/lib/alert'
import type { Product } from '../../../shared/types/product.type'
import { adminProductService } from '../services/admin-product.service'
import { productFormSchema } from '../schemas/product-form.schema'
import type { ProductFormValues, SpecRowValues } from '../types/admin.type'

const emptySpec = (): SpecRowValues => ({ spec_name: '', spec_value: '' })

export function valuesFromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    category_id: product.category_id,
    base_price: String(product.base_price),
    stock: String(product.stock),
    cover_image_url: product.cover_image_url,
    badge: product.badge ?? '',
    is_featured: product.is_featured ?? false,
    is_preorder: product.is_preorder ?? false,
    preorder_eta: product.preorder_eta ? product.preorder_eta.slice(0, 10) : '',
    preorder_deposit: product.preorder_deposit !== undefined ? String(product.preorder_deposit) : '',
    summary: product.summary,
    specs: product.specs.length > 0 ? product.specs.map((s) => ({ ...s })) : [emptySpec()],
    variants: product.variants?.map((v) => ({
      id: v.id,
      variant_name: v.variant_name,
      price_delta: String(v.price_delta),
      stock: String(v.stock),
    })) ?? [],
  }
}

const createDefaults = (): ProductFormValues => ({
  name: '',
  category_id: 'electronics',
  base_price: '',
  stock: '',
  cover_image_url: '',
  badge: '',
  is_featured: false,
  is_preorder: false,
  preorder_eta: '',
  preorder_deposit: '',
  summary: '',
  specs: [emptySpec()],
  variants: [],
})

export function useProductForm(product?: Product) {
  const navigate = useNavigate()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? valuesFromProduct(product) : createDefaults(),
  })

  const specArray = useFieldArray({
    control: form.control,
    name: 'specs',
  })

  const variantArray = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (product) {
        await adminProductService.updateProduct(product.id, values)
        toast.success('Product updated')
      } else {
        await adminProductService.createProduct(values)
        toast.success('Product created')
      }
      navigate('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    }
  })

  return {
    form,
    fields: specArray.fields,
    append: specArray.append,
    remove: specArray.remove,
    variantFields: variantArray.fields,
    appendVariant: variantArray.append,
    removeVariant: variantArray.remove,
    isSubmitting,
    onSubmit,
  }
}