/**
 * Textarea Component
 *
 * Reusable textarea with label and error handling
 */

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  disabled = false,
  rows = 3,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-fktr-muted mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`block w-full px-3 py-2 border ${
          error ? "border-red-300" : "border-fktr-border"
        } rounded-lg shadow-none placeholder-fktr-muted/60 focus:outline-none focus:ring-2 focus:ring-fktr-accent/20 focus:border-fktr-accent text-base disabled:bg-fktr-bg disabled:text-fktr-muted bg-white text-fktr-fg`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
