import { useId } from 'react'
import { Building } from 'lucide-react'

export const DEPARTMENTS = [
  'Revenue Department',
  'Education Department',
  'Health Department',
  'Public Works Department',
  'Home Department',
  'Information Technology Department',
]

/**
 * Department dropdown — a plain, fully keyboard-accessible native <select>
 * styled to match the rest of the form.
 */
export default function DepartmentSelect({ label = 'Department', error, id, ...selectProps }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-navy-950">
        {label}
      </label>
      <div className="relative">
        <Building
          className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-navy-900/40"
          aria-hidden="true"
          strokeWidth={2}
        />
        <select
          id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={[
            'w-full appearance-none rounded-lg border bg-white py-2.5 pr-9 pl-10 text-sm text-navy-950',
            'focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20 focus:outline-none',
            error ? 'border-error-600' : 'border-navy-900/15',
          ].join(' ')}
          {...selectProps}
        >
          <option value="" disabled>
            Select Department
          </option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {/* Custom chevron (native selects can't be fully restyled) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-navy-900/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-error-600">
          {error}
        </p>
      )}
    </div>
  )
}
