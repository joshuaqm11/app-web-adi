'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('test').select('*')
      console.log(data, error)
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