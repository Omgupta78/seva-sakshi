const STATUS_STYLES = {
  'On Site': 'bg-green-50 text-[#16794f] border-[#138808]/25',
  'En Route': 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  'Report Pending': 'bg-plum-50 text-plum-800 border-plum-800/20',
}

/** Small pill used for inspection status in the Ongoing Inspections table. */
export default function StatusChip({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-300'}`}
    >
      {status}
    </span>
  )
}
