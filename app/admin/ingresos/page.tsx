'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { IngresoGeneral, IngresoFormData, TipoIngreso, MetodoPago, FiltrosIngresos } from '@/app/types'
import { TrendingUp, Plus, Pencil, Trash2, X, Check, Filter, Download } from 'lucide-react'
import { exportToExcel, formatMonto } from '@/lib/exportExcel'

const TIPO_LABEL: Record<TipoIngreso, string> = { salon: 'Salón Comunal', feria: 'Feria', actividad: 'Actividad', donacion: 'Donación', otro: 'Otro' }
const METODO_LABEL: Record<MetodoPago, string> = { efectivo: 'Efectivo', transferencia: 'Transferencia', sinpe: 'SINPE', otro: 'Otro' }
const TIPO_COLOR: Record<TipoIngreso, string> = { salon: 'bg-blue-100 text-blue-700', feria: 'bg-orange-100 text-orange-700', actividad: 'bg-violet-100 text-violet-700', donacion: 'bg-pink-100 text-pink-700', otro: 'bg-stone-100 text-stone-700' }

const EMPTY: IngresoFormData = { tipo_ingreso: 'salon', descripcion: '', nombre_responsable: '', telefono: '', monto: 0, fecha_ingreso: new Date().toISOString().split('T')[0], metodo_pago: 'efectivo', observaciones: '' }
const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v)

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<IngresoGeneral[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<IngresoGeneral | null>(null)
  const [form, setForm] = useState<IngresoFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState<FiltrosIngresos>({})
  const [showFiltros, setShowFiltros] = useState(false)

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('ingresos_generales').select('*').order('fecha_ingreso', { ascending: false })
    setIngresos(data ?? []); setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true) }
  function openEdit(i: IngresoGeneral) {
    setEditing(i)
    setForm({ tipo_ingreso: i.tipo_ingreso, descripcion: i.descripcion, nombre_responsable: i.nombre_responsable ?? '',
      telefono: i.telefono ?? '', monto: i.monto, fecha_ingreso: i.fecha_ingreso, metodo_pago: i.metodo_pago, observaciones: i.observaciones ?? '' })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    if (!form.descripcion.trim()) { setError('La descripción es requerida.'); setSaving(false); return }
    if (form.monto <= 0) { setError('El monto debe ser mayor a cero.'); setSaving(false); return }
    const { error: err } = editing
      ? await supabase.from('ingresos_generales').update(form).eq('id', editing.id)
      : await supabase.from('ingresos_generales').insert(form)
    if (err) { setError(err.message); setSaving(false); return }
    setShowModal(false); fetchData(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este ingreso?')) return
    await supabase.from('ingresos_generales').delete().eq('id', id); fetchData()
  }

  function buildExportData(lista: IngresoGeneral[]) {
    return lista.map(i => ({
      'Tipo': TIPO_LABEL[i.tipo_ingreso],
      'Descripción': i.descripcion,
      'Responsable': i.nombre_responsable ?? '—',
      'Teléfono': i.telefono ?? '—',
      'Monto': formatMonto(i.monto),
      'Fecha': new Date(i.fecha_ingreso + 'T00:00:00').toLocaleDateString('es-CR'),
      'Método Pago': METODO_LABEL[i.metodo_pago],
      'Observaciones': i.observaciones ?? '—',
    }))
  }

  function handleExportTodo() {
    exportToExcel(buildExportData(ingresos), `Ingresos_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Ingresos')
  }

  function handleExportFiltrado() {
    exportToExcel(buildExportData(filtered), `Ingresos_Filtrado_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Ingresos')
  }

  const filtered = ingresos.filter(i => {
    if (filtros.tipo_ingreso && i.tipo_ingreso !== filtros.tipo_ingreso) return false
    if (filtros.metodo_pago && i.metodo_pago !== filtros.metodo_pago) return false
    if (filtros.fecha_desde && i.fecha_ingreso < filtros.fecha_desde) return false
    if (filtros.fecha_hasta && i.fecha_ingreso > filtros.fecha_hasta) return false
    return true
  })

  const resumen = (Object.keys(TIPO_LABEL) as TipoIngreso[]).map(tipo => ({
    tipo, label: TIPO_LABEL[tipo],
    total: ingresos.filter(i => i.tipo_ingreso === tipo).reduce((s, i) => s + Number(i.monto), 0),
    count: ingresos.filter(i => i.tipo_ingreso === tipo).length
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Ingresos Generales</h1>
            <p className="text-sm text-stone-500">{ingresos.length} registros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTodo}
            disabled={ingresos.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar todo
          </button>
          <button
            onClick={handleExportFiltrado}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-stone-600 hover:bg-stone-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar filtrado
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Registrar ingreso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {resumen.map(({ tipo, label, total, count }) => (
          <div key={tipo} className="bg-white rounded-xl border border-stone-200 p-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLOR[tipo]}`}>{label}</span>
            <p className="text-lg font-bold text-stone-800 mt-2">{fmt(total)}</p>
            <p className="text-xs text-stone-400 mt-0.5">{count} registros</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setShowFiltros(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${showFiltros ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'}`}>
          <Filter className="w-4 h-4" /> Filtros
          {(filtros.tipo_ingreso || filtros.metodo_pago || filtros.fecha_desde || filtros.fecha_hasta) && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
        </button>
        <span className="text-sm text-stone-600 ml-auto">{filtered.length} resultados — Total: <span className="font-bold text-stone-800">{fmt(filtered.reduce((s, i) => s + Number(i.monto), 0))}</span></span>
      </div>

      {showFiltros && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Tipo de ingreso</label>
            <select value={filtros.tipo_ingreso ?? ''} onChange={e => setFiltros(f => ({ ...f, tipo_ingreso: e.target.value as TipoIngreso | '' }))} className={inp}>
              <option value="">Todos</option>
              {(Object.entries(TIPO_LABEL) as [TipoIngreso, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Método de pago</label>
            <select value={filtros.metodo_pago ?? ''} onChange={e => setFiltros(f => ({ ...f, metodo_pago: e.target.value as MetodoPago | '' }))} className={inp}>
              <option value="">Todos</option>
              {(Object.entries(METODO_LABEL) as [MetodoPago, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Desde</label>
            <input type="date" value={filtros.fecha_desde ?? ''} onChange={e => setFiltros(f => ({ ...f, fecha_desde: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Hasta</label>
            <input type="date" value={filtros.fecha_hasta ?? ''} onChange={e => setFiltros(f => ({ ...f, fecha_hasta: e.target.value }))} className={inp} />
          </div>
          <button onClick={() => setFiltros({})} className="text-sm text-stone-500 hover:text-stone-700 underline text-left">Limpiar filtros</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Tipo','Descripción','Responsable','Monto','Fecha','Método','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Monto' || h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-400">No se encontraron registros.</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLOR[i.tipo_ingreso]}`}>{TIPO_LABEL[i.tipo_ingreso]}</span></td>
                  <td className="px-4 py-3 text-stone-800 max-w-xs truncate">{i.descripcion}</td>
                  <td className="px-4 py-3 text-stone-600">{i.nombre_responsable || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmt(i.monto)}</td>
                  <td className="px-4 py-3 text-stone-600">{new Date(i.fecha_ingreso + 'T00:00:00').toLocaleDateString('es-CR')}</td>
                  <td className="px-4 py-3 text-stone-600">{METODO_LABEL[i.metodo_pago]}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(i)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(i.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-stone-800">{editing ? 'Editar ingreso' : 'Registrar ingreso'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tipo de ingreso</label>
                <select value={form.tipo_ingreso} onChange={e => setForm(f => ({ ...f, tipo_ingreso: e.target.value as TipoIngreso }))} className={inp}>
                  {(Object.entries(TIPO_LABEL) as [TipoIngreso, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción del ingreso" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Responsable</label>
                  <input value={form.nombre_responsable} onChange={e => setForm(f => ({ ...f, nombre_responsable: e.target.value }))} placeholder="Opcional" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="Opcional" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Monto (₡) *</label>
                  <input type="number" min={0} value={form.monto} onChange={e => setForm(f => ({ ...f, monto: +e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Fecha</label>
                  <input type="date" value={form.fecha_ingreso} onChange={e => setForm(f => ({ ...f, fecha_ingreso: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Método de pago</label>
                <select value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as MetodoPago }))} className={inp}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="sinpe">SINPE Móvil</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} placeholder="Opcional..." className={inp + ' resize-none'} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}