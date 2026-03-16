import { FileText, CheckCircle2 } from "lucide-react";

export default function Reglamento() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Título */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Reglamento Interno Cementerio
            </h1>
          </div>

          <p className="text-gray-600">
            Normativa para el uso y administración del cementerio comunal
          </p>
        </div>

        {/* Disposiciones Generales */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Disposiciones Generales
          </h2>

          <div className="space-y-4">

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p className="text-gray-700">
                El cementerio comunal es administrado por la Junta Directiva
                de la Asociación de Desarrollo Integral de San Juan de Florencia.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p className="text-gray-700">
                Todos los lotes están sujetos al pago de una anualidad para
                mantenimiento y mejoras del cementerio.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p className="text-gray-700">
                El incumplimiento en el pago de anualidades puede resultar
                en sanciones administrativas según lo establecido en este reglamento.
              </p>
            </div>

          </div>
        </div>

        {/* Tipos de Lotes */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <h2 className="text-xl font-semibold mb-5 text-gray-800">
            Tipos de Lotes
          </h2>

          <div className="space-y-4">

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold">1. Lote Disponible</h4>
              <p className="text-gray-600 text-sm">
                Lote sin propietario asignado, disponible para adquisición.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold">2. Lote Vendido sin Usar</h4>
              <p className="text-gray-600 text-sm">
                Lote con propietario asignado pero sin ocupación actual.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold">3. Lote con Tierra</h4>
              <p className="text-gray-600 text-sm">
                Lote ocupado con entierro sin estructura permanente.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold">4. Lote con Lápida</h4>
              <p className="text-gray-600 text-sm">
                Lote con lápida o placa conmemorativa instalada.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold">5. Lote con Bóveda</h4>
              <p className="text-gray-600 text-sm">
                Lote con estructura de bóveda construida.
              </p>
            </div>

          </div>
        </div>

        {/* Sistema de pagos */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Sistema de Anualidades
          </h2>

          <div className="space-y-4">

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p>
                <strong>Fecha de pago:</strong> Las anualidades deben pagarse
                durante el año en cobro, es decir, se tienen los 12 meses del año para
                cancelar la anualidad.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p>
                <strong>Estado "Al día":</strong> Pago realizado dentro
                del período establecido.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p>
                <strong>Estado "Pendiente":</strong> Pago aún no realizado
                (Dentro del año en cobro).
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="text-green-600 w-5 h-5 mt-1" />
              <p>
                <strong>Estado "Moroso":</strong> Pago no realizado
                después de la fecha de corte.
              </p>
            </div>

          </div>
        </div>

        {/* Derechos y obligaciones */}
        <div className="bg-white rounded-xl shadow-md p-6 border">

          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Derechos y Obligaciones
          </h2>

          <div className="mb-6">

            <h4 className="font-semibold mb-3 text-gray-700">
              Derechos del Propietario
            </h4>

            <ul className="space-y-2 ml-4 text-gray-700">
              <li>• Uso exclusivo del lote asignado</li>
              <li>• Realizar mejoras dentro de las normativas</li>
              <li>• Transferir la propiedad según procedimientos legales</li>
            </ul>

          </div>

          <div className="border-t pt-4">

            <h4 className="font-semibold mb-3 text-gray-700">
              Obligaciones del Propietario
            </h4>

            <ul className="space-y-2 ml-4 text-gray-700">
              <li>• Pagar la anualidad en tiempo y forma</li>
              <li>• Respetar las normas del cementerio</li>
              <li>• Informar cambios de contacto a la administración</li>
            </ul>

          </div>

        </div>

      </div>
    </div>
  );
}