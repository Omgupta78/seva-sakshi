import { ShieldCheck } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'

export default function MissionCard() {
  const { t } = useLang()

  return (
    <section className="relative z-10 mx-auto -mt-16 max-w-4xl px-5" aria-labelledby="mission-heading">
      <h2 className="sr-only" id="mission-heading">
        Mission Statement
      </h2>
      <div className="relative flex items-start gap-6 overflow-hidden rounded-3xl border border-[#c5c5d3] bg-white p-9 shadow-[0_14px_36px_rgba(20,19,74,0.2)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,35,111,0.07), transparent 70%)' }}
        />
        <div className="relative z-10 flex h-15 w-15 shrink-0 items-center justify-center rounded-full bg-indigo-800">
          <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div className="relative z-10">
          <blockquote className="text-[1.05rem] leading-relaxed font-semibold text-[#1a1b21] sm:text-[1.3rem]">
            {t('missionQuote')}
          </blockquote>
          <p className="mt-3.5 flex items-center gap-2.5 text-[0.78rem] font-bold tracking-[0.08em] text-[#444651] uppercase">
            <span className="h-px w-5.5 bg-[#c5c5d3]" />
            {t('missionAttribution')}
          </p>
        </div>
      </div>
    </section>
  )
}
