'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Map, Users, CreditCard, TrendingUp, Settings, TreePine, Images } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/lotes',         label: 'Lotes',         icon: Map },
  { href: '/admin/difuntos',      label: 'Difuntos',      icon: Users },
  { href: '/admin/pagos',         label: 'Anualidades',   icon: CreditCard },
  { href: '/admin/ingresos',      label: 'Ingresos',      icon: TrendingUp },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  { href: '/admin/galeria', label: 'Galería', icon: Images },
  { href: '/admin/estado-pagos', label: 'Estado de Pagos', icon: ShieldCheck },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-stone-900 text-stone-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Panel Admin</p>
            <p className="text-xs text-stone-400 leading-tight">San Juan de Florencia</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-stone-700">
        <p className="text-xs text-stone-500 text-center">© {new Date().getFullYear()} ADISJ Florencia</p>
      </div>
    </aside>
  )
}