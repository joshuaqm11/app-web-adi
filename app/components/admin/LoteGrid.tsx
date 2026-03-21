'use client'

import { useState } from 'react'
import { Lote } from '@/app/types'
import { X, MapPin, Layers } from 'lucide-react'

const FILAS = 6
const COLUMNAS = 6

const ESTADO_COLOR: Record<string, string> = {
  disponible: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600',
  ocupado:    'bg-red-500    hover:bg-red-400    border-red-600',
  reservado:  'bg-amber-400  hover:bg-amber-300  border-amber-500',
  parcial:    'bg-blue-400   hover:bg-blue-300   border-blue-500',
}

const ESTADO_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  ocupado:    'Ocupado',
  reservado:  'Reservado',
  parcial:    'Parcial',
}

interface Props {
  lotes: Lote[]
  onLoteClick?: (lote: Lote) => void
}

export default function LoteGrid({ lotes, onLoteClick }: Props) {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null)

  const loteMap: Record<string, Lote> = {}
  lotes.forEach(l => { loteMap[l.codigo_lote] = l })

  function getLote(lado: 'L' | 'R', fila: number, col: number): Lote | undefined {
    return loteMap[`${lado}-F${fila}C${col}`]
  }

  // Determina el estado visual del lote — bóvedas parciales tienen su propio color
  function getEstadoVisual(lote: Lote): string {
    if (lote.tipo_sepultura === 'boveda') {
      const difuntos = (lote as any).difuntos?.length ?? 0
      const capacidad = lote.capacidad_nichos ?? 1
      if (difuntos === 0) return 'disponible'
      if (difuntos < capacidad) return 'parcial'
      return 'ocupado'
    }
    return lote.estado
  }

  function handleClick(lote: Lote | undefined) {
    if (!lote) return
    setSelectedLote(lote)
    onLoteClick?.(lote)
  }

  function renderGrid(lado: 'L' | 'R', label: string) {
    return (
      <div className="flex-1">
        <p className="text-center text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}>
          {Array.from({ length: FILAS }, (_, fi) =>
            Array.from({ length: COLUMNAS }, (_, ci) => {
              const fila = fi + 1
              const col = ci + 1
              const lote = getLote(lado, fila, col)
              const estadoVisual = lote ? getEstadoVisual(lote) : 'desconocido'
              const colorClass = ESTADO_COLOR[estadoVisual] ?? 'bg-stone-300 border-stone-400'
              return (
                <button
                  key={`${lado}-${fila}-${col}`}
                  onClick={() => handleClick(lote)}
                  title={lote
                    ? `${lote.codigo_lote} — ${ESTADO_LABEL[estadoVisual] ?? estadoVisual}`
                    : 'Sin lote'}
                  className={`aspect-square rounded-sm border text-[9px] font-bold text-white transition-all duration-150 cursor-pointer
                    ${lote ? colorClass : 'bg-stone-200 border-stone-300 cursor-default opacity-40'}
                    ${selectedLote?.id === lote?.id ? 'ring-2 ring-white ring-offset-1 ring-offset-stone-800 scale-105' : ''}`}
                >
                  {fila}{col}
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Difuntos del lote seleccionado (si es bóveda)
  const difuntosDelLote = selectedLote?.tipo_sepultura === 'boveda'
    ? ((selectedLote as any).difuntos ?? []) as Array<{ nombre_difunto: string; numero_nicho: number }>
    : []

  return (
    <div className="space-y-4">

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {Object.entries(ESTADO_LABEL).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${ESTADO_COLOR[key].split(' ')[0]}`} />
            <span className="text-stone-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <div className="bg-stone-800 rounded-xl p-5 shadow-inner">
        <div className="flex gap-4 items-start">
          {renderGrid('L', 'Lado Izquierdo')}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold [writing-mode:vertical-lr] rotate-180 h-20">Pasillo</p>
            <div className="w-6 flex-1 bg-stone-600 rounded-full opacity-40" />
            <div className="bg-stone-700 border border-stone-500 rounded-lg px-2 py-3 text-center">
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">Capilla</span>
            </div>
            <div className="w-6 flex-1 bg-stone-600 rounded-full opacity-40" />
          </div>
          {renderGrid('R', 'Lado Derecho')}
        </div>
      </div>

      {/* Detalle del lote seleccionado */}
      {selectedLote && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-lg relative">
          <button onClick={() => setSelectedLote(null)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-stone-800">Lote {selectedLote.codigo_lote}</h3>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
              getEstadoVisual(selectedLote) === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
              getEstadoVisual(selectedLote) === 'parcial'    ? 'bg-blue-100 text-blue-700' :
              getEstadoVisual(selectedLote) === 'ocupado'    ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {ESTADO_LABEL[getEstadoVisual(selectedLote)]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-stone-600">
            <div><span className="font-medium text-stone-700">Fila:</span> {selectedLote.fila}</div>
            <div><span className="font-medium text-stone-700">Columna:</span> {selectedLote.columna}</div>
            <div><span className="font-medium text-stone-700">Tipo:</span> {selectedLote.tipo_sepultura}</div>
            <div><span className="font-medium text-stone-700">Lado:</span> {selectedLote.lado ?? '—'}</div>

            {/* Info de nichos solo para bóvedas */}
            {selectedLote.tipo_sepultura === 'boveda' && (
              <div className="col-span-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-stone-400" />
                <span className="font-medium text-stone-700">Nichos:</span>
                <span>{difuntosDelLote.length}/{selectedLote.capacidad_nichos ?? 1} ocupados</span>
              </div>
            )}

            {selectedLote.observaciones && (
              <div className="col-span-2">
                <span className="font-medium text-stone-700">Observaciones:</span> {selectedLote.observaciones}
              </div>
            )}
          </div>

          {/* Lista de difuntos para bóvedas */}
          {selectedLote.tipo_sepultura === 'boveda' && difuntosDelLote.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Difuntos en esta bóveda</p>
              <div className="space-y-1">
                {difuntosDelLote
                  .sort((a, b) => a.numero_nicho - b.numero_nicho)
                  .map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-16 text-xs bg-stone-100 text-stone-600 font-mono px-1.5 py-0.5 rounded text-center">
                        Nicho {d.numero_nicho}
                      </span>
                      <span className="text-stone-700">{d.nombre_difunto}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}