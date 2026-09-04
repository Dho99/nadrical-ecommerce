import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { AdminLayout } from '../layout/AdminLayout'
import { ProfileLayout } from '../layout/ProfileLayout'
import { HomePage } from './HomePage'
import { ProductsPage } from './ProductsPage'
import { ProductDetailPage } from './ProductDetailPage'
import { ProductRatingsPage } from './ProductRatingsPage'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'
import { WishlistPage } from './WishlistPage'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'
import { ProfilePage } from './ProfilePage'
import { OrdersHistoryPage } from './OrdersHistoryPage'
import { AddressBookPage } from './AddressBookPage'
import { EditProfilePage } from './EditProfilePage'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminProductsPage } from './AdminProductsPage'
import { AdminProductFormPage } from './AdminProductFormPage'
import { AdminOrdersPage } from './AdminOrdersPage'
import { AdminChatPage } from './AdminChatPage'
import { AdminDiscountsPage } from './AdminDiscountsPage'
import { AdminDiscountFormPage } from './AdminDiscountFormPage'
import { AdminPreordersPage } from './AdminPreordersPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/products/:id/ratings', element: <ProductRatingsPage /> },
      { path: '/wishlist', element: <WishlistPage /> },
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
          { path: 'addresses', element: <AddressBookPage /> },
        ],
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductFormPage /> },
      { path: 'products/:id/edit', element: <AdminProductFormPage /> },
      { path: 'discounts', element: <AdminDiscountsPage /> },
      { path: 'discounts/new', element: <AdminDiscountFormPage /> },
      { path: 'discounts/:code/edit', element: <AdminDiscountFormPage /> },
      { path: 'preorders', element: <AdminPreordersPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'chat', element: <AdminChatPage /> },
    ],
  },
])
