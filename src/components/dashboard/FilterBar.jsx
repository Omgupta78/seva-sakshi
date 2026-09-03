import { UserPlus, Video } from 'lucide-react'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'
import { DISTRICTS, SCHEMES } from '../../data/dashboardSampleData.js'

export default function FilterBar({ district, scheme, onDistrictChange, onSchemeChange, onAssignInspection, onStartVc }) {
  const { t } = useDashboardLang()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-plum-950/70">{t('filterDistrict')}</span>
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="rounded-lg border border-plum-950/15 bg-white px-3 py-1.5 text-sm text-plum-950 focus:outline-none"
          >
            <option value="all">{t('allDistricts')}</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-plum-950/70">{t('filterScheme')}</span>
          <select
            value={scheme}
            onChange={(e) => onSchemeChange(e.target.value)}
            className="max-w-[220px] rounded-lg border border-plum-950/15 bg-white px-3 py-1.5 text-sm text-plum-950 focus:outline-none sm:max-w-none"
          >
            <option value="all">{t('allSchemes')}</option>
            {SCHEMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAssignInspection}
          className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a91f24]"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {t('assignInspection')}
        </button>
        <button
          type="button"
          onClick={onStartVc}
          className="flex items-center gap-1.5 rounded-lg border-2 border-plum-800 px-3.5 py-2 text-sm font-semibold text-plum-800 transition-colors hover:bg-plum-50"
        >
          <Video className="h-4 w-4" aria-hidden="true" />
          {t('startSurpriseVc')}
        </button>
      </div>
    </div>
  )
}
