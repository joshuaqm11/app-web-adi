export type EstadoLote = 'disponible' | 'ocupado' | 'reservado'
export type TipoSepultura = 'boveda' | 'lapida' | 'tierra'
export type MetodoPago = 'efectivo' | 'transferencia' | 'sinpe' | 'otro'
export type TipoIngreso = 'salon' | 'feria' | 'actividad' | 'donacion' | 'otro'
export type LadoCementerio = 'izquierdo' | 'derecho'
// 1. Nuevo tipo para estado de ocupación física
export type EstadoOcupacion = 'sin_difunto' | 'parcial' | 'ocupado'

export interface Lote {
  id: string
  codigo_lote: string
  fila: number
  columna: number
  estado: EstadoLote
  tipo_sepultura: TipoSepultura
  fecha_registro: string
  observaciones?: string | null
  lado?: LadoCementerio | null
  // 2. Nuevo campo en Lote
  capacidad_nichos?: number
  difuntos?: Difunto[]
}

export interface LoteFormData {
  codigo_lote: string
  fila: number
  columna: number
  estado: EstadoLote
  tipo_sepultura: TipoSepultura
  observaciones?: string
  lado?: LadoCementerio
  // 2. Nuevo campo en LoteFormData
  capacidad_nichos?: number
}

export interface Difunto {
  id: string
  nombre_difunto: string
  fecha_fallecimiento?: string | null
  lote_id?: string | null
  fecha_entierro?: string | null
  observaciones?: string | null
  fecha_registro: string
  // 3. Nuevo campo en Difunto
  numero_nicho?: number | null
  lotes?: Lote | null
}

export interface DifuntoFormData {
  nombre_difunto: string
  fecha_fallecimiento?: string
  lote_id?: string
  fecha_entierro?: string
  observaciones?: string
  // 3. Nuevo campo en DifuntoFormData
  numero_nicho?: number
}

export interface PagoAnualidad {
  id: string
  nombre_difunto: string
  familiar_responsable: string
  telefono?: string | null
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  tipo_sepultura: TipoSepultura
  observaciones?: string | null
  fecha_registro: string
  // 4. Nuevos campos en PagoAnualidad
  lote_id?: string | null
  anio?: number | null
}

export interface PagoFormData {
  nombre_difunto: string
  familiar_responsable: string
  telefono?: string
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  tipo_sepultura: TipoSepultura
  observaciones?: string
  // 4. Nuevos campos en PagoFormData
  lote_id?: string
  anio?: number
}

export interface ConfiguracionAnualidades {
  id: string
  monto_boveda: number
  monto_lapida: number
  monto_tierra: number
  actualizado_en: string
}

export interface IngresoGeneral {
  id: string
  tipo_ingreso: TipoIngreso
  descripcion: string
  nombre_responsable?: string | null
  telefono?: string | null
  monto: number
  fecha_ingreso: string
  metodo_pago: MetodoPago
  observaciones?: string | null
  fecha_registro: string
}

export interface IngresoFormData {
  tipo_ingreso: TipoIngreso
  descripcion: string
  nombre_responsable?: string
  telefono?: string
  monto: number
  fecha_ingreso: string
  metodo_pago: MetodoPago
  observaciones?: string
}

export interface DashboardStats {
  totalLotes: number
  lotesDisponibles: number
  lotesOcupados: number
  lotesReservados: number
  totalPagosAnualidades: number
  ingresosCementerio: number
  ingresosActividades: number
  totalIngresos: number
  ingresosMes: number
  ingresosAnio: number
}

export interface FiltrosIngresos {
  tipo_ingreso?: TipoIngreso | ''
  metodo_pago?: MetodoPago | ''
  fecha_desde?: string
  fecha_hasta?: string
}

export interface ConfiguracionSitio {
  id: string
  telefono: string
  whatsapp: string
  correo: string
  horario_dia: string
  horario_hora: string
  direccion: string
  descripcion_ubicacion: string
  actualizado_en: string
}

export interface MiembroJunta {
  id: string
  cargo: string
  nombre: string
  tipo: 'titular' | 'suplente'
  orden: number
}

export interface ImagenGaleria {
  id: string
  titulo?: string | null
  descripcion?: string | null
  url_imagen: string
  orden: number
  activa: boolean
  fecha_registro: string
}

export type EstadoPago = 'al_dia' | 'pendiente' | 'moroso' | 'sin_difunto'

export interface LoteConEstadoPago extends Lote {
  nombre_difunto: string | null
  difunto_id: string | null
  estado_pago: EstadoPago
  // 1. Nuevos campos de la vista actualizada
  total_difuntos?: number
  estado_ocupacion?: EstadoOcupacion
}