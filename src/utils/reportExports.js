/**
 * Client-side export helpers for the Reports module. No external libraries:
 *   - CSV   → a real text/csv file the browser downloads.
 *   - Excel → an HTML table with an Excel MIME type; Excel opens it as a
 *             worksheet (the common no-dependency ".xls" approach).
 *   - PDF   → handled by the browser's Print dialog (Save as PDF); see the
 *             `.printable-report` print styles in index.css.
 *
 * `columns` is [{ key, label }]; `rows` is an array of objects.
 */

function cell(v) {
  return v === null || v === undefined ? '' : String(v)
}

/** Escape a value for CSV (quote if it contains a comma, quote, or newline). */
function csvEscape(v) {
  const s = cell(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(columns, rows) {
  const head = columns.map((c) => csvEscape(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => csvEscape(r[c.key])).join(',')).join('\n')
  return `${head}\n${body}`
}

function escapeHtml(v) {
  return cell(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Minimal HTML table that Excel opens as a worksheet. */
export function toExcelHTML(columns, rows, title = 'Report') {
  const head = columns.map((c) => `<th style="background:#161138;color:#fff;text-align:left;padding:6px">${escapeHtml(c.label)}</th>`).join('')
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td style="padding:6px;border:1px solid #ddd">${escapeHtml(r[c.key])}</td>`).join('')}</tr>`)
    .join('')
  return `<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><h3>${escapeHtml(title)}</h3><table border="1" cellspacing="0">${`<tr>${head}</tr>`}${body}</table></body></html>`
}

/** Trigger a browser download for generated content. */
export function download(filename, mime, content) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportCSV(columns, rows, base = 'report') {
  download(`${base}_${stamp()}.csv`, 'text/csv', toCSV(columns, rows))
}

export function exportExcel(columns, rows, base = 'report', title = 'Report') {
  download(`${base}_${stamp()}.xls`, 'application/vnd.ms-excel', toExcelHTML(columns, rows, title))
}

/** PDF via the browser print dialog (Save as PDF). */
export function exportPDF() {
  window.print()
}
