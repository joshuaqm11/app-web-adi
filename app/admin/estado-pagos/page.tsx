'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { LoteConEstadoPago, EstadoPago, EstadoOcupacion, TipoSepultura } from '@/app/types'
import { ShieldCheck, AlertTriangle, Clock, Ban, Download, Search, Layers, Filter } from 'lucide-react'
import { exportToExcel } from '@/lib/exportExcel'

const ESTADO_CONFIG: Record<EstadoPago, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  al_dia:      { label: 'Al día',      color: 'text-emerald-700', bg: 'bg-emerald-100', icon: ShieldCheck },
  pendiente:   { label: 'Pendiente',   color: 'text-amber-700',   bg: 'bg-amber-100',   icon: Clock },
  moroso:      { label: 'Moroso',      color: 'text-red-700',     bg: 'bg-red-100',     icon: AlertTriangle },
  sin_difunto: { label: 'Sin difunto', color: 'text-stone-500',   bg: 'bg-stone-100',   icon: Ban },
}

const OCUPACION_BADGE: Record<EstadoOcupacion, { label: string; cls: string }> = {
  sin_difunto: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700' },
  parcial:     { label: 'Parcial',    cls: 'bg-blue-100 text-blue-700' },
  ocupado:     { label: 'Ocupado',    cls: 'bg-red-100 text-red-700' },
}

const sel = 'px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700'

interface Filtros {
  search: string
  estado_pago: EstadoPago | ''
  tipo_sepultura: TipoSepultura | ''
  estado_fisico: EstadoOcupacion | ''
}
const FILTROS_EMPTY: Filtros = { search: '', estado_pago: '', tipo_sepultura: '', estado_fisico: '' }

