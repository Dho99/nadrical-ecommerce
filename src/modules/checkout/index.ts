export { CheckoutForm } from './components/CheckoutForm'
export { OrderSummary } from './components/OrderSummary'
export { OrderConfirmationCard } from './components/OrderConfirmationCard'
export { useCheckout, CHECKOUT_STEPS } from './hooks/useCheckout'
export { checkoutService } from './services/checkout.service'
export { orderRepository } from './services/order.repository'
export { postalService } from './services/postal.service'
export { customerSchema, shippingSchema, paymentSchema } from './schemas/checkout.schema'
export { SHIPPING_METHODS } from './types/checkout.type'
export type { PostalPlace } from './services/postal.service'
export type {
  OrderPayload,
  OrderConfirmation,
  ShippingMethod,
  CheckoutLine,
} from './types/checkout.type'
