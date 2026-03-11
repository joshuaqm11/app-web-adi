'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DashboardStats } from '@/app/types'
import { LayoutDashboard, MapPin, TrendingUp, CreditCard, Users, DollarSign, Calendar, CalendarRange, Download, ShieldCheck, AlertTriangle, Clock } from 'lucide-react'
import { exportToExcel, formatMonto } from '@/lib/exportExcel'

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-stone-800 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

function formatCRC(value: number) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(value)
}

interface EstadoPagosStats {
  al_dia: number
  pendiente: number
  moroso: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [estadoPagos, setEstadoPagos] = useState<EstadoPagosStats>({ al_dia: 0, pendiente: 0, moroso: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const now = new Date()
      const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const primerDiaAnio = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]

      const [
        { data: lotes },
        { data: pagos },
        { data: ingresos },
        { data: estadoPagosData }
      ] = await Promise.all([
        supabase.from('lotes').select('estado'),
        supabase.from('pagos_anualidades').select('monto, fecha_pago'),
        supabase.from('ingresos_generales').select('monto, fecha_ingreso'),
        supabase.from('lotes_con_estado_pago').select('estado_pago')
      ])

      const totalLotes = lotes?.length ?? 0
      const lotesDisponibles = lotes?.filter(l => l.estado === 'disponible').length ?? 0
      const lotesOcupados = lotes?.filter(l => l.estado === 'ocupado').length ?? 0
      const lotesReservados = lotes?.filter(l => l.estado === 'reservado').length ?? 0

      const totalPagosAnualidades = pagos?.length ?? 0
      const ingresosCementerio = pagos?.reduce((sum, p) => sum + Number(p.monto), 0) ?? 0

      const ingresosActividades = ingresos?.reduce((sum, i) => sum + Number(i.monto), 0) ?? 0
      const totalIngresos = ingresosCementerio + ingresosActividades

      const pagosMes = pagos?.filter(p => p.fecha_pago >= primerDiaMes).reduce((sum, p) => sum + Number(p.monto), 0) ?? 0
      const ingresosMesAct = ingresos?.filter(i => i.fecha_ingreso >= primerDiaMes).reduce((sum, i) => sum + Number(i.monto), 0) ?? 0
      const ingresosMes = pagosMes + ingresosMesAct

      const pagosAnio = pagos?.filter(p => p.fecha_pago >= primerDiaAnio).reduce((sum, p) => sum + Number(p.monto), 0) ?? 0
      const ingresosAnioAct = ingresos?.filter(i => i.fecha_ingreso >= primerDiaAnio).reduce((sum, i) => sum + Number(i.monto), 0) ?? 0
      const ingresosAnio = pagosAnio + ingresosAnioAct

      setStats({ totalLotes, lotesDisponibles, lotesOcupados, lotesReservados,
        totalPagosAnualidades, ingresosCementerio, ingresosActividades, totalIngresos, ingresosMes, ingresosAnio })

      setEstadoPagos({
        al_dia:    estadoPagosData?.filter(l => l.estado_pago === 'al_dia').length ?? 0,
        pendiente: estadoPagosData?.filter(l => l.estado_pago === 'pendiente').length ?? 0,
        moroso:    estadoPagosData?.filter(l => l.estado_pago === 'moroso').length ?? 0,
      })

      setLoading(false)
    }
    fetchStats()
  }, [])

  function handleExportResumen() {
    if (!stats) return
    const mesActual = new Date().toLocaleString('es-CR', { month: 'long', year: 'numeric' })
    const anioActual = String(new Date().getFullYear())

    const data = [
      { 'Categoría': 'CEMENTERIO', 'Concepto': 'Total de Lotes', 'Valor': stats.totalLotes },
      { 'Categoría': 'CEMENTERIO', 'Concepto': 'Lotes Disponibles', 'Valor': stats.lotesDisponibles },
      { 'Categoría': 'CEMENTERIO', 'Concepto': 'Lotes Ocupados', 'Valor': stats.lotesOcupados },
      { 'Categoría': 'CEMENTERIO', 'Concepto': 'Lotes Reservados', 'Valor': stats.lotesReservados },
      { 'Categoría': 'ESTADO PAGOS', 'Concepto': `Lotes al día (${anioActual})`, 'Valor': estadoPagos.al_dia },
      { 'Categoría': 'ESTADO PAGOS', 'Concepto': `Lotes pendientes (${anioActual})`, 'Valor': estadoPagos.pendiente },
      { 'Categoría': 'ESTADO PAGOS', 'Concepto': `Lotes morosos (${anioActual})`, 'Valor': estadoPagos.moroso },
      { 'Categoría': 'FINANZAS', 'Concepto': 'Total Pagos de Anualidades (registros)', 'Valor': stats.totalPagosAnualidades },
      { 'Categoría': 'FINANZAS', 'Concepto': 'Ingresos Cementerio (anualidades)', 'Valor': formatMonto(stats.ingresosCementerio) },
      { 'Categoría': 'FINANZAS', 'Concepto': 'Ingresos Actividades (salón, ferias, etc)', 'Valor': formatMonto(stats.ingresosActividades) },
      { 'Categoría': 'FINANZAS', 'Concepto': 'Total General', 'Valor': formatMonto(stats.totalIngresos) },
      { 'Categoría': 'PERÍODO', 'Concepto': `Ingresos del Mes (${mesActual})`, 'Valor': formatMonto(stats.ingresosMes) },
      { 'Categoría': 'PERÍODO', 'Concepto': `Ingresos del Año (${anioActual})`, 'Valor': formatMonto(stats.ingresosAnio) },
    ]

    exportToExcel(data, `Resumen_Financiero_${new Date().toLocaleDateString('es-CR').replace(/\//g, '-')}`, 'Resumen')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalOcupados = stats?.lotesOcupados ?? 0
  const porcentajeAlDia = totalOcupados > 0 ? Math.round((estadoPagos.al_dia / totalOcupados) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Dashboard</h1>
            <p className="text-sm text-stone-500">Resumen general del sistema</p>
          </div>
        </div>
        <button
          onClick={handleExportResumen}
          disabled={!stats}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar resumen
        </button>
      </div>

      {/* Estado del Cementerio */}
      <section>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Estado del Cementerio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Lotes" value={stats?.totalLotes ?? 0} icon={MapPin} color="bg-stone-600" />
          <StatCard title="Disponibles" value={stats?.lotesDisponibles ?? 0} icon={MapPin} color="bg-emerald-500" subtitle="Lotes libres" />
          <StatCard title="Ocupados" value={stats?.lotesOcupados ?? 0} icon={MapPin} color="bg-red-500" subtitle="Con difunto" />
          <StatCard title="Reservados" value={stats?.lotesReservados ?? 0} icon={MapPin} color="bg-amber-500" subtitle="En reserva" />
        </div>
      </section>

      {/* Estado de Pagos */}
      <section>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Estado de Pagos — {new Date().getFullYear()}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard title="Al día" value={estadoPagos.al_dia} icon={ShieldCheck} color="bg-emerald-500" subtitle="Pagaron este año" />
          <StatCard title="Pendientes" value={estadoPagos.pendiente} icon={Clock} color="bg-amber-500" subtitle="Sin pago aún" />
          <StatCard title="Morosos" value={estadoPagos.moroso} icon={AlertTriangle} color="bg-red-500" subtitle="Año anterior sin pagar" />
        </div>

        {/* Barra de progreso */}
        {totalOcupados > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-stone-700">Cobranza {new Date().getFullYear()}</p>
              <p className="text-sm font-bold text-emerald-700">{porcentajeAlDia}% al día</p>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.round((estadoPagos.al_dia / totalOcupados) * 100)}%` }}
              />
              <div
                className="h-full bg-red-400 transition-all duration-500"
                style={{ width: `${Math.round((estadoPagos.moroso / totalOcupados) * 100)}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.round((estadoPagos.pendiente / totalOcupados) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Al día ({estadoPagos.al_dia})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Morosos ({estadoPagos.moroso})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Pendientes ({estadoPagos.pendiente})</span>
            </div>
          </div>
        )}
      </section>

      {/* Resumen Financiero */}
      <section>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Resumen Financiero
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Pagos de Anualidades" value={stats?.totalPagosAnualidades ?? 0} icon={CreditCard} color="bg-blue-500" subtitle="Registros totales" />
          <StatCard title="Ingresos Cementerio" value={formatCRC(stats?.ingresosCementerio ?? 0)} icon={DollarSign} color="bg-teal-500" subtitle="Anualidades acumuladas" />
          <StatCard title="Ingresos Actividades" value={formatCRC(stats?.ingresosActividades ?? 0)} icon={Users} color="bg-violet-500" subtitle="Salón, ferias y más" />
          <StatCard title="Total General" value={formatCRC(stats?.totalIngresos ?? 0)} icon={TrendingUp} color="bg-emerald-600" subtitle="Cementerio + actividades" />
          <StatCard title="Ingresos del Mes" value={formatCRC(stats?.ingresosMes ?? 0)} icon={Calendar} color="bg-orange-500"
            subtitle={new Date().toLocaleString('es-CR', { month: 'long', year: 'numeric' })} />
          <StatCard title="Ingresos del Año" value={formatCRC(stats?.ingresosAnio ?? 0)} icon={CalendarRange} color="bg-cyan-600" subtitle={String(new Date().getFullYear())} />
        </div>
      </section>
    </div>
  )
}