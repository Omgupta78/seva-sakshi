/** Placeholder for officer sections not yet built out — keeps sidebar navigation fully functional. */
export default function ComingSoon({ title, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-plum-950/15 bg-white/60 px-6 py-20 text-center">
      {Icon && <Icon className="mb-3 h-9 w-9 text-plum-950/30" aria-hidden="true" />}
      <h1 className="text-lg font-bold text-plum-950">{title}</h1>
      <p className="mt-1.5 max-w-sm text-sm text-plum-950/60">
        This section is on the roadmap and isn't built out yet. The Dashboard is fully live —
        use the sidebar to head back.
      </p>
    </div>
  )
}
