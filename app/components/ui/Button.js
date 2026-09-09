/**
 * Button — swiss-flat radius, light focus
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors";

  const variantClasses = {
    primary:
      "bg-fktr-accent text-white hover:bg-fktr-accent-hover focus-visible:ring-fktr-accent disabled:bg-teal-300",
    secondary:
      "bg-fktr-accent-soft text-fktr-fg hover:bg-teal-50 focus-visible:ring-fktr-accent disabled:opacity-50 border border-fktr-border",
    danger:
      "bg-fktr-danger text-white hover:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-300",
    success:
      "bg-fktr-success text-white hover:bg-green-800 focus-visible:ring-green-600 disabled:bg-green-300",
    outline:
      "border border-fktr-accent text-fktr-accent hover:bg-fktr-accent-soft focus-visible:ring-fktr-accent disabled:border-teal-300 disabled:text-teal-300",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm sm:text-base",
    lg: "px-6 py-3 text-base",
  };

  const disabledClasses = disabled
    ? "cursor-not-allowed opacity-60"
    : "cursor-pointer";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
