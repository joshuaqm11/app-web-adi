import { AuthProvider } from '@/lib/AuthContext'
import AdminLayoutClient from '@/app/components/admin/AdminLayoutClient'


export const metadata = {
  title: 'Panel Administrativo | Asociación San Juan de Florencia',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthProvider>
  )
}