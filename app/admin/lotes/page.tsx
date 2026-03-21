'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Lote, LoteFormData, EstadoLote, TipoSepultura, LadoCementerio, LoteConEstadoPago, EstadoPago } from '@/app/types'
import LoteGrid from '@/app/components/admin/LoteGrid'
import { Map, Plus, Pencil, Trash2, X, Check, Download, ShieldCheck, AlertTriangle, Clock, Ban, Search, Filter } from 'lucide-react'
import { exportToExcel } from '@/lib/exportExcel'

const ESTADO_BADGE: Record<EstadoLote, string> = {
  disponible: 'bg-emerald-100 text-emerald-700',
  ocupado:    'bg-red-100 text-red-700',
  reservado:  'bg-amber-100 text-amber-700',
}

const PAGO_CONFIG: Record<EstadoPago, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  al_dia:      { label: 'Al día',      color: 'text-emerald-700', bg: 'bg-emerald-100', icon: ShieldCheck },
  pendiente:   { label: 'Pendiente',   color: 'text-amber-700',   bg: 'bg-amber-100',   icon: Clock },
  moroso:      { label: 'Moroso',      color: 'text-red-700',     bg: 'bg-red-100',     icon: AlertTriangle },
  sin_difunto: { label: 'Sin difunto', color: 'text-stone-400',   bg: 'bg-stone-100',   icon: Ban },
}

const EMPTY: LoteFormData = {
  codigo_lote: '', fila: 1, columna: 1,
  estado: 'disponible', tipo_sepultura: 'boveda',
  observaciones: '', lado: 'izquierdo', capacidad_nichos: 1
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
const sel = 'px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-stone-700'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div>
}

interface Filtros {
  search: string
  tipo: TipoSepultura | ''
  estado: EstadoLote | ''
  lado: LadoCementerio | ''
  estado_pago: EstadoPago | ''
}

const FILTROS_EMPTY: Filtros = { search: '', tipo: '', estado: '', lado: '', estado_pago: '' }

