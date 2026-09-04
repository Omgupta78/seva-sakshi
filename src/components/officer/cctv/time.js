/** Shared time formatting for the CCTV views. */

export function formatDateTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return String(ts ?? '—')
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** Compact "how long ago" for heartbeats — e.g. "6s ago", "4h ago". */
export function timeAgo(ts) {
  const then = new Date(ts).getTime()
  if (Number.isNaN(then)) return '—'
  const sec = Math.max(0, (Date.now() - then) / 1000)
  if (sec < 60) return `${Math.round(sec)}s ago`
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`
  return `${Math.round(sec / 86400)}d ago`
}
