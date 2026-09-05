import { ChevronDown } from 'lucide-react'
import { useHeroBackgroundRotation } from '../../hooks/useHeroBackgroundRotation.js'
import EmblemMark from '../EmblemMark.jsx'

/**
 * Compact landing hero. It establishes the Seva Sakshi government identity and
 * hands off immediately to the portal selector below — the hero is intentionally
 * short so the three portal cards sit within the first viewport on a laptop.
 * The old in-hero search + quick-access controls moved to a secondary strip
 * (QuickExplore) lower on the page so they no longer compete with the main CTA.
 */
export default function Hero({ hcMode }) {
  const { layers, fadeDuration } = useHeroBackgroundRotation()

  return (
    <header className="relative isolate flex min-h-[42vh] items-center justify-center overflow-hidden px-5 py-12 sm:py-14">
      {layers.map((layer, i) => (
        <div
          key={i}
          aria-hidden={i !== 0}
          role={i === 0 ? 'img' : undefined}
          aria-label={i === 0 ? layer.entry.alt : undefined}
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: `url('${layer.entry.url}')`,
            opacity: layer.active ? 1 : 0,
            transition: `opacity ${fadeDuration} ease-in-out`,
          }}
        />
      ))}

      {/* Dark indigo -> purple gradient kept on top of every rotating image so text always stays legible */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: hcMode
            ? 'linear-gradient(180deg, rgba(10,18,58,0.96) 0%, rgba(20,12,46,0.95) 55%, rgba(38,12,58,0.97) 100%)'
            : 'linear-gradient(180deg, rgba(30,58,138,0.9) 0%, rgba(45,27,90,0.9) 55%, rgba(88,28,135,0.9) 100%)',
        }}
      />

      <div className="relative w-full max-w-3xl text-center text-white">
        <EmblemMark className="mx-auto mb-2 h-13 w-auto drop-shadow-lg sm:h-14" />
        <p className="mb-3 text-[0.7rem] tracking-[0.16em] text-[#f3d489]" lang="hi">
          सत्यमेव जयते
        </p>

        <div className="flex flex-wrap items-start justify-center gap-2">
          <h1 className="text-[2rem] leading-none font-extrabold tracking-tight sm:text-[2.7rem] lg:text-[3.1rem]">
            Seva Sakshi
          </h1>
          <span className="mt-1 -translate-y-1 rounded-sm bg-amber-500 px-2 py-0.5 text-[0.58rem] font-extrabold tracking-widest text-indigo-900 uppercase shadow">
            BETA
          </span>
        </div>
        <p className="mt-1 text-[1.05rem] font-medium text-white/70" lang="hi">
          (सेवा साक्षी)
        </p>

        <div className="mx-auto my-3.5 flex h-1 w-[104px] overflow-hidden rounded-full shadow" aria-hidden="true">
          <span className="flex-1 bg-[#FF9933]" />
          <span className="flex-1 bg-white/90" />
          <span className="flex-1 bg-[#138808]" />
        </div>

        <p className="text-[0.82rem] font-bold tracking-[0.14em] text-[#dce1ff] uppercase sm:text-[0.9rem]">
          DoSJE Monitoring Platform
        </p>
        <p className="mx-auto mt-2 max-w-xl text-[0.92rem] leading-relaxed text-white/80 sm:text-[0.98rem]">
          Real-time monitoring, inspection and accountability for social welfare institutions.
        </p>

        <a
          href="#portal-heading"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-[0.8rem] font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Choose your portal
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </header>
  )
}
