'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Difunto, DifuntoFormData, Lote } from '@/app/types'
import { Users, Plus, Pencil, Trash2, X, Check, Download } from 'lucide-react'
import { exportToExcel } from '@/lib/exportExcel'

const EMPTY: DifuntoFormData = { nombre_difunto: '', fecha_fallecimiento: '', lote_id: '', fecha_entierro: '', observaciones: '' }
const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

export default function DifuntosPage() {
  const [difuntos, setDifuntos] = useState<Difunto[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Difunto | null>(null)
  const [form, setForm] = useState<DifuntoFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function fetchData() {
    setLoading(true)
    const [{ data: d }, { data: l }] = await Promise.all([
      supabase.from('difuntos').select('*, lotes(codigo_lote, lado)').order('nombre_difunto'),
      supabase.from('lotes').select('id, codigo_lote, lado, estado').eq('estado', 'disponible').order('codigo_lote')
    ])
    setDifuntos(d ?? [])
    setLotes((l ?? []) as unknown as Lote[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true) }
  function openEdit(d: Difunto) {
    setEditing(d)
    setForm({
      nombre_difunto: d.nombre_difunto, fecha_fallecimiento: d.fecha_fallecimiento ?? '',
      lote_id: d.lote_id ?? '', fecha_entierro: d.fecha_entierro ?? '', observaciones: d.observaciones ?? ''
    })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    if (!form.nombre_difunto.trim()) { setError('El nombre del difunto es requerido.'); setSaving(false); return }
    const payload = { ...form, lote_id: form.lote_id || null, fecha_fallecimiento: form.fecha_fallecimiento || null, fecha_entierro: form.fecha_entierro || null }
    const { error: err } = editing
      ? await supabase.from('difuntos').update(payload).eq('id', editing.id)
      : await supabase.from('difuntos').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    if (form.lote_id) await supabase.from('lotes').update({ estado: 'ocupado' }).eq('id', form.lote_id)
    setShowModal(false); fetchData(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('difuntos').delete().eq('id', id)
    fetchData()
  }

  function handleExport() {
    const data = filtered.map(d => ({
      'Nombre': d.nombre_difunto,
      'Fecha Fallecimiento': d.fecha_fallecimiento
        ? new Date(d.fecha_fallecimiento + 'T00:00:00').toLocaleDateString('es-CR') : '—',
      'Fecha Entierro': d.fecha_entierro
        ? new Date(d.fecha_entierro + 'T00:00:00').toLocaleDateString('es-CR') : '—',
      'Lote Asignado': (d as any).lotes?.codigo_lote ?? '—',
      'Lado': (d as any).lotes?.lado ?? '—',
      'Observaciones': d.observaciones ?? '—',
      'Fecha Registro': new Date(d.fecha_registro).toLocaleDateString('es-CR'),
    }))
    exportToExcel(data, `Difuntos_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Difuntos')
  }

  const filtered = difuntos.filter(d => d.nombre_difunto.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Registro de Difuntos</h1>
            <p className="text-sm text-stone-500">{difuntos.length} registros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Registrar difunto
          </button>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre..."
        className="w-full max-w-sm px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Nombre','Fallecimiento','Entierro','Lote asignado','Observaciones','Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">No se encontraron registros.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-stone-800">{d.nombre_difunto}</td>
                  <td className="px-4 py-3 text-stone-600">{d.fecha_fallecimiento ? new Date(d.fecha_fallecimiento + 'T00:00:00').toLocaleDateString('es-CR') : '—'}</td>
                  <td className="px-4 py-3 text-stone-600">{d.fecha_entierro ? new Date(d.fecha_entierro + 'T00:00:00').toLocaleDateString('es-CR') : '—'}</td>
                  <td className="px-4 py-3">{(d as any).lotes ? <span className="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded">{(d as any).lotes.codigo_lote}</span> : '—'}</td>
                  <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{d.observaciones || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="font-bold text-stone-800">{editing ? 'Editar difunto' : 'Registrar difunto'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre del difunto *</label>
                <input value={form.nombre_difunto} onChange={e => setForm(f => ({ ...f, nombre_difunto: e.target.value }))} placeholder="Nombre completo" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Fecha de fallecimiento</label>
                  <input type="date" value={form.fecha_fallecimiento} onChange={e => setForm(f => ({ ...f, fecha_fallecimiento: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Fecha de entierro</label>
                  <input type="date" value={form.fecha_entierro} onChange={e => setForm(f => ({ ...f, fecha_entierro: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Asignar lote</label>
                <select value={form.lote_id} onChange={e => setForm(f => ({ ...f, lote_id: e.target.value }))} className={inp}>
                  <option value="">— Sin asignar —</option>
                  {lotes.map(l => <option key={l.id} value={l.id}>{l.codigo_lote} ({l.lado})</option>)}
                  {editing?.lote_id && <option value={editing.lote_id}>{(editing as any).lotes?.codigo_lote ?? editing.lote_id} (actual)</option>}
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