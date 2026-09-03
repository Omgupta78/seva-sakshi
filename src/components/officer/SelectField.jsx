import { useId } from 'react'

/** Labeled <select> with an error message, styled for the officer module's forms. */
export default function SelectField({ label, error, id, options, placeholder, ...selectProps }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-plum-950">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none ${
          error ? 'border-[#D6262B]' : 'border-plum-950/15'
        }`}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-[#D6262B]">
          {error}
        </p>
      )}
    </div>
  )
}
