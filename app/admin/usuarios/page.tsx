'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { UserCog, Plus, Trash2, X, Check, Mail, User, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react'

interface UsuarioAuth {
  id: string
  email: string
  created_at: string
  user_metadata?: { nombre?: string; rol?: string }
  last_sign_in_at?: string
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

function ModalCambiarPassword({ titulo, onClose, onGuardar, saving, error, pedirActual = false }: {
  titulo: string
  onClose: () => void
  onGuardar: (data: { actual?: string; nueva: string }) => void
  saving: boolean
  error: string
  pedirActual?: boolean
}) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verActual, setVerActual] = useState(false)
  const [verNueva, setVerNueva] = useState(false)
  const [verConf, setVerConf] = useState(false)
  const [localError, setLocalError] = useState('')

  function handleSubmit() {
    setLocalError('')
    if (pedirActual && !actual.trim()) { setLocalError('Ingresa tu contraseña actual.'); return }
    if (nueva.length < 6) { setLocalError('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    if (nueva !== confirmar) { setLocalError('Las contraseñas no coinciden.'); return }
    onGuardar({ actual: pedirActual ? actual : undefined, nueva })
  }

  const err = localError || error

  const PasswordInput = ({ label, value, onChange, ver, setVer, placeholder }: {
    label: string; value: string; onChange: (v: string) => void
    ver: boolean; setVer: (v: boolean) => void; placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <div className="relative">
        <input type={ver ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'Mínimo 6 caracteres'}
          className={inp + ' pr-10'} />
        <button type="button" onClick={() => setVer(!ver)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
          {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-stone-800">{titulo}</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
          {pedirActual && (
            <PasswordInput label="Contraseña actual *" value={actual} onChange={setActual}
              ver={verActual} setVer={setVerActual} placeholder="Tu contraseña actual" />
          )}
          <PasswordInput label="Nueva contraseña *" value={nueva} onChange={setNueva}
            ver={verNueva} setVer={setVerNueva} />
          <PasswordInput label="Confirmar nueva contraseña *" value={confirmar} onChange={setConfirmar}
            ver={verConf} setVer={setVerConf} placeholder="Repetir nueva contraseña" />
          {nueva.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-stone-500 font-medium">Seguridad de la contraseña</p>
              <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                  <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${
                    nueva.length >= n * 3
                      ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-emerald-400' : 'bg-emerald-600'
                      : 'bg-stone-200'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-stone-400">
                {nueva.length < 6 ? 'Muy corta' : nueva.length < 9 ? 'Débil' : nueva.length < 12 ? 'Buena' : 'Fuerte'}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
            <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  const { user, rol } = useAuth()
  const isAdmin = rol === 'ADMIN'

  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '', confirmar: '', nombre: '', rol: 'ADI' })
  const [modalPass, setModalPass] = useState<'propia' | { id: string; email: string } | null>(null)
  const [savingPass, setSavingPass] = useState(false)
  const [errorPass, setErrorPass] = useState('')

  async function fetchUsuarios() {
    setLoading(true)
    const res = await fetch('/api/usuarios')
    const data = await res.json()
    setUsuarios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsuarios() }, [])

  function showSuccessMsg(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleCreate() {
    setSaving(true); setError('')
    if (!form.nombre.trim()) { setError('El nombre es requerido.'); setSaving(false); return }
    if (!form.email.trim()) { setError('El correo es requerido.'); setSaving(false); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setSaving(false); return }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden.'); setSaving(false); return }
    const res = await fetch('/api/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, nombre: form.nombre, rol: form.rol })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setShowModal(false)
    setForm({ email: '', password: '', confirmar: '', nombre: '', rol: 'ADI' })
    showSuccessMsg('Usuario creado exitosamente.')
    fetchUsuarios(); setSaving(false)
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`¿Eliminar el usuario ${email}?`)) return
    const res = await fetch('/api/usuarios', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    showSuccessMsg('Usuario eliminado.'); fetchUsuarios()
  }

  async function handleCambiarPassword({ actual, nueva }: { actual?: string; nueva: string }) {
    setSavingPass(true); setErrorPass('')
    if (modalPass === 'propia') {
      if (actual && user?.email) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: actual })
        if (signInErr) { setErrorPass('La contraseña actual es incorrecta.'); setSavingPass(false); return }
      }
      const { error } = await supabase.auth.updateUser({ password: nueva })
      if (error) { setErrorPass(error.message); setSavingPass(false); return }
      setModalPass(null); showSuccessMsg('Tu contraseña fue actualizada correctamente.')
    } else if (modalPass && typeof modalPass === 'object') {
      const res = await fetch('/api/usuarios', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modalPass.id, password: nueva })
      })
      const data = await res.json()
      if (data.error) { setErrorPass(data.error); setSavingPass(false); return }
      setModalPass(null); showSuccessMsg(`Contraseña de ${modalPass.email} actualizada correctamente.`)
    }
    setSavingPass(false)
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
        <div className="flex items-center gap-2">
          {/* Todos pueden cambiar su propia contraseña */}
          <button onClick={() => { setErrorPass(''); setModalPass('propia') }}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 hover:border-emerald-500 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 text-sm font-semibold rounded-lg transition-colors">
            <ShieldCheck className="w-4 h-4" /> Mi contraseña
          </button>
          {/* Solo ADMIN puede agregar usuarios */}
          {isAdmin && (
            <button onClick={() => { setShowModal(true); setError('') }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Agregar usuario
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
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
                      <Mail className="w-3.5 h-3.5 text-stone-400" />{u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.user_metadata?.rol === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                    }`}>{u.user_metadata?.rol ?? 'ADI'}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })
                      : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(u.created_at).toLocaleDateString('es-CR', { timeZone: 'America/Costa_Rica' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Solo ADMIN puede cambiar contraseña de otros */}
                      {isAdmin && (
                        <button onClick={() => { setErrorPass(''); setModalPass({ id: u.id, email: u.email }) }}
                          className="p-1.5 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Cambiar contraseña">
                          <KeyRound className="w-4 h-4" />
                        </button>
                      )}
                      {/* Solo ADMIN puede eliminar */}
                      {isAdmin && (
                        <button onClick={() => handleDelete(u.id, u.email ?? '')}
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar usuario">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && showModal && (
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
                <input type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirmar contraseña *</label>
                <input type="password" value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                  placeholder="Repetir contraseña" className={inp} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />{saving ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPass && (
        <ModalCambiarPassword
          titulo={modalPass === 'propia' ? 'Cambiar mi contraseña' : `Cambiar contraseña de ${typeof modalPass === 'object' ? modalPass.email : ''}`}
          pedirActual={modalPass === 'propia'}
          onClose={() => setModalPass(null)}
          onGuardar={handleCambiarPassword}
          saving={savingPass}
          error={errorPass}
        />
      )}
    </div>
  )
}