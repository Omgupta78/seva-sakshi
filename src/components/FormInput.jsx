import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Reusable labeled text input with an optional leading icon,
 * optional password show/hide toggle, and an accessible error message.
 */
export default function FormInput({
  label,
  icon: Icon,
  error,
  type = 'text',
  isPassword = false,
  id,
  ...inputProps
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const [showPassword, setShowPassword] = useState(false)

  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-950">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-navy-900/40"
            aria-hidden="true"
            strokeWidth={2}
          />
        )}
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={[
            'w-full rounded-lg border bg-white py-2.5 text-sm text-navy-950 placeholder:text-navy-950/35',
            'focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20 focus:outline-none',
            Icon ? 'pl-10' : 'pl-3.5',
            isPassword ? 'pr-10' : 'pr-3.5',
            error ? 'border-error-600' : 'border-navy-900/15',
          ].join(' ')}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-navy-900/50 hover:text-navy-900"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Eye className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-error-600">
          {error}
        </p>
      )}
    </div>
  )
}
