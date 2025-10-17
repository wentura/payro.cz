/**
 * Select Component
 *
 * Reusable select dropdown with label and error handling
 */

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error = "",
  disabled = false,
  placeholder = "Vyberte...",
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full px-3 py-2 border ${
          error ? "border-red-300" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base disabled:bg-gray-50 disabled:text-gray-500 bg-white text-gray-900`}
        {...props}
      >
        <option value="" className="text-gray-900 text-base">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
