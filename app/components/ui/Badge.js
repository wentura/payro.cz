/**
 * Badge Component
 *
 * Status badge for displaying invoice statuses and other labels
 */

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    overdue: "bg-orange-100 text-orange-800",
    partial_paid: "bg-yellow-100 text-yellow-800",
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
