import { Search, ArrowRight, Video, ClipboardList, LayoutGrid, CalendarCheck, AlertTriangle } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'

const QUICK_ACCESS = [
  { key: 'pillCctv', icon: Video },
  { key: 'pillReports', icon: ClipboardList },
  { key: 'pillDashboard', icon: LayoutGrid },
  { key: 'pillSchedule', icon: CalendarCheck },
  { key: 'pillAlerts', icon: AlertTriangle },
]

/**
 * Secondary "explore" strip. The public search and quick-access shortcuts used
 * to sit inside the hero, where they competed with the portal selector. They now
 * live here, below the mission, as a muted helper band — present for anyone who
 * wants to browse, but never the main call to action.
 */
export default function QuickExplore() {
  const { t } = useLang()

  return (
    <section aria-labelledby="explore-heading" className="mx-auto w-full max-w-[1200px] px-4 pt-4 pb-14 sm:px-6">
      <div className="rounded-2xl border border-indigo-950/10 bg-white/70 p-6 sm:p-7">
        <p id="explore-heading" className="text-xs font-bold tracking-[0.16em] text-indigo-950/50 uppercase">
          {t('quickAccessLabel')}
        </p>

        <form
          className="mt-3 flex flex-col items-stretch gap-1 rounded-2xl border border-indigo-950/10 bg-white p-1.5 shadow-sm sm:flex-row sm:rounded-full"
          role="search"
          aria-label="Site search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="categorySelect" className="sr-only">Category</label>
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
          <div className="flex min-w-0 items-center rounded-lg px-3.5 sm:flex-1 sm:rounded-none">
            <Search className="mr-2 h-4.5 w-4.5 shrink-0 text-[#757682]" aria-hidden="true" />
            <label htmlFor="siteSearch" className="sr-only">Search projects, institutes, inspections</label>
            <input
              id="siteSearch"
              type="search"
              placeholder={t('searchPlaceholder')}
              className="min-w-0 flex-1 border-none bg-transparent py-2 text-[0.95rem] text-indigo-950 outline-none placeholder:text-[#8f8fa3] sm:py-2.5"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-900 px-6 py-2.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-indigo-800 active:scale-[0.97] sm:w-auto sm:rounded-full sm:py-0"
          >
            {t('searchBtn')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <nav aria-label="Quick access" className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACCESS.map(({ key, icon: Icon }) => (
            <a
              key={key}
              href="#"
              className="flex items-center gap-1.5 rounded-full border border-indigo-950/12 bg-white px-3.5 py-1.5 text-[0.82rem] font-semibold text-indigo-950/70 no-underline transition-colors hover:border-teal-700/40 hover:text-teal-700"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t(key)}
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
