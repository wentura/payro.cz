/**
 * Card Component
 *
 * Container component for content sections
 */

export default function Card({ children, className = "", title, action }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
