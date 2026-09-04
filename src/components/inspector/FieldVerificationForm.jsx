import { ShieldCheck } from 'lucide-react'

function NumberField({ id, label, value, onChange, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-plum-950">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-12 w-full rounded-xl border border-plum-950/15 px-3 text-sm text-plum-950 focus:outline-none disabled:bg-plum-50/40"
      />
    </div>
  )
}

function TextField({ id, label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-plum-950">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-12 w-full rounded-xl border border-plum-950/15 px-3 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none disabled:bg-plum-50/40"
      />
    </div>
  )
}

function TextArea({ id, label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-plum-950">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-plum-950/15 px-3 py-2 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none disabled:bg-plum-50/40"
      />
    </div>
  )
}

/**
 * Optional staff/beneficiary verification notes.
 *
 * PRIVACY: this form deliberately collects counts, roles and
 * observations — never names, Aadhaar/ID numbers, contact details or
 * anything else that identifies an individual interviewee. An
 * inspection record does not need them, and a field device is the worst
 * possible place to hold them. The on-screen note tells inspectors the
 * same thing so it doesn't get typed into a free-text box anyway.
 */
export default function FieldVerificationForm({ value, onChange, onSave, saving, disabled }) {
  function set(field, next) {
    onChange({ ...value, [field]: next })
  }

  return (
    <section className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-plum-950">Staff / Beneficiary Verification</h2>
      <p className="mt-1 mb-3 text-xs text-plum-950/50">Optional — record what you verified, not who you spoke to.</p>

      <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-plum-50 p-2.5 text-[11px] leading-snug text-plum-950/70">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        Do not enter names, ID numbers, or contact details of staff or beneficiaries. Counts, roles and
        observations are sufficient for the inspection record.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="staff-count" label="Staff interviewed" value={value.staffInterviewed} onChange={(v) => set('staffInterviewed', v)} disabled={disabled} />
          <NumberField id="beneficiary-count" label="Beneficiaries interviewed" value={value.beneficiariesInterviewed} onChange={(v) => set('beneficiariesInterviewed', v)} disabled={disabled} />
        </div>
        <TextField id="staff-roles" label="Staff roles present" placeholder="e.g. Warden, Cook, Teacher" value={value.staffRoles} onChange={(v) => set('staffRoles', v)} disabled={disabled} />
        <TextField id="beneficiary-group" label="Beneficiary group" placeholder="e.g. Class 8–10 residents" value={value.beneficiaryGroup} onChange={(v) => set('beneficiaryGroup', v)} disabled={disabled} />
        <TextArea id="observation" label="Observation" placeholder="What did you observe on site?" value={value.observation} onChange={(v) => set('observation', v)} disabled={disabled} />
        <TextArea id="comments" label="Comments" placeholder="Anything else to flag for the reviewing officer" value={value.comments} onChange={(v) => set('comments', v)} disabled={disabled} />
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="mt-4 min-h-12 w-full rounded-xl border-2 border-plum-800 text-sm font-bold text-plum-800 active:bg-plum-50 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Verification Notes'}
        </button>
      )}
    </section>
  )
}
