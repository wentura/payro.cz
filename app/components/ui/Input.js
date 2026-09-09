/**
 * Input Component
 *
 * Reusable input field with label and error handling
 */

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  disabled = false,
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
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`block w-full px-3 py-2 border ${
          error ? "border-red-300" : "border-fktr-border"
        } rounded-lg bg-white shadow-none placeholder-fktr-muted/60 focus:outline-none focus:ring-2 focus:ring-fktr-accent/20 focus:border-fktr-accent text-base disabled:bg-fktr-bg disabled:text-fktr-muted`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
