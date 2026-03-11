'use client'

import Link from 'next/link'

export default function NavbarPublic() {
  return (
    <nav className="bg-blue-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <h1 className="font-bold text-lg">
          ADI San Juan de Florencia
        </h1>

        <div className="flex gap-6">
          <Link href="/">Inicio</Link>
          <Link href="/reglamento">Reglamento</Link>
          <Link href="/cementerio">Cementerio</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/galeria">Galeria de Imagenes</Link>
        </div>

      </div>
    </nav>
  )
}