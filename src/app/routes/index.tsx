import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { ProfileLayout } from '../layout/ProfileLayout'
import { HomePage } from './HomePage'
import { ProductsPage } from './ProductsPage'
import { ProductDetailPage } from './ProductDetailPage'
import { ProductRatingsPage } from './ProductRatingsPage'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'
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
        ],
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
