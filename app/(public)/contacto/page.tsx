import { Phone, Mail, Clock, MapPin, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ConfiguracionSitio, MiembroJunta } from "@/app/types";

async function getContactoData() {
  const [{ data: config }, { data: junta }] = await Promise.all([
    supabase.from('configuracion_sitio').select('*').limit(1).single(),
    supabase.from('junta_directiva').select('*').order('orden')
  ])
  return {
    config: config as ConfiguracionSitio | null,
    titulares: (junta ?? []).filter((m: MiembroJunta) => m.tipo === 'titular'),
    suplentes: (junta ?? []).filter((m: MiembroJunta) => m.tipo === 'suplente'),
  }
}

export default async function ContactoPage() {
  const { config, titulares, suplentes } = await getContactoData()
  const whatsappLink = `https://wa.me/${config?.whatsapp ?? '50663940032'}?text=Hola,%20quisiera%20información%20sobre%20el%20cementerio%20comunal`

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-6">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-8 h-8 text-green-700" />
            <h1 className="text-3xl font-bold">Contacto</h1>
          </div>
          <p className="text-gray-600">Asociación de Desarrollo Integral de San Juan de Florencia</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-full">
                <Phone className="text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Teléfono</h3>
                <p className="text-xl font-medium">{config?.telefono ?? '6394-0032'}</p>
                <p className="text-gray-500 text-sm mb-3">WhatsApp de la ADI</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Escribir por WhatsApp</a>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full">
                <Mail className="text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Correo electrónico</h3>
                <p className="text-lg break-all">{config?.correo ?? 'adi.sanjuanflorencia@gmail.com'}</p>
                <p className="text-gray-500 text-sm">Respuesta en 24 a 48 horas</p>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white p-8 rounded-xl shadow mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-green-700" />
            <h2 className="text-xl font-semibold">Horario de Reuniones</h2>
          </div>
          <div className="bg-green-50 p-6 rounded">
            <p className="text-gray-700 mb-3">Las reuniones se realizan el <strong>{config?.horario_dia ?? 'primer miércoles de cada mes'}</strong>.</p>
            <p className="text-gray-700 mb-3">Horario aproximado: <strong>{config?.horario_hora ?? '6:00 PM a 10:00 PM'}</strong>.</p>
            <p className="text-gray-600 text-sm">En caso de requerir una reunión antes de esa fecha, se recomienda escribir o llamar previamente para coordinar la atención.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow mb-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-green-700" />
            <h2 className="text-xl font-semibold">Ubicación</h2>
          </div>
          <p className="mb-3"><strong>Dirección:</strong> {config?.direccion ?? 'San Juan de Florencia, Cantón de San Carlos, Costa Rica'}</p>
          <div className="bg-gray-100 p-4 rounded text-sm text-gray-600">{config?.descripcion_ubicacion}</div>
        </div>

        <div className="bg-green-700 text-white p-8 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">Junta Directiva</h2>
          </div>
          <p className="mb-8 text-green-100">La Junta Directiva está conformada por miembros de la comunidad encargados de la administración de proyectos, gestión del cementerio comunal y desarrollo de iniciativas para el bienestar de la comunidad.</p>

          <h3 className="text-lg font-semibold mb-4 text-green-100">Miembros de Junta Directiva</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {titulares.map((m: MiembroJunta) => (
              <div key={m.id} className="bg-white text-gray-800 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">{m.cargo}</p>
                <p className="font-semibold">{m.nombre}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4 text-green-100">Miembros Suplentes</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {suplentes.map((m: MiembroJunta) => (
              <div key={m.id} className="bg-white text-gray-800 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">{m.cargo}</p>
                <p className="font-semibold">{m.nombre}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}