import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { ProfileLayout } from '../layout/ProfileLayout'
import { HomePage } from './HomePage'
import { ProductsPage } from './ProductsPage'
import { ProductDetailPage } from './ProductDetailPage'
import { ProductRatingsPage } from './ProductRatingsPage'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'
import { OrderConfirmationPage } from './OrderConfirmationPage'
import { CheckoutSuccessPage } from './CheckoutSuccessPage'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'
import { ProfilePage } from './ProfilePage'
import { OrdersHistoryPage } from './OrdersHistoryPage'
import { OrderDetailPage } from './OrderDetailPage'
import { RefundPage } from './RefundPage'
import { AddressBookPage } from './AddressBookPage'
import { EditProfilePage } from './EditProfilePage'
import { ProfileWishlistPage } from './ProfileWishlistPage'
import { SiteSettingsPage } from '../../modules/settings/pages/SiteSettingsPage'
import { FAQPage } from '../../modules/faq'
import { TaxAdminPage } from '../../modules/tax'
import { DashboardPage } from '../../modules/dashboard'
import { CustomersPage } from '../../modules/customers'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/products/:id/ratings', element: <ProductRatingsPage /> },
      { path: '/wishlist', element: <Navigate to="/profile/wishlist" replace /> },
      {
        path: '/cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: '/checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: '/checkout/confirmation',
        element: (
          <RequireAuth>
            <OrderConfirmationPage />
          </RequireAuth>
        ),
      },
      {
        path: '/checkout/success',
        element: (
          <RequireAuth>
            <CheckoutSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/settings',
        element: (
          <RequireAuth>
            <SiteSettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/profile',
        element: (
          <RequireAuth>
            <ProfileLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'edit', element: <EditProfilePage /> },
          { path: 'orders', element: <OrdersHistoryPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'orders/:id/refund', element: <RefundPage /> },
          { path: 'wishlist', element: <ProfileWishlistPage /> },
          { path: 'addresses', element: <AddressBookPage /> },
          { path: 'settings', element: <SiteSettingsPage /> },
        ],
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/faq', element: <FAQPage /> },
      {
        path: '/admin/dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/tax',
        element: (
          <RequireAuth>
            <TaxAdminPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/customers',
        element: (
          <RequireAuth>
            <CustomersPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