export default function LotesPage() {
  const [lotes, setLotes] = useState<LoteConEstadoPago[]>([])
  const [lotesSimples, setLotesSimples] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState<'tabla' | 'mapa'>('tabla')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Lote | null>(null)
  const [form, setForm] = useState<LoteFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_EMPTY)
  const [showFiltros, setShowFiltros] = useState(false)

  async function fetchLotes() {
    setLoading(true)
    const [{ data: conEstado }, { data: simples }] = await Promise.all([
      supabase.from('lotes_con_estado_pago').select('*').order('lado').order('fila').order('columna'),
      supabase.from('lotes')
        .select('*, difuntos(nombre_difunto, numero_nicho)')
        .order('lado').order('fila').order('columna')
    ])
    setLotes((conEstado ?? []) as LoteConEstadoPago[])
    setLotesSimples(simples ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLotes() }, [])

  // Filtrado en cliente
  const filtered = lotes.filter(l => {
    if (filtros.search && !l.codigo_lote.toLowerCase().includes(filtros.search.toLowerCase())) return false
    if (filtros.tipo && l.tipo_sepultura !== filtros.tipo) return false
    if (filtros.estado && l.estado !== filtros.estado) return false
    if (filtros.lado && l.lado !== filtros.lado) return false
    if (filtros.estado_pago && l.estado_pago !== filtros.estado_pago) return false
    return true
  })

  const hayFiltros = Object.values(filtros).some(v => v !== '')

  function limpiarFiltros() { setFiltros(FILTROS_EMPTY) }

  function openCreate() { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true) }

  function openEdit(l: LoteConEstadoPago) {
    setEditing(l as unknown as Lote)
    setForm({
      codigo_lote: l.codigo_lote, fila: l.fila, columna: l.columna,
      estado: l.estado, tipo_sepultura: l.tipo_sepultura,
      observaciones: l.observaciones ?? '', lado: l.lado ?? 'izquierdo',
      capacidad_nichos: l.capacidad_nichos ?? 1
    })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    if (!form.codigo_lote.trim()) { setError('El código del lote es requerido.'); setSaving(false); return }
    const payload = {
      ...form,
      capacidad_nichos: form.tipo_sepultura === 'boveda' ? (form.capacidad_nichos ?? 1) : 1
    }
    const { error: err } = editing
      ? await supabase.from('lotes').update(payload).eq('id', editing.id)
      : await supabase.from('lotes').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    setShowModal(false); fetchLotes(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este lote?')) return
    await supabase.from('lotes').delete().eq('id', id)
    fetchLotes()
  }

  function handleExport() {
    const data = filtered.map(l => ({
      'Código': l.codigo_lote,
      'Lado': l.lado === 'izquierdo' ? 'Izquierdo' : 'Derecho',
      'Fila': l.fila,
      'Columna': l.columna,
      'Tipo de Sepultura': l.tipo_sepultura.charAt(0).toUpperCase() + l.tipo_sepultura.slice(1),
      'Capacidad Nichos': l.tipo_sepultura === 'boveda' ? l.capacidad_nichos ?? 1 : '—',
      'Difuntos': l.total_difuntos ?? 0,
      'Estado Físico': l.estado.charAt(0).toUpperCase() + l.estado.slice(1),
      'Estado Pago': PAGO_CONFIG[l.estado_pago].label,
      'Observaciones': l.observaciones ?? '—',
    }))
    exportToExcel(data, `Lotes_Cementerio_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Lotes')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Gestión de Lotes</h1>
            <p className="text-sm text-stone-500">{lotes.length} lotes registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
          <div className="flex bg-stone-100 rounded-lg p-1 text-sm">
            <button onClick={() => setVista('tabla')} className={`px-3 py-1.5 rounded-md transition-all ${vista === 'tabla' ? 'bg-white shadow font-semibold text-stone-800' : 'text-stone-500'}`}>Tabla</button>
            <button onClick={() => setVista('mapa')} className={`px-3 py-1.5 rounded-md transition-all ${vista === 'mapa' ? 'bg-white shadow font-semibold text-stone-800' : 'text-stone-500'}`}>Mapa</button>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Agregar lote
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={filtros.search}
              onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))}
              placeholder="Buscar por código..."
              className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFiltros(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFiltros || hayFiltros
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-stone-300 text-stone-600 hover:border-stone-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hayFiltros && (
              <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {Object.values(filtros).filter(v => v !== '').length}
              </span>
            )}
          </button>

          {/* Limpiar */}
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="text-sm text-stone-500 hover:text-stone-700 underline">
              Limpiar
            </button>
          )}

          <span className="ml-auto text-sm text-stone-500">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {/* Panel de filtros desplegable */}
        {showFiltros && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Tipo</label>
              <select value={filtros.tipo} onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value as TipoSepultura | '' }))} className={sel + ' w-full'}>
                <option value="">Todos</option>
                <option value="boveda">Bóveda</option>
                <option value="lapida">Lápida</option>
                <option value="tierra">Tierra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Estado</label>
              <select value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value as EstadoLote | '' }))} className={sel + ' w-full'}>
                <option value="">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="ocupado">Ocupado</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Lado</label>
              <select value={filtros.lado} onChange={e => setFiltros(f => ({ ...f, lado: e.target.value as LadoCementerio | '' }))} className={sel + ' w-full'}>
                <option value="">Ambos</option>
                <option value="izquierdo">Izquierdo</option>
                <option value="derecho">Derecho</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Estado de pago</label>
              <select value={filtros.estado_pago} onChange={e => setFiltros(f => ({ ...f, estado_pago: e.target.value as EstadoPago | '' }))} className={sel + ' w-full'}>
                <option value="">Todos</option>
                <option value="al_dia">Al día</option>
                <option value="pendiente">Pendiente</option>
                <option value="moroso">Moroso</option>
                <option value="sin_difunto">Sin difunto</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : vista === 'mapa' ? (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">Mapa Visual del Cementerio</h2>
          <LoteGrid lotes={lotesSimples} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Código','Lado','Tipo','Nichos','Estado','Estado Pago','Observaciones','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400">
                  {hayFiltros ? 'No hay lotes que coincidan con los filtros.' : 'No hay lotes registrados.'}
                </td></tr>
              ) : filtered.map(lote => {
                const cfg = PAGO_CONFIG[lote.estado_pago]
                const Icon = cfg.icon
                const nichoInfo = lote.tipo_sepultura === 'boveda'
                  ? `${lote.total_difuntos ?? 0}/${lote.capacidad_nichos ?? 1}`
                  : '—'
                return (
                  <tr key={lote.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-stone-800">{lote.codigo_lote}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{lote.lado ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{lote.tipo_sepultura}</td>
                    <td className="px-4 py-3 text-stone-600">{nichoInfo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[lote.estado]}`}>
                        {lote.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{lote.observaciones || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(lote)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(lote.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-stone-800">{editing ? 'Editar Lote' : 'Agregar Lote'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <Field label="Código del lote">
                <input value={form.codigo_lote} onChange={e => setForm(f => ({ ...f, codigo_lote: e.target.value }))}
                  placeholder="Ej. L-F1C1" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fila">
                  <input type="number" min={1} value={form.fila} onChange={e => setForm(f => ({ ...f, fila: +e.target.value }))} className={inp} />
                </Field>
                <Field label="Columna">
                  <input type="number" min={1} value={form.columna} onChange={e => setForm(f => ({ ...f, columna: +e.target.value }))} className={inp} />
                </Field>
              </div>
              <Field label="Lado">
                <select value={form.lado} onChange={e => setForm(f => ({ ...f, lado: e.target.value as LadoCementerio }))} className={inp}>
                  <option value="izquierdo">Izquierdo</option>
                  <option value="derecho">Derecho</option>
                </select>
              </Field>
              <Field label="Estado">
                <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoLote }))} className={inp}>
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="reservado">Reservado</option>
                </select>
              </Field>
              <Field label="Tipo de sepultura">
                <select value={form.tipo_sepultura}
                  onChange={e => {
                    const tipo = e.target.value as TipoSepultura
                    setForm(f => ({ ...f, tipo_sepultura: tipo, capacidad_nichos: tipo === 'boveda' ? (f.capacidad_nichos ?? 1) : 1 }))
                  }} className={inp}>
                  <option value="boveda">Bóveda</option>
                  <option value="lapida">Lápida</option>
                  <option value="tierra">Tierra</option>
                </select>
              </Field>
              {form.tipo_sepultura === 'boveda' && (
                <Field label="Capacidad de nichos">
                  <input type="number" min={1} max={20} value={form.capacidad_nichos ?? 1}
                    onChange={e => setForm(f => ({ ...f, capacidad_nichos: +e.target.value }))} className={inp} />
                  <p className="text-xs text-stone-400 mt-1">Cantidad máxima de difuntos que puede tener esta bóveda.</p>
                </Field>
              )}
              <Field label="Observaciones">
                <textarea value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  rows={3} placeholder="Opcional..." className={inp + ' resize-none'} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}