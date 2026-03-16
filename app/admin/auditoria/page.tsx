'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ClipboardList, Search, Filter, X } from 'lucide-react'

interface RegistroAuditoria {
  id: string
  tabla_afectada: string
  registro_id: string | null
  accion: string
  usuario_id: string | null
  fecha: string
  detalle: any
  perfil_usuario?: { nombre: string; rol: string } | null
}

const ACCION_CONFIG: Record<string, { label: string; color: string }> = {
  INSERT: { label: 'Creación',    color: 'bg-emerald-100 text-emerald-700' },
  UPDATE: { label: 'Edición',     color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Eliminación', color: 'bg-red-100 text-red-700' },
}

const TABLA_LABEL: Record<string, string> = {
  lotes:                     'Lotes',
  difuntos:                  'Difuntos',
  pagos_anualidades:         'Pagos Anualidades',
  ingresos_generales:        'Ingresos Generales',
  configuracion_anualidades: 'Configuración',
  junta_directiva:           'Junta Directiva',
  galeria:                   'Galería',
}

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)
  const [search, setSearch] = useState('')
  const [filtroTabla, setFiltroTabla] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [selected, setSelected] = useState<RegistroAuditoria | null>(null)

  async function fetchAuditoria() {
    setLoading(true)
    const { data } = await supabase
      .from('auditoria')
      .select('*, perfil_usuario(nombre, rol)')
      .order('fecha', { ascending: false })
      .limit(500)
    setRegistros((data ?? []) as RegistroAuditoria[])
    setLoading(false)
  }

  useEffect(() => { fetchAuditoria() }, [])

  const filtered = registros.filter(r => {
    if (filtroTabla && r.tabla_afectada !== filtroTabla) return false
    if (filtroAccion && r.accion !== filtroAccion) return false
    if (filtroDesde && r.fecha < filtroDesde) return false
    if (filtroHasta && r.fecha > filtroHasta + 'T23:59:59') return false
    if (search) {
      const q = search.toLowerCase()
      const nombre = r.perfil_usuario?.nombre?.toLowerCase() ?? ''
      const tabla = r.tabla_afectada.toLowerCase()
      if (!nombre.includes(q) && !tabla.includes(q)) return false
    }
    return true
  })

  const hayFiltros = filtroTabla || filtroAccion || filtroDesde || filtroHasta

  function limpiarFiltros() {
    setFiltroTabla(''); setFiltroAccion('')
    setFiltroDesde(''); setFiltroHasta('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Auditoría del Sistema</h1>
            <p className="text-sm text-stone-500">{registros.length} registros (últimos 500)</p>
          </div>
        </div>
        <button
          onClick={() => setShowFiltros(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
            showFiltros ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Filter className="w-4 h-4" /> Filtros
          {hayFiltros && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      {showFiltros && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Tabla</label>
            <select value={filtroTabla} onChange={e => setFiltroTabla(e.target.value)} className={inp}>
              <option value="">Todas</option>
              {Object.entries(TABLA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Acción</label>
            <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)} className={inp}>
              <option value="">Todas</option>
              <option value="INSERT">Creación</option>
              <option value="UPDATE">Edición</option>
              <option value="DELETE">Eliminación</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Desde</label>
            <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Hasta</label>
            <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className={inp} />
          </div>
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="text-sm text-stone-500 hover:text-stone-700 underline text-left">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por usuario o tabla..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="ml-auto text-sm text-stone-500">{filtered.length} resultados</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Fecha','Acción','Tabla','Usuario','Rol','Detalle'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">No se encontraron registros.</td></tr>
              ) : filtered.map(r => {
                const cfg = ACCION_CONFIG[r.accion] ?? { label: r.accion, color: 'bg-stone-100 text-stone-700' }
                return (
                  <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(r.fecha).toLocaleString('es-CR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-700 font-medium">
                      {TABLA_LABEL[r.tabla_afectada] ?? r.tabla_afectada}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {r.perfil_usuario?.nombre ?? <span className="text-stone-400">Sistema</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.perfil_usuario?.rol ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.perfil_usuario.rol === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                        }`}>{r.perfil_usuario.rol}</span>
                      ) : <span className="text-stone-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-medium"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-stone-800">Detalle de Auditoría</h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  {TABLA_LABEL[selected.tabla_afectada] ?? selected.tabla_afectada} —{' '}
                  {ACCION_CONFIG[selected.accion]?.label ?? selected.accion} —{' '}
                  {new Date(selected.fecha).toLocaleString('es-CR')}
                </p>
              </div>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-500 text-xs font-medium mb-1">Usuario</p>
                  <p className="text-stone-800 font-medium">{selected.perfil_usuario?.nombre ?? 'Sistema'}</p>
                  <p className="text-stone-500 text-xs">{selected.perfil_usuario?.rol ?? '—'}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs font-medium mb-1">Registro ID</p>
                  <p className="text-stone-600 font-mono text-xs break-all">{selected.registro_id ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-stone-500 text-xs font-medium mb-2">Datos</p>
                <pre className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(selected.detalle, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}