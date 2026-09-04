import { ShieldCheck } from 'lucide-react'

/**
 * Consent + privacy messaging shown before any biometric capture. Explains
 * what is collected, how it is protected, retention, and the right to
 * withdrawal/deletion — and gates enrolment behind an explicit consent tick.
 */
export default function ConsentNotice({ checked, onChange, retentionDays = 180 }) {
  return (
    <div className="rounded-2xl border border-plum-800/20 bg-plum-50/60 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950">
        <ShieldCheck className="h-4 w-4 text-plum-800" aria-hidden="true" /> Consent &amp; privacy
      </div>
      <ul className="space-y-1 text-xs text-plum-950/70">
        <li>• A face template (a mathematical embedding) is generated for verification. Photos of the face are not stored as images.</li>
        <li>• The template is held securely and is never shown, downloaded, or placed in browser storage.</li>
        <li>• It is used only to assist attendance verification during authorised monitoring — it does not make the final decision.</li>
        <li>• Retention is limited (currently {retentionDays} days) and the enrolment can be deactivated or deleted at any time on request.</li>
      </ul>
      <label className="mt-3 flex items-start gap-2 text-sm text-plum-950">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-plum-950/30 accent-plum-800"
        />
        <span>Explicit consent has been obtained from the beneficiary (or guardian, where applicable) for biometric enrolment.</span>
      </label>
    </div>
  )
}
