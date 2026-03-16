import { Building2, Users, FileText, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* HERO */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center border-4 border-blue-100">
              <Image src="/Logo.jpeg" alt="Logo ADI" width={96} height={96} className="object-contain" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Bienvenido a la ADI San Juan de Florencia
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Trabajando por el desarrollo integral de nuestra comunidad
            con transparencia, orden y compromiso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reglamento" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Ver Reglamento
            </Link>
            <Link href="/contacto" className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">
              Contáctenos
            </Link>
          </div>

        </div>
      </section>

      {/* VALORES */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-3xl font-semibold text-gray-800 mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white rounded-xl shadow-md p-6 text-center border">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Transparencia</h3>
              <p className="text-gray-600 text-sm">
                Gestión clara y abierta de todos los procesos administrativos
                de la Asociación de Desarrollo.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center border">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Orden</h3>
              <p className="text-gray-600 text-sm">
                Control eficiente y organizado de los servicios
                del cementerio comunal.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center border">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Compromiso</h3>
              <p className="text-gray-600 text-sm">
                Dedicación al bienestar y desarrollo
                de la comunidad de San Juan de Florencia.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* INFORMACIÓN */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 border">
            <div className="flex gap-4">
              <Phone className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-3">Información Importante</h3>
                <p className="text-gray-600 mb-4">
                  La Asociación de Desarrollo Integral de San Juan de Florencia
                  administra el cementerio comunal mediante un sistema de
                  anualidades que permite mantener y mejorar el espacio.
                </p>
                <p className="text-gray-600">
                  Todos los propietarios de lotes deben mantener al día
                  el pago de sus anualidades según lo establecido en el reglamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN */}
      <section className="py-12 bg-gray-200">
        <div className="text-center">
          <p className="text-gray-700 mb-4">¿Eres miembro de la Junta Directiva?</p>
          <Link href="/admin/login" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
            Acceder al Panel Administrativo
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <Image src="/Logo.jpeg" alt="Logo ADI" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-semibold">ADI San Juan de Florencia</span>
        </div>
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Todos los derechos reservados</p>
      </footer>

    </div>
  );
}