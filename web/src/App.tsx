import { RouterProvider } from 'react-router-dom'
import { SiteProvider } from '@/context/SiteContext'
import { AuthProvider } from '@/context/AuthContext'
import AuthModal from '@/components/AuthModal'
import { router } from '@/router'

export default function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <AuthModal />
      </AuthProvider>
    </SiteProvider>
  )
}
