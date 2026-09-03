import { Search, ArrowRight, Video, ClipboardList, LayoutGrid, CalendarCheck, AlertTriangle } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'
import { useHeroBackgroundRotation } from '../../hooks/useHeroBackgroundRotation.js'
import EmblemMark from '../EmblemMark.jsx'

const QUICK_ACCESS = [
  { key: 'pillCctv', icon: Video },
  { key: 'pillReports', icon: ClipboardList },
  { key: 'pillDashboard', icon: LayoutGrid },
  { key: 'pillSchedule', icon: CalendarCheck },
  { key: 'pillAlerts', icon: AlertTriangle },
]

export default function Hero({ hcMode }) {
  const { t } = useLang()
  const { layers, fadeDuration } = useHeroBackgroundRotation()

  return (
    <header className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden px-5 py-16">
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
            : 'linear-gradient(180deg, rgba(30,58,138,0.88) 0%, rgba(45,27,90,0.87) 55%, rgba(88,28,135,0.88) 100%)',
        }}
      />

      <div className="relative w-full max-w-3xl text-center text-white">
        <EmblemMark className="mx-auto mb-2 h-16 w-auto drop-shadow-lg" />
        <p className="mb-7 text-[0.8rem] tracking-[0.14em] text-[#f3d489]" lang="hi">
          सत्यमेव जयते
        </p>

        <div className="flex flex-wrap items-start justify-center gap-2">
          <h1 className="text-[2.2rem] leading-none font-extrabold tracking-tight sm:text-[3rem] lg:text-[3.6rem]">
            Seva Sakshi
          </h1>
          <span className="mt-1.5 -translate-y-1.5 rounded-sm bg-amber-500 px-2 py-0.5 text-[0.6rem] font-extrabold tracking-widest text-indigo-900 uppercase shadow">
            BETA
          </span>
        </div>
        <p className="mt-1 text-[1.15rem] font-medium text-white/75" lang="hi">
          (सेवा साक्षी)
        </p>

        <div className="mx-auto my-4 flex h-1 w-[110px] overflow-hidden rounded-full shadow" aria-hidden="true">
          <span className="flex-1 bg-[#FF9933]" />
          <span className="flex-1 bg-[#138808]" />
        </div>

        <p className="mb-1 text-[1.05rem] font-semibold text-[#dce1ff] sm:text-[1.25rem]">{t('subtitle')}</p>
        <p className="mb-8 text-[0.95rem] text-white/80 italic" lang="hi">
          सेवा साक्षी — Eyes on Welfare, Trust in Governance
        </p>

        <form
          className="mx-auto flex max-w-[660px] flex-col items-stretch gap-1 rounded-2xl bg-white p-2 shadow-[0_20px_45px_-16px_rgba(20,19,74,0.42)] sm:flex-row sm:gap-0.5 sm:rounded-full sm:p-1"
          role="search"
          aria-label="Site search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="categorySelect" className="sr-only">
            Category
          </label>
          <select
            id="categorySelect"
            defaultValue="all"
            className="w-full rounded-lg border border-[#c5c5d3] bg-transparent px-4 py-2.5 text-[0.85rem] font-semibold text-[#444651] focus:outline-none sm:w-auto sm:max-w-[9.5rem] sm:rounded-l-full sm:rounded-r-none sm:border-y-0 sm:border-l-0 sm:border-r sm:pr-6"
          >
            <option value="all">{t('categoryAll')}</option>
            <option value="institutes">{t('categoryInstitutes')}</option>
            <option value="inspections">{t('categoryInspections')}</option>
            <option value="projects">{t('categoryProjects')}</option>
          </select>
          <div className="flex min-w-0 items-center rounded-lg border border-[#c5c5d3] px-3.5 sm:flex-1 sm:rounded-none sm:border-none">
            <Search className="mr-2 h-4.5 w-4.5 shrink-0 text-[#757682]" aria-hidden="true" />
            <label htmlFor="siteSearch" className="sr-only">
              Search projects, institutes, inspections
            </label>
            <input
              id="siteSearch"
              type="search"
              placeholder={t('searchPlaceholder')}
              className="min-w-0 flex-1 border-none bg-transparent py-2 text-[0.95rem] text-indigo-950 outline-none placeholder:text-[#8f8fa3] sm:py-2.5"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#D6262B] px-6 py-2.5 text-[0.92rem] font-bold text-white transition-colors hover:bg-[#a91f24] active:scale-[0.97] sm:w-auto sm:rounded-full sm:py-0"
          >
            {t('searchBtn')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-8">
          <span className="mb-3.5 block text-[0.82rem] font-bold tracking-[0.1em] text-white/65 uppercase">
            {t('quickAccessLabel')}
          </span>
          <nav aria-label="Quick access" className="flex flex-wrap justify-center gap-2.5">
            {QUICK_ACCESS.map(({ key, icon: Icon }) => (
              <a
                key={key}
                href="#"
                className="flex items-center gap-1.5 rounded-full border-[1.5px] border-white/50 bg-white/5 px-4.5 py-2 text-[0.85rem] font-semibold text-white no-underline backdrop-blur-sm transition-all hover:-translate-y-px hover:border-white hover:bg-white/15"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(key)}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
