import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { AdminLayout } from '../layout/AdminLayout'
import { HomePage } from './HomePage'
import { ProductsPage } from './ProductsPage'
import { ProductDetailPage } from './ProductDetailPage'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { NotFoundPage } from './NotFoundPage'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminProductsPage } from './AdminProductsPage'
import { AdminProductFormPage } from './AdminProductFormPage'
import { AdminOrdersPage } from './AdminOrdersPage'
import { AdminChatPage } from './AdminChatPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
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
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'chat', element: <AdminChatPage /> },
    ],
  },
])
