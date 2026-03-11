'use client'

import { Download } from 'lucide-react'

interface Props {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export default function ExportButton({ onClick, label = 'Exportar Excel', disabled = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  )
}