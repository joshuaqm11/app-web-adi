'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Lote, LoteFormData, EstadoLote, TipoSepultura, LadoCementerio, LoteConEstadoPago, EstadoPago } from '@/app/types'
import LoteGrid from '@/app/components/admin/LoteGrid'
import { Map, Plus, Pencil, Trash2, X, Check, Download, ShieldCheck, AlertTriangle, Clock, Ban } from 'lucide-react'
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
  observaciones: '', lado: 'izquierdo'
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div>
}

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

  async function fetchLotes() {
    setLoading(true)
    const [{ data: conEstado }, { data: simples }] = await Promise.all([
      supabase.from('lotes_con_estado_pago').select('*').order('lado').order('fila').order('columna'),
      supabase.from('lotes').select('*').order('lado').order('fila').order('columna')
    ])
    setLotes((conEstado ?? []) as LoteConEstadoPago[])
    setLotesSimples(simples ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLotes() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true) }
  function openEdit(l: LoteConEstadoPago) {
    setEditing(l as unknown as Lote)
    setForm({
      codigo_lote: l.codigo_lote, fila: l.fila, columna: l.columna,
      estado: l.estado, tipo_sepultura: l.tipo_sepultura,
      observaciones: l.observaciones ?? '', lado: l.lado ?? 'izquierdo'
    })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    if (!form.codigo_lote.trim()) { setError('El código del lote es requerido.'); setSaving(false); return }
    const { error: err } = editing
      ? await supabase.from('lotes').update(form).eq('id', editing.id)
      : await supabase.from('lotes').insert(form)
    if (err) { setError(err.message); setSaving(false); return }
    setShowModal(false); fetchLotes(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este lote?')) return
    await supabase.from('lotes').delete().eq('id', id)
    fetchLotes()
  }

  function handleExport() {
    const data = lotes.map(l => ({
      'Código': l.codigo_lote,
      'Lado': l.lado === 'izquierdo' ? 'Izquierdo' : 'Derecho',
      'Fila': l.fila,
      'Columna': l.columna,
      'Estado Físico': l.estado.charAt(0).toUpperCase() + l.estado.slice(1),
      'Estado Pago': PAGO_CONFIG[l.estado_pago].label,
      'Difunto': l.nombre_difunto ?? '—',
      'Tipo de Sepultura': l.tipo_sepultura.charAt(0).toUpperCase() + l.tipo_sepultura.slice(1),
      'Observaciones': l.observaciones ?? '—',
      'Fecha Registro': new Date(l.fecha_registro).toLocaleDateString('es-CR'),
    }))
    exportToExcel(data, `Lotes_Cementerio_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Lotes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Gestión de Lotes</h1>
            <p className="text-sm text-stone-500">{lotes.length} lotes registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={lotes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
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
                {['Código','Lado','Estado','Tipo','Difunto','Estado Pago','Observaciones','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lotes.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400">No hay lotes registrados.</td></tr>
              ) : lotes.map(lote => {
                const cfg = PAGO_CONFIG[lote.estado_pago]
                const Icon = cfg.icon
                return (
                  <tr key={lote.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-stone-800">{lote.codigo_lote}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{lote.lado ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[lote.estado]}`}>{lote.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{lote.tipo_sepultura}</td>
                    <td className="px-4 py-3 text-stone-700">{lote.nombre_difunto ?? <span className="text-stone-400">—</span>}</td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="font-bold text-stone-800">{editing ? 'Editar Lote' : 'Agregar Lote'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <Field label="Código del lote">
                <input value={form.codigo_lote} onChange={e => setForm(f => ({ ...f, codigo_lote: e.target.value }))} placeholder="Ej. L-F1C1" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fila"><input type="number" min={1} value={form.fila} onChange={e => setForm(f => ({ ...f, fila: +e.target.value }))} className={inp} /></Field>
                <Field label="Columna"><input type="number" min={1} value={form.columna} onChange={e => setForm(f => ({ ...f, columna: +e.target.value }))} className={inp} /></Field>
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
                <select value={form.tipo_sepultura} onChange={e => setForm(f => ({ ...f, tipo_sepultura: e.target.value as TipoSepultura }))} className={inp}>
                  <option value="boveda">Bóveda</option>
                  <option value="lapida">Lápida</option>
                  <option value="tierra">Tierra</option>
                </select>
              </Field>
              <Field label="Observaciones">
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} placeholder="Opcional..." className={inp + ' resize-none'} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
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