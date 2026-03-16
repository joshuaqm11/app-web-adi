'use client'

import { useEffect, useState } from 'react'
import { UserCog, Plus, Trash2, X, Check, Mail, User } from 'lucide-react'

interface UsuarioAuth {
  id: string
  email: string
  created_at: string
  user_metadata?: { nombre?: string; rol?: string }
  last_sign_in_at?: string
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '', confirmar: '', nombre: '', rol: 'ADI' })

  async function fetchUsuarios() {
    setLoading(true)
    const res = await fetch('/api/usuarios')
    const data = await res.json()
    setUsuarios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsuarios() }, [])

  async function handleCreate() {
    setSaving(true); setError('')
    if (!form.nombre.trim()) { setError('El nombre es requerido.'); setSaving(false); return }
    if (!form.email.trim()) { setError('El correo es requerido.'); setSaving(false); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setSaving(false); return }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden.'); setSaving(false); return }

    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, nombre: form.nombre, rol: form.rol })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }

    setShowModal(false)
    setForm({ email: '', password: '', confirmar: '', nombre: '', rol: 'ADI' })
    setSuccess('Usuario creado exitosamente.')
    setTimeout(() => setSuccess(''), 3000)
    fetchUsuarios()
    setSaving(false)
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`¿Eliminar el usuario ${email}?`)) return
    const res = await fetch('/api/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    setSuccess('Usuario eliminado.')
    setTimeout(() => setSuccess(''), 3000)
    fetchUsuarios()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Usuarios del Sistema</h1>
            <p className="text-sm text-stone-500">{usuarios.length} usuarios registrados</p>
          </div>
        </div>
        <button
          onClick={() => { setShowModal(true); setError('') }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar usuario
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Nombre','Correo','Rol','Último acceso','Fecha creación','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">No hay usuarios registrados.</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-700" />
                      </div>
                      <span className="font-medium text-stone-800">{u.user_metadata?.nombre ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.user_metadata?.rol === 'ADMIN'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.user_metadata?.rol ?? 'ADI'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-CR') : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(u.created_at).toLocaleDateString('es-CR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.email ?? '')}
                      className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="font-bold text-stone-800">Agregar usuario</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre completo *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Juan Pérez" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Correo electrónico *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="correo@ejemplo.com" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Rol *</label>
                <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} className={inp}>
                  <option value="ADI">ADI</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña *</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirmar contraseña *</label>
                <input type="password" value={form.confirmar} onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                  placeholder="Repetir contraseña" className={inp} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />{saving ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}