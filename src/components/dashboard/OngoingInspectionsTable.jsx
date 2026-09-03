import StatusChip from './StatusChip.jsx'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'

export default function OngoingInspectionsTable({ inspections }) {
  const { t } = useDashboardLang()

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-plum-950 sm:text-base">{t('ongoingInspectionsTitle')}</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 text-xs text-plum-950/50 uppercase">
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colInstitute')}
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colInspector')}
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colStatus')}
              </th>
              <th scope="col" className="py-2 font-semibold">
                {t('colLocation')}
              </th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((row) => (
              <tr key={row.id} className="border-b border-plum-950/5 last:border-0">
                <td className="py-2.5 pr-3 font-medium text-plum-950">{row.institute}</td>
                <td className="py-2.5 pr-3 text-plum-950/75">{row.inspector}</td>
                <td className="py-2.5 pr-3">
                  <StatusChip status={row.status} />
                </td>
                <td className="py-2.5">
                  {row.liveLocation ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#16794f]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16794f] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16794f]" />
                      </span>
                      Live
                    </span>
                  ) : (
                    <span className="text-xs text-plum-950/40">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
