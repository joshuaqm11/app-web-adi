'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PagoAnualidad, PagoFormData, MetodoPago, TipoSepultura, ConfiguracionAnualidades, Difunto } from '@/app/types'
import { CreditCard, Plus, Pencil, Trash2, X, Check, Download } from 'lucide-react'
import { exportToExcel, formatMonto } from '@/lib/exportExcel'

const EMPTY: PagoFormData = {
  nombre_difunto: '', familiar_responsable: '', telefono: '',
  monto: 0, fecha_pago: new Date().toISOString().split('T')[0],
  metodo_pago: 'efectivo', tipo_sepultura: 'boveda', observaciones: ''
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v)
const METODO: Record<MetodoPago, string> = { efectivo: 'Efectivo', transferencia: 'Transferencia', sinpe: 'SINPE', otro: 'Otro' }

export default function PagosPage() {
  const [pagos, setPagos] = useState<PagoAnualidad[]>([])
  const [config, setConfig] = useState<ConfiguracionAnualidades | null>(null)
  const [difuntos, setDifuntos] = useState<Difunto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PagoAnualidad | null>(null)
  const [form, setForm] = useState<PagoFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function fetchData() {
    setLoading(true)
    const [{ data: p }, { data: c }, { data: d }] = await Promise.all([
      supabase.from('pagos_anualidades').select('*').order('fecha_pago', { ascending: false }),
      supabase.from('configuracion_anualidades').select('*').limit(1).single(),
      supabase.from('difuntos').select('id, nombre_difunto, lote_id, lotes(tipo_sepultura)').order('nombre_difunto')
    ])
    setPagos(p ?? [])
    setConfig(c ?? null)
    setDifuntos((d ?? []) as unknown as Difunto[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function handleTipo(tipo: TipoSepultura) {
    const m = tipo === 'boveda' ? config?.monto_boveda : tipo === 'lapida' ? config?.monto_lapida : config?.monto_tierra
    setForm(f => ({ ...f, tipo_sepultura: tipo, monto: m ?? f.monto }))
  }

  function handleSelectDifunto(nombre: string) {
    const difunto = difuntos.find(d => d.nombre_difunto === nombre)
    if (difunto && (difunto as any).lotes?.tipo_sepultura) {
      const tipo = (difunto as any).lotes.tipo_sepultura as TipoSepultura
      const monto = tipo === 'boveda' ? config?.monto_boveda : tipo === 'lapida' ? config?.monto_lapida : config?.monto_tierra
      setForm(f => ({ ...f, nombre_difunto: nombre, tipo_sepultura: tipo, monto: monto ?? f.monto }))
    } else {
      setForm(f => ({ ...f, nombre_difunto: nombre }))
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY, monto: config?.monto_boveda ?? 0 })
    setError('')
    setShowModal(true)
  }

  function openEdit(p: PagoAnualidad) {
    setEditing(p)
    setForm({
      nombre_difunto: p.nombre_difunto, familiar_responsable: p.familiar_responsable,
      telefono: p.telefono ?? '', monto: p.monto, fecha_pago: p.fecha_pago,
      metodo_pago: p.metodo_pago, tipo_sepultura: p.tipo_sepultura, observaciones: p.observaciones ?? ''
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    if (!form.nombre_difunto.trim()) { setError('Debe seleccionar un difunto.'); setSaving(false); return }
    if (!form.familiar_responsable.trim()) { setError('El familiar responsable es requerido.'); setSaving(false); return }
    if (form.monto <= 0) { setError('El monto debe ser mayor a cero.'); setSaving(false); return }
    const { error: err } = editing
      ? await supabase.from('pagos_anualidades').update(form).eq('id', editing.id)
      : await supabase.from('pagos_anualidades').insert(form)
    if (err) { setError(err.message); setSaving(false); return }
    setShowModal(false); fetchData(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este pago?')) return
    await supabase.from('pagos_anualidades').delete().eq('id', id); fetchData()
  }

  function buildExportData(lista: PagoAnualidad[]) {
    return lista.map(p => ({
      'Difunto': p.nombre_difunto,
      'Familiar Responsable': p.familiar_responsable,
      'Teléfono': p.telefono ?? '—',
      'Tipo Sepultura': p.tipo_sepultura.charAt(0).toUpperCase() + p.tipo_sepultura.slice(1),
      'Monto': formatMonto(p.monto),
      'Fecha Pago': new Date(p.fecha_pago + 'T00:00:00').toLocaleDateString('es-CR'),
      'Método Pago': METODO[p.metodo_pago],
      'Observaciones': p.observaciones ?? '—',
    }))
  }

  function handleExportTodo() {
    exportToExcel(buildExportData(pagos), `Anualidades_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Anualidades')
  }

  function handleExportFiltrado() {
    exportToExcel(buildExportData(filtered), `Anualidades_Filtrado_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Anualidades')
  }

  const filtered = pagos.filter(p =>
    p.nombre_difunto.toLowerCase().includes(search.toLowerCase()) ||
    p.familiar_responsable.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Pagos de Anualidades</h1>
            <p className="text-sm text-stone-500">{pagos.length} registros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTodo}
            disabled={pagos.length === 0}
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
            <Plus className="w-4 h-4" /> Registrar pago
          </button>
        </div>
      </div>

      {config && (
        <div className="grid grid-cols-3 gap-4">
          {[['Bóveda', config.monto_boveda], ['Lápida', config.monto_lapida], ['Tierra', config.monto_tierra]].map(([label, val]) => (
            <div key={label as string} className="bg-white rounded-xl border border-stone-200 px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-stone-600">Tarifa {label}</span>
              <span className="font-semibold text-stone-800">{fmt(val as number)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar difunto o responsable..."
          className="flex-1 max-w-sm px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <div className="ml-auto text-sm text-stone-600">
          Total: <span className="font-bold text-stone-800">{fmt(filtered.reduce((s, p) => s + Number(p.monto), 0))}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Difunto','Responsable','Teléfono','Tipo','Monto','Fecha','Método','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Monto' || h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400">No se encontraron registros.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-stone-800">{p.nombre_difunto}</td>
                  <td className="px-4 py-3 text-stone-600">{p.familiar_responsable}</td>
                  <td className="px-4 py-3 text-stone-600">{p.telefono || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 capitalize">{p.tipo_sepultura}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmt(p.monto)}</td>
                  <td className="px-4 py-3 text-stone-600">{new Date(p.fecha_pago + 'T00:00:00').toLocaleDateString('es-CR')}</td>
                  <td className="px-4 py-3 text-stone-600">{METODO[p.metodo_pago]}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="font-bold text-stone-800">{editing ? 'Editar pago' : 'Registrar pago de anualidad'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Difunto *</label>
                <select value={form.nombre_difunto} onChange={e => handleSelectDifunto(e.target.value)} className={inp}>
                  <option value="">— Seleccionar difunto —</option>
                  {difuntos.map(d => (
                    <option key={d.id} value={d.nombre_difunto}>{d.nombre_difunto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Familiar responsable *</label>
                <input value={form.familiar_responsable} onChange={e => setForm(f => ({ ...f, familiar_responsable: e.target.value }))}
                  placeholder="Nombre del responsable" className={inp} />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  placeholder="Ej. 8888-8888" className={inp} />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tipo de sepultura</label>
                <select value={form.tipo_sepultura} onChange={e => handleTipo(e.target.value as TipoSepultura)} className={inp}>
                  <option value="boveda">Bóveda</option>
                  <option value="lapida">Lápida</option>
                  <option value="tierra">Tierra</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Monto (₡) *</label>
                  <input type="number" min={0} value={form.monto}
                    onChange={e => setForm(f => ({ ...f, monto: +e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Fecha de pago</label>
                  <input type="date" value={form.fecha_pago}
                    onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))} className={inp} />
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
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  rows={3} placeholder="Opcional..." className={inp + ' resize-none'} />
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