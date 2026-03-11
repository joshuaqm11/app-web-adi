'use client'

import { useAuth } from '@/lib/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function AdminNavbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-stone-800">
        Sistema de Administración — ADI San Juan, Florencia
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <User className="w-4 h-4 text-stone-400" />
          <span>{user?.email}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  )
}