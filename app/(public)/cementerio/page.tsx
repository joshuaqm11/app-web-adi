import { MapPin, Calendar, DollarSign, Info, CheckCircle } from "lucide-react";

export default function Cementerio() {
  const anioActual = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Título */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Cementerio Comunal
            </h1>
          </div>
          <p className="text-gray-600">
            Información sobre el servicio y sistema de anualidades
          </p>
        </div>

        {/* Sobre el cementerio */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Sobre el Cementerio
            </h2>
          </div>
          <p className="text-gray-700 mb-3">
            El cementerio comunal de San Juan de Florencia es un espacio
            administrado por la Asociación de Desarrollo Integral, dedicado
            a brindar un lugar digno de descanso para los miembros de nuestra
            comunidad.
          </p>
          <p className="text-gray-600">
            Contamos con diferentes tipos de lotes disponibles, cada uno
            diseñado para satisfacer las necesidades de las familias.
          </p>
        </div>

        {/* Sistema de anualidades */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Sistema de Anualidades
            </h2>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">¿Qué es la anualidad?</h3>
            <p className="text-gray-600 mb-4">
              La anualidad es un pago anual obligatorio que deben realizar
              los propietarios de lotes en el cementerio. Este pago permite:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Mantenimiento general del cementerio</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Mejoras en infraestructura</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Servicios básicos como agua y electricidad</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Administración del espacio</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Importancia del pago puntual
            </h3>
            <p className="text-blue-700">
              El pago puntual de las anualidades garantiza que el cementerio
              se mantenga en óptimas condiciones para todas las familias.
            </p>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Calendario de Pagos
            </h2>
          </div>

          {/* Explicación principal */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
            <p className="text-purple-800 font-semibold text-base mb-1">
              ¿Cuándo debo pagar?
            </p>
            <p className="text-purple-700 text-sm">
              El cobro corresponde al <strong>año en curso</strong>. Los propietarios de lotes
              tienen <strong>todo el año {anioActual}</strong> para cancelar la anualidad
              correspondiente al año <strong>{anioActual}</strong>. Así será cada año.
            </p>
          </div>

          {/* Meses del año */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
            {[
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ].map((mes, index) => {
              const mesActual = new Date().getMonth()
              const isPast = index < mesActual
              const isCurrent = index === mesActual
              return (
                <div
                  key={mes}
                  className={`rounded-lg p-2 text-center text-xs font-semibold border transition
                    ${isCurrent
                      ? 'bg-green-500 text-white border-green-600 shadow-md scale-105'
                      : isPast
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                >
                  {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mb-1" />}
                  {mes}
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Mes actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span>Meses transcurridos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
              <span>Meses restantes</span>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{anioActual}</p>
              <p className="text-sm text-green-600 mt-1">Año en cobro</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">12 meses</p>
              <p className="text-sm text-blue-600 mt-1">Para realizar el pago</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {12 - new Date().getMonth()}
              </p>
              <p className="text-sm text-purple-600 mt-1">Meses restantes en {anioActual}</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">
            ¿Tiene dudas sobre su lote o anualidad?
          </h3>
          <p className="text-blue-100">
            Para consultas sobre el estado de su lote, pagos o información
            adicional, puede contactar a la Junta Directiva de la comunidad.
          </p>
        </div>

      </div>
    </div>
  );
}