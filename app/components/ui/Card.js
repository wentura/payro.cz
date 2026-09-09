/**
 * Card — hairline, minimal shadow
 */

export default function Card({ children, className = "", title, action }) {
  return (
    <div
      className={`bg-fktr-elevated rounded-lg border border-fktr-border overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-fktr-border flex justify-between items-center gap-3">
          {title && (
            <h3 className="text-base font-medium text-fktr-fg text-left tracking-tight">
              {title}
            </h3>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="py-5 px-4 sm:px-5 text-sm text-center">{children}</div>
    </div>
  );
}
