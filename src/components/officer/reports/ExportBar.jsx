import { FileDown, FileSpreadsheet, Printer } from 'lucide-react'
import { exportCSV, exportExcel, exportPDF } from '../../../utils/reportExports.js'

/** CSV / Excel / PDF export controls for the current report dataset. */
export default function ExportBar({ columns, rows, baseName = 'report', title = 'Report', disabled }) {
  const noRows = disabled || !rows || rows.length === 0
  const btn = 'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-40'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={noRows} onClick={() => exportCSV(columns, rows, baseName)} className={`${btn} border-plum-950/15 text-plum-800 hover:bg-plum-50`}>
        <FileDown className="h-4 w-4" aria-hidden="true" /> CSV
      </button>
      <button type="button" disabled={noRows} onClick={() => exportExcel(columns, rows, baseName, title)} className={`${btn} border-plum-950/15 text-plum-800 hover:bg-plum-50`}>
        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> Excel
      </button>
      <button type="button" onClick={exportPDF} className={`${btn} border-plum-950/15 text-plum-800 hover:bg-plum-50`}>
        <Printer className="h-4 w-4" aria-hidden="true" /> PDF / Print
      </button>
    </div>
  )
}
