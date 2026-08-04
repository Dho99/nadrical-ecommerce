import { useNavigate } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Product } from '../../../shared/types/product.type'
import { adminProductService } from '../services/admin-product.service'
import { productFormSchema } from '../schemas/product-form.schema'
import type { ProductFormValues, SpecRowValues } from '../types/admin.type'

const emptySpec = (): SpecRowValues => ({ label: '', value: '' })

export function valuesFromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    imageUrl: product.imageUrl,
    badge: product.badge ?? '',
    featured: product.featured ?? false,
    summary: product.summary,
    specs: product.specs.length > 0 ? product.specs.map((s) => ({ ...s })) : [emptySpec()],
    variants: product.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      priceDelta: String(v.priceDelta),
      stock: String(v.stock),
    })) ?? [],
  }
}

const createDefaults = (): ProductFormValues => ({
  name: '',
  category: 'electronics',
  price: '',
  stock: '',
  imageUrl: '',
  badge: '',
  featured: false,
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