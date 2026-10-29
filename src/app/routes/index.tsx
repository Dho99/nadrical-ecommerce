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
import { UploadProofPage } from './UploadProofPage'
import { CheckoutPendingPage } from './CheckoutPendingPage'
import { CheckoutSuccessPage } from './CheckoutSuccessPage'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'
import { RequireAdmin } from './RequireAdmin'
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
import { NewsListPage, NewsDetailPage } from '../../modules/news'
import { AnnouncementsPage, AnnouncementDetailPage } from '../../modules/announcements'
import { VoucherCatalogPage, VoucherDetailPage } from '../../modules/voucher'
import { ReviewsPage } from './ReviewsPage'

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
        path: '/checkout/upload-proof',
        element: (
          <RequireAuth>
            <UploadProofPage />
          </RequireAuth>
        ),
      },
      {
        path: '/checkout/pending',
        element: (
          <RequireAuth>
            <CheckoutPendingPage />
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
          <RequireAdmin>
            <SiteSettingsPage />
          </RequireAdmin>
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
      { path: '/news', element: <NewsListPage /> },
      { path: '/news/:slug', element: <NewsDetailPage /> },
      { path: '/reviews', element: <ReviewsPage /> },
      {
        path: '/vouchers',
        element: (
          <RequireAuth>
            <VoucherCatalogPage />
          </RequireAuth>
        ),
      },
      {
        path: '/vouchers/:id',
        element: (
          <RequireAuth>
            <VoucherDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: '/announcements',
        element: (
          <RequireAuth>
            <AnnouncementsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/announcements/:id',
        element: (
          <RequireAuth>
            <AnnouncementDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/dashboard',
        element: (
          <RequireAdmin>
            <DashboardPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/tax',
        element: (
          <RequireAdmin>
            <TaxAdminPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/customers',
        element: (
          <RequireAdmin>
            <CustomersPage />
          </RequireAdmin>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
