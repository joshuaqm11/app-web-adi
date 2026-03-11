'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { LoteConEstadoPago, EstadoPago } from '@/app/types'
import { ShieldCheck, AlertTriangle, Clock, Ban, Download, Search } from 'lucide-react'
import { exportToExcel } from '@/lib/exportExcel'

const ESTADO_CONFIG: Record<EstadoPago, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  al_dia:      { label: 'Al día',      color: 'text-emerald-700', bg: 'bg-emerald-100', icon: ShieldCheck },
  pendiente:   { label: 'Pendiente',   color: 'text-amber-700',   bg: 'bg-amber-100',   icon: Clock },
  moroso:      { label: 'Moroso',      color: 'text-red-700',     bg: 'bg-red-100',     icon: AlertTriangle },
  sin_difunto: { label: 'Sin difunto', color: 'text-stone-500',   bg: 'bg-stone-100',   icon: Ban },
}

export default function EstadoPagosPage() {
  const [lotes, setLotes] = useState<LoteConEstadoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoPago | ''>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('lotes_con_estado_pago')
        .select('*')
        .order('lado')
        .order('fila')
        .order('columna')
      setLotes((data ?? []) as LoteConEstadoPago[])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = lotes.filter(l => {
    if (filtro && l.estado_pago !== filtro) return false
    if (search && !l.codigo_lote.toLowerCase().includes(search.toLowerCase()) &&
        !l.nombre_difunto?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const resumen = {
    al_dia:      lotes.filter(l => l.estado_pago === 'al_dia').length,
    pendiente:   lotes.filter(l => l.estado_pago === 'pendiente').length,
    moroso:      lotes.filter(l => l.estado_pago === 'moroso').length,
    sin_difunto: lotes.filter(l => l.estado_pago === 'sin_difunto').length,
  }

  function handleExport() {
    const data = filtered.map(l => ({
      'Código Lote': l.codigo_lote,
      'Lado': l.lado ?? '—',
      'Difunto': l.nombre_difunto ?? '—',
      'Tipo Sepultura': l.tipo_sepultura,
      'Estado Pago': ESTADO_CONFIG[l.estado_pago].label,
      'Año en Cobro': new Date().getFullYear(),
    }))
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
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar Excel
        </button>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ESTADO_CONFIG) as [EstadoPago, typeof ESTADO_CONFIG[EstadoPago]][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setFiltro(f => f === key ? '' : key)}
              className={`bg-white rounded-xl border-2 p-4 text-left transition-all ${
                filtro === key ? 'border-emerald-500 shadow-md' : 'border-stone-200 hover:border-stone-300'
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

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar lote o difunto..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {filtro && (
          <button onClick={() => setFiltro('')} className="text-sm text-stone-500 hover:text-stone-700 underline">
            Limpiar filtro
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500">{filtered.length} lotes</span>
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
                {['Código','Lado','Difunto','Tipo Sepultura','Estado Físico','Estado Pago'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400">No se encontraron registros.</td></tr>
              ) : filtered.map(l => {
                const cfg = ESTADO_CONFIG[l.estado_pago]
                const Icon = cfg.icon
                return (
                  <tr key={l.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-stone-800">{l.codigo_lote}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{l.lado ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-800">{l.nombre_difunto ?? <span className="text-stone-400">—</span>}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{l.tipo_sepultura}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        l.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                        l.estado === 'ocupado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{l.estado}</span>
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