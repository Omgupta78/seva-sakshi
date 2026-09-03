import { useId } from 'react'

/** Labeled text input for the officer module's forms (plum-themed sibling of components/FormInput.jsx, which is navy-themed for the Login page). */
export default function TextField({ label, error, id, ...inputProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-plum-950">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none ${
          error ? 'border-[#D6262B]' : 'border-plum-950/15'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-[#D6262B]">
          {error}
        </p>
      )}
    </div>
  )
}
