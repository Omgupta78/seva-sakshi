import SeverityChip from './SeverityChip.jsx'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'

export default function AnomalyAlertsPanel({ alerts }) {
  const { t } = useDashboardLang()

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-plum-950 sm:text-base">{t('anomalyAlertsTitle')}</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 text-xs text-plum-950/50 uppercase">
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colInstitute')}
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colType')}
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {t('colSeverity')}
              </th>
              <th scope="col" className="py-2 font-semibold">
                {t('colDetected')}
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((row) => (
              <tr key={row.id} className="border-b border-plum-950/5 last:border-0">
                <td className="py-2.5 pr-3 font-medium text-plum-950">{row.institute}</td>
                <td className="py-2.5 pr-3 text-plum-950/75">{row.type}</td>
                <td className="py-2.5 pr-3">
                  <SeverityChip severity={row.severity} />
                </td>
                <td className="py-2.5 text-plum-950/60">{row.detectedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