export default function EstadoPagosPage() {
  const [lotes, setLotes] = useState<LoteConEstadoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_EMPTY)
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('lotes_con_estado_pago')
        .select('*')
        .order('lado').order('fila').order('columna')
      setLotes((data ?? []) as LoteConEstadoPago[])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Filtrado
  const filtered = lotes.filter(l => {
    if (filtros.search) {
      const q = filtros.search.toLowerCase()
      if (!l.codigo_lote.toLowerCase().includes(q) &&
          !(l.nombre_difunto?.toLowerCase().includes(q) ?? false)) return false
    }
    if (filtros.estado_pago && l.estado_pago !== filtros.estado_pago) return false
    if (filtros.tipo_sepultura && l.tipo_sepultura !== filtros.tipo_sepultura) return false
    if (filtros.estado_fisico) {
      const ocupacion = l.estado_ocupacion ?? ((l.total_difuntos ?? 0) > 0 ? 'ocupado' : 'sin_difunto')
      if (ocupacion !== filtros.estado_fisico) return false
    }
    return true
  })

  const resumen = {
    al_dia:      lotes.filter(l => l.estado_pago === 'al_dia').length,
    pendiente:   lotes.filter(l => l.estado_pago === 'pendiente').length,
    moroso:      lotes.filter(l => l.estado_pago === 'moroso').length,
    sin_difunto: lotes.filter(l => l.estado_pago === 'sin_difunto').length,
  }

  const hayFiltros = Object.values(filtros).some(v => v !== '')
  const cantFiltrosActivos = [filtros.estado_pago, filtros.tipo_sepultura, filtros.estado_fisico].filter(Boolean).length
  function limpiarFiltros() { setFiltros(FILTROS_EMPTY) }

  // Click en card — activa/desactiva filtro de estado_pago
  function handleCardClick(key: EstadoPago) {
    setFiltros(f => ({ ...f, estado_pago: f.estado_pago === key ? '' : key }))
  }

  function handleExport() {
    const data = filtered.map(l => {
      const esB = l.tipo_sepultura === 'boveda'
      const ocupacion = l.estado_ocupacion ?? ((l.total_difuntos ?? 0) > 0 ? 'ocupado' : 'sin_difunto')
      return {
        'Código Lote': l.codigo_lote,
        'Lado': l.lado ?? '—',
        'Tipo Sepultura': l.tipo_sepultura.charAt(0).toUpperCase() + l.tipo_sepultura.slice(1),
        'Nichos': esB ? `${l.total_difuntos ?? 0}/${l.capacidad_nichos ?? 1}` : '—',
        'Estado Físico': OCUPACION_BADGE[ocupacion as EstadoOcupacion].label,
        'Estado Pago': ESTADO_CONFIG[l.estado_pago].label,
        'Año en Cobro': new Date().getFullYear(),
      }
    })
    exportToExcel(data, `Estado_Pagos_${new Date().getFullYear()}`, 'EstadoPagos')
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Estado de Pagos</h1>
            <p className="text-sm text-stone-500">Año en cobro: {new Date().getFullYear()}</p>
          </div>
        </div>
        <button onClick={handleExport} disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
          <Download className="w-4 h-4" /> Exportar Excel
        </button>
      </div>

      {/* Cards resumen — también funcionan como filtro rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ESTADO_CONFIG) as [EstadoPago, typeof ESTADO_CONFIG[EstadoPago]][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button key={key}
              onClick={() => handleCardClick(key)}
              className={`bg-white rounded-xl border-2 p-4 text-left transition-all ${
                filtros.estado_pago === key ? 'border-emerald-500 shadow-md' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg} mb-3`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <p className="text-2xl font-bold text-stone-800">{resumen[key]}</p>
              <p className={`text-sm font-semibold mt-0.5 ${cfg.color}`}>{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={filtros.search}
              onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))}
              placeholder="Buscar lote o difunto..."
              className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setShowFiltros(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFiltros || cantFiltrosActivos > 0
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-stone-300 text-stone-600 hover:border-stone-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {cantFiltrosActivos > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cantFiltrosActivos}
              </span>
            )}
          </button>

          {hayFiltros && (
            <button onClick={limpiarFiltros} className="text-sm text-stone-500 hover:text-stone-700 underline">
              Limpiar
            </button>
          )}

          <span className="ml-auto text-sm text-stone-500">{filtered.length} lotes</span>
        </div>

        {/* Panel de filtros desplegable */}
        {showFiltros && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Estado de pago</label>
              <select
                value={filtros.estado_pago}
                onChange={e => setFiltros(f => ({ ...f, estado_pago: e.target.value as EstadoPago | '' }))}
                className={sel + ' w-full'}
              >
                <option value="">Todos</option>
                <option value="al_dia">Al día</option>
                <option value="pendiente">Pendiente</option>
                <option value="moroso">Moroso</option>
                <option value="sin_difunto">Sin difunto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Tipo de sepultura</label>
              <select
                value={filtros.tipo_sepultura}
                onChange={e => setFiltros(f => ({ ...f, tipo_sepultura: e.target.value as TipoSepultura | '' }))}
                className={sel + ' w-full'}
              >
                <option value="">Todos</option>
                <option value="boveda">Bóveda</option>
                <option value="lapida">Lápida</option>
                <option value="tierra">Tierra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Estado físico</label>
              <select
                value={filtros.estado_fisico}
                onChange={e => setFiltros(f => ({ ...f, estado_fisico: e.target.value as EstadoOcupacion | '' }))}
                className={sel + ' w-full'}
              >
                <option value="">Todos</option>
                <option value="sin_difunto">Disponible</option>
                <option value="parcial">Parcial</option>
                <option value="ocupado">Ocupado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                {['Código', 'Lado', 'Tipo', 'Nichos', 'Estado Físico', 'Estado Pago'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                  {hayFiltros ? 'No hay lotes que coincidan con los filtros.' : 'No se encontraron registros.'}
                </td></tr>
              ) : filtered.map(l => {
                const cfg = ESTADO_CONFIG[l.estado_pago]
                const Icon = cfg.icon
                const esBoveda = l.tipo_sepultura === 'boveda'
                const ocupacion = l.estado_ocupacion ?? ((l.total_difuntos ?? 0) > 0 ? 'ocupado' : 'sin_difunto')
                const ocupBadge = OCUPACION_BADGE[ocupacion as EstadoOcupacion]
                return (
                  <tr key={l.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-stone-800">{l.codigo_lote}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{l.lado ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{l.tipo_sepultura}</td>
                    <td className="px-4 py-3">
                      {esBoveda ? (
                        <span className="inline-flex items-center gap-1 text-stone-700 font-medium">
                          <Layers className="w-3.5 h-3.5 text-stone-400" />
                          {l.total_difuntos ?? 0}/{l.capacidad_nichos ?? 1}
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ocupBadge.cls}`}>
                        {ocupBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}