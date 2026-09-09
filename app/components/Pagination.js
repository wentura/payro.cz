import Link from "next/link";

export default function Pagination({ page, pageSize, total, makeHref }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 border-t border-fktr-border"
      aria-label="Stránkování"
    >
      <p className="text-sm text-fktr-muted">
        Stránka {page} z {totalPages}
      </p>
      <div className="flex gap-3">
        {page > 1 ? (
          <Link
            href={makeHref(prevPage)}
            className="text-sm font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Předchozí
          </Link>
        ) : (
          <span className="text-sm text-fktr-muted/50">Předchozí</span>
        )}
        {page < totalPages ? (
          <Link
            href={makeHref(nextPage)}
            className="text-sm font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Další
          </Link>
        ) : (
          <span className="text-sm text-fktr-muted/50">Další</span>
        )}
      </div>
    </nav>
  );
}
