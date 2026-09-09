/**
 * Badge Component
 */

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variantClasses = {
    default: "bg-stone-100 text-fktr-muted",
    draft: "bg-stone-100 text-fktr-muted",
    sent: "bg-teal-50 text-fktr-accent",
    paid: "bg-green-50 text-fktr-success",
    canceled: "bg-red-50 text-fktr-danger",
    overdue: "bg-orange-50 text-fktr-warning",
    partial_paid: "bg-amber-50 text-amber-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
