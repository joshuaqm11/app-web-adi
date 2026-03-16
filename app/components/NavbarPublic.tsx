'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function NavbarPublic() {
  return (
    <nav className="bg-blue-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
            <Image src="/Logo.jpeg" alt="Logo ADI" width={40} height={40} className="object-contain" />
          </div>
          <span className="font-bold text-lg">ADI San Juan de Florencia</span>
        </Link>

        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-blue-200 transition">Inicio</Link>
          <Link href="/historia" className="hover:text-blue-200 transition">Historia del Pueblo</Link>
          <Link href="/reglamento" className="hover:text-blue-200 transition">Reglamento Cementerio</Link>
          <Link href="/cementerio" className="hover:text-blue-200 transition">Información Cementerio</Link>
          <Link href="/contacto" className="hover:text-blue-200 transition">Contacto</Link>
          <Link href="/galeria" className="hover:text-blue-200 transition">Galería</Link>
        </div>

      </div>
    </nav>
  )
}