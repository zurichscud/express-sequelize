import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import SiteLayout from '@/layouts/SiteLayout'
import { PageLoading } from '@/components/States'

const HomePage = lazy(() => import('@/pages/Home'))
const CoursesPage = lazy(() => import('@/pages/Courses'))
const CourseDetailPage = lazy(() => import('@/pages/CourseDetail'))
const ArticlesPage = lazy(() => import('@/pages/Articles'))
const ArticleDetailPage = lazy(() => import('@/pages/ArticleDetail'))
const LikedCoursesPage = lazy(() => import('@/pages/LikedCourses'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoading />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'courses', element: withSuspense(<CoursesPage />) },
      { path: 'courses/:id', element: withSuspense(<CourseDetailPage />) },
      { path: 'articles', element: withSuspense(<ArticlesPage />) },
      { path: 'articles/:id', element: withSuspense(<ArticleDetailPage />) },
      { path: 'me', element: withSuspense(<ProfilePage />) },
      { path: 'me/likes', element: withSuspense(<LikedCoursesPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])
