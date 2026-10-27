import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import PageLoading from '@/components/PageLoading'
import { RequireAuth } from './RequireAuth'

const LoginPage = lazy(() => import('@/pages/Login'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ArticlesPage = lazy(() => import('@/pages/Articles'))
const CategoriesPage = lazy(() => import('@/pages/Categories'))
const CoursesPage = lazy(() => import('@/pages/Courses'))
const UsersPage = lazy(() => import('@/pages/Users'))
const AttachmentsPage = lazy(() => import('@/pages/Attachments'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoading />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'articles', element: withSuspense(<ArticlesPage />) },
      { path: 'categories', element: withSuspense(<CategoriesPage />) },
      { path: 'courses', element: withSuspense(<CoursesPage />) },
      { path: 'users', element: withSuspense(<UsersPage />) },
      { path: 'attachments', element: withSuspense(<AttachmentsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])
