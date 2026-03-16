import { BookOpen, MapPin, Users, Calendar } from 'lucide-react'

export default function HistoriaPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-blue-800 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Historia de San Juan de Florencia</h1>
          <p className="text-blue-200 text-lg">Conoce los orígenes y desarrollo de nuestra comunidad</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* Ubicación */}
        <div className="bg-white rounded-xl shadow-md p-8 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Ubicación y Geografía</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            San Juan de Florencia es una comunidad ubicada en el cantón de San Carlos, provincia de
            Alajuela, Costa Rica. Se encuentra en la zona norte del país, caracterizada por su
            exuberante vegetación, ríos caudalosos y un clima cálido y húmedo típico de la región.
          </p>
          <p className="text-gray-600 leading-relaxed">
            La comunidad forma parte de uno de los cantones más extensos de Costa Rica, San Carlos,
            conocido por su diversidad natural y su importante actividad agropecuaria, especialmente
            la ganadería y la producción lechera que han sido pilares de la economía local.
          </p>
        </div>

        {/* Orígenes */}
        <div className="bg-white rounded-xl shadow-md p-8 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Orígenes de la Comunidad</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Como muchas comunidades de la zona norte de Costa Rica, San Juan de Florencia tiene sus
            raíces en el proceso de colonización agrícola que vivió San Carlos durante el siglo XX.
            Familias pioneras se asentaron en estas tierras buscando oportunidades para el cultivo
            y la crianza de ganado, dando origen a los primeros asentamientos permanentes.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Con el paso de los años, la comunidad fue creciendo y consolidándose, desarrollando
            una identidad propia basada en el trabajo colectivo, la solidaridad entre vecinos
            y el amor por la tierra que los vio nacer.
          </p>
        </div>

        {/* Línea de tiempo */}
        <div className="bg-white rounded-xl shadow-md p-8 border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Hitos Históricos</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                periodo: 'Primeras décadas del siglo XX',
                color: 'bg-blue-500',
                texto: 'Llegada de las primeras familias colonizadoras a la región. Inicio de actividades agropecuarias y construcción de los primeros caminos de acceso a la comunidad.'
              },
              {
                periodo: 'Mediados del siglo XX',
                color: 'bg-green-500',
                texto: 'Consolidación de la comunidad. Construcción de la escuela primaria y la iglesia, dos pilares fundamentales para la vida social y cultural de San Juan de Florencia.'
              },
              {
                periodo: 'Segunda mitad del siglo XX',
                color: 'bg-yellow-500',
                texto: 'Desarrollo de infraestructura básica: electrificación, mejoras en los caminos y acceso a servicios de salud. Crecimiento de la actividad ganadera y lechera en la zona.'
              },
              {
                periodo: 'Finales del siglo XX',
                color: 'bg-orange-500',
                texto: 'Fundación de la Asociación de Desarrollo Integral (ADI) de San Juan de Florencia, organización comunitaria que asumiría la administración del cementerio comunal y la gestión de proyectos de desarrollo local.'
              },
              {
                periodo: 'Siglo XXI',
                color: 'bg-emerald-500',
                texto: 'Modernización de los servicios comunitarios. Implementación de sistemas digitales para la administración del cementerio y mejora en la gestión de los recursos de la comunidad.'
              },
            ].map((hito, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${hito.color} shrink-0 mt-1`} />
                  {i < 4 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-bold mb-1 ${hito.color.replace('bg-', 'text-')}`}>{hito.periodo}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{hito.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comunidad */}
        <div className="bg-white rounded-xl shadow-md p-8 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Nuestra Gente</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Los habitantes de San Juan de Florencia son reconocidos por su calidez, hospitalidad
            y espíritu de colaboración. La comunidad ha sabido mantener vivas las tradiciones
            y valores que les transmitieron sus antepasados, mientras abraza el progreso
            y las oportunidades que trae el siglo XXI.
          </p>
          <p className="text-gray-600 leading-relaxed">
            La Asociación de Desarrollo Integral juega un papel fundamental en la organización
            comunitaria, administrando el cementerio comunal y gestionando proyectos que buscan
            mejorar la calidad de vida de todos los vecinos de San Juan de Florencia.
          </p>
        </div>

        {/* Nota placeholder */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-amber-700 text-sm font-medium mb-1">📝 Nota</p>
          <p className="text-amber-600 text-sm">
            Esta información será actualizada con la historia oficial proporcionada por los
            miembros de la comunidad y la Junta Directiva de la ADI San Juan de Florencia.
          </p>
        </div>

      </div>
    </div>
  )
}