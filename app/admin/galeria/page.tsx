'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ImagenGaleria } from '@/app/types'
import { Images, Plus, Trash2, X, Check, Upload, Eye, EyeOff } from 'lucide-react'

const inp = 'w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

export default function GaleriaAdminPage() {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [form, setForm] = useState({ titulo: '', descripcion: '', orden: 0, url_imagen: '' })

  async function fetchImagenes() {
    setLoading(true)
    const { data } = await supabase.from('galeria').select('*').order('orden')
    setImagenes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchImagenes() }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    setSaving(true); setError('')

    let urlImagen = form.url_imagen

    // Si hay archivo, subirlo a Supabase Storage
    if (file) {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(fileName, file)

      if (uploadError) { setError(uploadError.message); setSaving(false); setUploading(false); return }

      const { data: urlData } = supabase.storage.from('galeria').getPublicUrl(fileName)
      urlImagen = urlData.publicUrl
      setUploading(false)
    }

    if (!urlImagen) { setError('Debes subir una imagen o ingresar una URL.'); setSaving(false); return }

    const { error: err } = await supabase.from('galeria').insert({
      ...form,
      url_imagen: urlImagen
    })

    if (err) { setError(err.message); setSaving(false); return }

    setShowModal(false)
    setFile(null)
    setPreview('')
    setForm({ titulo: '', descripcion: '', orden: 0, url_imagen: '' })
    fetchImagenes()
    setSaving(false)
  }

  async function toggleActiva(img: ImagenGaleria) {
    await supabase.from('galeria').update({ activa: !img.activa }).eq('id', img.id)
    fetchImagenes()
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm('¿Eliminar esta imagen?')) return
    // Eliminar del storage si es una URL de Supabase
    if (url.includes('supabase')) {
      const fileName = url.split('/').pop()
      if (fileName) await supabase.storage.from('galeria').remove([fileName])
    }
    await supabase.from('galeria').delete().eq('id', id)
    fetchImagenes()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Images className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-stone-800">Galería de Imágenes</h1>
            <p className="text-sm text-stone-500">{imagenes.length} imágenes registradas</p>
          </div>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setFile(null); setPreview(''); setForm({ titulo: '', descripcion: '', orden: 0, url_imagen: '' }) }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar imagen
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : imagenes.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Images className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No hay imágenes aún. Agrega la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagenes.map(img => (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 transition ${img.activa ? 'border-stone-200' : 'border-red-200 opacity-60'}`}>
              <img src={img.url_imagen} alt={img.titulo ?? ''} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleActiva(img)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition"
                  title={img.activa ? 'Ocultar' : 'Mostrar'}
                >
                  {img.activa ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(img.id, img.url_imagen)}
                  className="p-2 bg-red-500/70 hover:bg-red-600 rounded-lg text-white transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {img.titulo && (
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium text-stone-700 truncate">{img.titulo}</p>
                </div>
              )}
              {!img.activa && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Oculta</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-stone-800">Agregar imagen</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              {/* Upload de archivo */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Subir imagen desde tu computadora</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Clic para seleccionar imagen</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">O usa una URL externa</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">URL de imagen externa</label>
                <input
                  value={form.url_imagen}
                  onChange={e => setForm(f => ({ ...f, url_imagen: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className={inp}
                  disabled={!!file}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Título (opcional)</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej. Actividad comunal 2024" className={inp} />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Descripción (opcional)</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} placeholder="Breve descripción..." className={inp + ' resize-none'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Orden</label>
                <input type="number" min={0} value={form.orden} onChange={e => setForm(f => ({ ...f, orden: +e.target.value }))} className={inp} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-stone-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={saving || uploading} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                <Check className="w-4 h-4" />{uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}