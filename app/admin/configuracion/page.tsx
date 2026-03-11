'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ConfiguracionAnualidades, ConfiguracionSitio, MiembroJunta } from '@/app/types'
import { Settings, Check, AlertCircle, CheckCircle, Phone, Users, Plus, Trash2, Pencil, X } from 'lucide-react'

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v)

type Tab = 'tarifas' | 'contacto' | 'junta'

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('tarifas')

  // --- Tarifas ---
  const [tarifas, setTarifas] = useState<ConfiguracionAnualidades | null>(null)
  const [formTarifas, setFormTarifas] = useState({ monto_boveda: 0, monto_lapida: 0, monto_tierra: 0 })

  // --- Contacto ---
  const [sitio, setSitio] = useState<ConfiguracionSitio | null>(null)
  const [formSitio, setFormSitio] = useState({ telefono: '', whatsapp: '', correo: '', horario_dia: '', horario_hora: '', direccion: '', descripcion_ubicacion: '' })

  // --- Junta ---
  const [junta, setJunta] = useState<MiembroJunta[]>([])
  const [showModalJunta, setShowModalJunta] = useState(false)
  const [editingMiembro, setEditingMiembro] = useState<MiembroJunta | null>(null)
  const [formJunta, setFormJunta] = useState({ cargo: '', nombre: '', tipo: 'titular' as 'titular' | 'suplente', orden: 0 })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchAll() {
    setLoading(true)
    const [{ data: t }, { data: s }, { data: j }] = await Promise.all([
      supabase.from('configuracion_anualidades').select('*').limit(1).single(),
      supabase.from('configuracion_sitio').select('*').limit(1).single(),
      supabase.from('junta_directiva').select('*').order('tipo').order('orden'),
    ])
    if (t) { setTarifas(t); setFormTarifas({ monto_boveda: t.monto_boveda, monto_lapida: t.monto_lapida, monto_tierra: t.monto_tierra }) }
    if (s) { setSitio(s); setFormSitio({ telefono: s.telefono, whatsapp: s.whatsapp, correo: s.correo, horario_dia: s.horario_dia, horario_hora: s.horario_hora, direccion: s.direccion, descripcion_ubicacion: s.descripcion_ubicacion }) }
    setJunta(j ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  async function saveTarifas() {
    setSaving(true); setMessage(null)
    const result = tarifas
      ? await supabase.from('configuracion_anualidades').update({ ...formTarifas, actualizado_en: new Date().toISOString() }).eq('id', tarifas.id)
      : await supabase.from('configuracion_anualidades').insert(formTarifas)
    setMessage(result.error ? { type: 'error', text: result.error.message } : { type: 'success', text: 'Tarifas actualizadas.' })
    if (!result.error) fetchAll()
    setSaving(false)
  }

  async function saveSitio() {
    setSaving(true); setMessage(null)
    const result = sitio
      ? await supabase.from('configuracion_sitio').update({ ...formSitio, actualizado_en: new Date().toISOString() }).eq('id', sitio.id)
      : await supabase.from('configuracion_sitio').insert(formSitio)
    setMessage(result.error ? { type: 'error', text: result.error.message } : { type: 'success', text: 'Información de contacto actualizada.' })
    if (!result.error) fetchAll()
    setSaving(false)
  }

  function openCreateMiembro() {
    setEditingMiembro(null)
    setFormJunta({ cargo: '', nombre: '', tipo: 'titular', orden: 0 })
    setShowModalJunta(true)
  }

  function openEditMiembro(m: MiembroJunta) {
    setEditingMiembro(m)
    setFormJunta({ cargo: m.cargo, nombre: m.nombre, tipo: m.tipo, orden: m.orden })
    setShowModalJunta(true)
  }

  async function saveMiembro() {
    setSaving(true)
    const result = editingMiembro
      ? await supabase.from('junta_directiva').update(formJunta).eq('id', editingMiembro.id)
      : await supabase.from('junta_directiva').insert(formJunta)
    if (!result.error) { setShowModalJunta(false); fetchAll() }
    setSaving(false)
  }

  async function deleteMiembro(id: string) {
    if (!confirm('¿Eliminar este miembro?')) return
    await supabase.from('junta_directiva').delete().eq('id', id)
    fetchAll()
  }

  const titulares = junta.filter(m => m.tipo === 'titular')
  const suplentes = junta.filter(m => m.tipo === 'suplente')

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-emerald-600" />
        <h1 className="text-xl font-bold text-stone-800">Configuración</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-100 rounded-xl p-1 text-sm gap-1">
        {([
          { key: 'tarifas', label: '💰 Tarifas' },
          { key: 'contacto', label: '📞 Contacto' },
          { key: 'junta',   label: '👥 Junta Directiva' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key); setMessage(null) }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${tab === key ? 'bg-white shadow text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* TAB: TARIFAS */}
      {tab === 'tarifas' && (
        <div className="space-y-4">
          {tarifas && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-4">✅ Tarifas vigentes</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[['🏛️ Bóveda', tarifas.monto_boveda], ['🪦 Lápida', tarifas.monto_lapida], ['🌱 Tierra', tarifas.monto_tierra]].map(([label, value]) => (
                  <div key={label as string} className="bg-white rounded-xl border border-emerald-100 p-4">
                    <p className="text-sm text-stone-500 mb-1">{label}</p>
                    <p className="text-xl font-bold text-emerald-700">{fmt(value as number)}</p>
                    <p className="text-xs text-stone-400 mt-1">por año</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
            <div className="px-6 py-4 bg-stone-50 rounded-t-2xl">
              <p className="text-sm font-semibold text-stone-700">Editar tarifas</p>
            </div>
            {[
              { key: 'monto_boveda', label: 'Bóveda', icon: '🏛️' },
              { key: 'monto_lapida', label: 'Lápida', icon: '🪦' },
              { key: 'monto_tierra', label: 'Tierra', icon: '🌱' },
            ].map(({ key, label, icon }) => (
              <div key={key} className="p-5 flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <p className="flex-1 font-medium text-stone-800">{label}</p>
                <div className="relative w-44">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">₡</span>
                  <input type="number" min={0} value={(formTarifas as any)[key]}
                    onChange={e => setFormTarifas(f => ({ ...f, [key]: +e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={saveTarifas} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl disabled:opacity-60">
              <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar tarifas'}
            </button>
          </div>
        </div>
      )}

      {/* TAB: CONTACTO */}
      {tab === 'contacto' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
            <div className="px-6 py-4 bg-stone-50 rounded-t-2xl flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-500" />
              <p className="text-sm font-semibold text-stone-700">Información de contacto</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { key: 'telefono',   label: 'Teléfono',         placeholder: '6394-0032' },
                { key: 'whatsapp',   label: 'WhatsApp (sin +)', placeholder: '50663940032' },
                { key: 'correo',     label: 'Correo electrónico', placeholder: 'correo@gmail.com' },
                { key: 'horario_dia', label: 'Día de reunión',   placeholder: 'último miércoles de cada mes' },
                { key: 'horario_hora', label: 'Hora de reunión', placeholder: '6:00 PM a 10:00 PM' },
                { key: 'direccion',  label: 'Dirección',         placeholder: 'San Juan de Florencia...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={key === 'direccion' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
                  <input value={(formSitio as any)[key]} onChange={e => setFormSitio(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={inp} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Descripción de ubicación</label>
                <textarea value={formSitio.descripcion_ubicacion} onChange={e => setFormSitio(f => ({ ...f, descripcion_ubicacion: e.target.value }))}
                  rows={3} className={inp + ' resize-none'} />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={saveSitio} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl disabled:opacity-60">
              <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar contacto'}
            </button>
          </div>
        </div>
      )}

      {/* TAB: JUNTA DIRECTIVA */}
      {tab === 'junta' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button onClick={openCreateMiembro} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4" /> Agregar miembro
            </button>
          </div>

          {/* Titulares */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200">
              <p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Users className="w-4 h-4" /> Junta Directiva Titular</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 text-stone-500">
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr></thead>
              <tbody>
                {titulares.map(m => (
                  <tr key={m.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-600">{m.cargo}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{m.nombre}</td>
                    <td className="px-4 py-3 text-stone-500">{m.orden}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditMiembro(m)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteMiembro(m.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Suplentes */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200">
              <p className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Users className="w-4 h-4" /> Miembros Suplentes</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 text-stone-500">
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr></thead>
              <tbody>
                {suplentes.map(m => (
                  <tr key={m.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-600">{m.cargo}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{m.nombre}</td>
                    <td className="px-4 py-3 text-stone-500">{m.orden}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditMiembro(m)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteMiembro(m.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal miembro */}
          {showModalJunta && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-stone-200">
                  <h2 className="font-bold text-stone-800">{editingMiembro ? 'Editar miembro' : 'Agregar miembro'}</h2>
                  <button onClick={() => setShowModalJunta(false)}><X className="w-5 h-5 text-stone-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Cargo</label>
                    <input value={formJunta.cargo} onChange={e => setFormJunta(f => ({ ...f, cargo: e.target.value }))} placeholder="Ej. Presidenta" className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre</label>
                    <input value={formJunta.nombre} onChange={e => setFormJunta(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre completo" className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Tipo</label>
                    <select value={formJunta.tipo} onChange={e => setFormJunta(f => ({ ...f, tipo: e.target.value as 'titular' | 'suplente' }))} className={inp}>
                      <option value="titular">Titular</option>
                      <option value="suplente">Suplente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Orden (para ordenar la lista)</label>
                    <input type="number" min={0} value={formJunta.orden} onChange={e => setFormJunta(f => ({ ...f, orden: +e.target.value }))} className={inp} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
                  <button onClick={() => setShowModalJunta(false)} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                  <button onClick={saveMiembro} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}