import BarChart from '../BarChart.jsx'
import SeverityChip from '../../dashboard/SeverityChip.jsx'
import ProjectLocationMap from './ProjectLocationMap.jsx'
import { CctvStatusBadge, ComplianceBadge } from '../table/Badges.jsx'

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-plum-950/50 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-plum-950">{value}</dd>
    </div>
  )
}

export function OverviewTab({ project }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div>
          <h3 className="mb-2 text-sm font-bold text-plum-950">Project Overview</h3>
          <p className="text-sm text-plum-950/70">
            {project.name} is a {project.projectType.toLowerCase()} project under the {project.schemeName}, implemented by{' '}
            {project.organizationName} in {project.district}, {project.state}.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Implementing Organization" value={project.organizationName} />
          <Field label="Location" value={`${project.district}, ${project.state}`} />
          <Field label="Scheme" value={project.schemeName} />
          <Field label="Beneficiary Count" value={project.beneficiaryCount} />
          <Field label="Staff Count" value={project.staffCount} />
          <Field label="Attendance %" value={`${project.attendancePercentage}%`} />
          <Field label="Last Inspection" value={project.lastInspection} />
          <Field label="Next Inspection" value={project.nextInspection} />
          <Field label="Contact" value={`${project.contactPerson || '—'} · ${project.contactPhone || '—'}`} />
        </dl>

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold text-plum-950/50 uppercase">CCTV Status</p>
            <CctvStatusBadge status={project.cctvStatus} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-plum-950/50 uppercase">Compliance Status</p>
            <ComplianceBadge status={project.complianceStatus} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-plum-950">Location</h3>
        <ProjectLocationMap project={project} />
      </div>
    </div>
  )
}

export function BeneficiariesTab({ project }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[360px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Name</th>
            <th className="px-3 py-2.5 font-semibold">Age</th>
          </tr>
        </thead>
        <tbody>
          {project.beneficiaries.map((b) => (
            <tr key={b.id} className="border-b border-plum-950/5 last:border-0">
              <td className="px-3 py-2.5 font-medium text-plum-950">{b.name}</td>
              <td className="px-3 py-2.5 text-plum-950/70">{b.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-plum-950/10 px-3 py-2 text-xs text-plum-950/50">
        Showing a sample of {project.beneficiaries.length} beneficiaries out of {project.beneficiaryCount} total (Demo Data).
      </p>
    </div>
  )
}

export function StaffTab({ project }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Name</th>
            <th className="px-3 py-2.5 font-semibold">Role</th>
            <th className="px-3 py-2.5 font-semibold">Phone</th>
          </tr>
        </thead>
        <tbody>
          {project.staff.map((s) => (
            <tr key={s.id} className="border-b border-plum-950/5 last:border-0">
              <td className="px-3 py-2.5 font-medium text-plum-950">{s.name}</td>
              <td className="px-3 py-2.5 text-plum-950/70">{s.role}</td>
              <td className="px-3 py-2.5 text-plum-950/70">{s.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AttendanceTab({ project }) {
  const chartData = project.attendanceWeek.map((d) => ({
    label: d.day,
    value: d.percentage,
    color: d.percentage >= 85 ? '#138808' : d.percentage >= 70 ? '#e2a610' : '#D6262B',
  }))
  return (
    <div>
      <p className="mb-3 text-sm text-plum-950/60">
        Overall attendance: <span className="font-bold text-plum-950">{project.attendancePercentage}%</span>
      </p>
      <BarChart data={chartData} />
    </div>
  )
}

export function CctvTab({ project }) {
  return (
    <div className="max-w-sm rounded-xl border border-plum-950/10 p-4">
      <p className="mb-1 text-xs font-semibold text-plum-950/50 uppercase">CCTV Status</p>
      <CctvStatusBadge status={project.cctvStatus} />
      <p className="mt-3 text-sm text-plum-950/70">
        {project.cctvStatus === 'online' && 'All monitored cameras at this project are online and streaming.'}
        {project.cctvStatus === 'partial' && 'Some cameras at this project are currently unreachable — a technician visit may be needed.'}
        {project.cctvStatus === 'offline' && 'CCTV feed for this project is currently offline. This has been flagged for review.'}
      </p>
    </div>
  )
}

export function InspectionsTab({ project }) {
  return (
    <div>
      <div className="mb-3 flex gap-6 text-sm">
        <span>
          Last: <span className="font-semibold text-plum-950">{project.lastInspection}</span>
        </span>
        <span>
          Next: <span className="font-semibold text-plum-950">{project.nextInspection}</span>
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-plum-950/10">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Date</th>
              <th className="px-3 py-2.5 font-semibold">Inspector</th>
              <th className="px-3 py-2.5 font-semibold">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {project.inspectionHistory.map((h) => (
              <tr key={h.id} className="border-b border-plum-950/5 last:border-0">
                <td className="px-3 py-2.5 text-plum-950/85">{h.date}</td>
                <td className="px-3 py-2.5 font-medium text-plum-950">{h.inspector}</td>
                <td className="px-3 py-2.5 text-plum-950/70">{h.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DocumentsTab({ project }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Document</th>
            <th className="px-3 py-2.5 font-semibold">Uploaded</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {project.documents.map((d) => (
            <tr key={d.id} className="border-b border-plum-950/5 last:border-0">
              <td className="px-3 py-2.5 font-medium text-plum-950">{d.name}</td>
              <td className="px-3 py-2.5 text-plum-950/70">{d.uploadedOn}</td>
              <td className="px-3 py-2.5 text-plum-950/70 capitalize">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function IssuesTab({ project }) {
  if (project.issues.length === 0) {
    return <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No open issues for this project.</p>
  }
  return (
    <ul className="space-y-2.5">
      {project.issues.map((issue) => (
        <li key={issue.id} className="rounded-xl border border-plum-950/10 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityChip severity={issue.severity} />
            <span className="text-sm font-semibold text-plum-950">{issue.title}</span>
          </div>
          <p className="mt-1 text-xs text-plum-950/50">
            Raised {issue.raisedOn} · <span className="capitalize">{issue.status}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}
