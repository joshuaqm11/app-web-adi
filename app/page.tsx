'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('configuracion_anualidades')
        .select('*')

      if (error) {
        console.error('Error:', error)
      } else {
        console.log('Datos:', data)
      }
    }

    testConnection()
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">
        App Web ADI
      </h1>
    </main>
  )
}