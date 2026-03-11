'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ImagenGaleria } from '@/app/types'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'

export default function GaleriaPage() {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    async function fetchImagenes() {
      const { data } = await supabase
        .from('galeria')
        .select('*')
        .eq('activa', true)
        .order('orden')
      setImagenes(data ?? [])
      setLoading(false)
    }
    fetchImagenes()
  }, [])

  function openLightbox(index: number) {
    setSelected(index)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setSelected(null)
    document.body.style.overflow = ''
  }

  function prev() {
    if (selected === null) return
    setSelected(selected === 0 ? imagenes.length - 1 : selected - 1)
  }

  function next() {
    if (selected === null) return
    setSelected(selected === imagenes.length - 1 ? 0 : selected + 1)
  }

  // Navegar con teclado
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (selected === null) return
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selected])

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Images className="w-8 h-8 text-green-700" />
            <h1 className="text-3xl font-bold text-gray-800">Galería</h1>
          </div>
          <p className="text-gray-600">
            Fotografías de actividades y espacios de la comunidad de San Juan de Florencia
          </p>
        </div>

        {/* Grid de imágenes */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : imagenes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Images className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay imágenes disponibles aún.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {imagenes.map((img, index) => (
              <div
                key={img.id}
                onClick={() => openLightbox(index)}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={img.url_imagen}
                  alt={img.titulo ?? 'Imagen galería'}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {(img.titulo || img.descripcion) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      {img.titulo && <p className="text-white font-semibold text-sm">{img.titulo}</p>}
                      {img.descripcion && <p className="text-gray-300 text-xs mt-1">{img.descripcion}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            {selected + 1} / {imagenes.length}
          </div>

          {/* Botón anterior */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Imagen principal */}
          <div
            className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagenes[selected].url_imagen}
              alt={imagenes[selected].titulo ?? ''}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {(imagenes[selected].titulo || imagenes[selected].descripcion) && (
              <div className="mt-4 text-center">
                {imagenes[selected].titulo && (
                  <p className="text-white font-semibold text-lg">{imagenes[selected].titulo}</p>
                )}
                {imagenes[selected].descripcion && (
                  <p className="text-gray-400 text-sm mt-1">{imagenes[selected].descripcion}</p>
                )}
              </div>
            )}
          </div>

          {/* Botón siguiente */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Miniaturas */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg px-2">
            {imagenes.map((img, index) => (
              <button
                key={img.id}
                onClick={(e) => { e.stopPropagation(); setSelected(index) }}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                  selected === index ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url_imagen} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}