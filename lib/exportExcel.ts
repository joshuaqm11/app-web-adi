import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

// Formatear moneda para Excel
export function formatMonto(monto: number) {
  return `₡${new Intl.NumberFormat('es-CR').format(monto)}`
}