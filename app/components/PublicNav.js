"use client";

/**
 * Public Navigation — white / hairline swiss chrome
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const authenticatedRoutes = [
    "/dashboard",
    "/clients",
    "/invoices",
    "/settings",
  ];
  const isPrintPage = pathname?.includes("/print");

  if (
    authenticatedRoutes.some((route) => pathname?.startsWith(route)) ||
    isPrintPage
  ) {
    return null;
  }

  const linkClass =
    "text-fktr-muted hover:text-fktr-fg px-3 py-2 text-sm font-medium transition-colors";

  return (
    <nav className="sticky top-0 z-50 border-b border-fktr-border bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="font-display text-xl font-medium tracking-tight text-fktr-accent"
          >
            FKTR.cz
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/pricing" className={linkClass}>
              Ceník
            </Link>
            <Link href="/vseobecne-obchodni-podminky" className={linkClass}>
              VOP
            </Link>
            <Link href="/ochrana-osobnich-udaju" className={linkClass}>
              GDPR
            </Link>
            <Link href="/login" className={linkClass}>
              Přihlásit se
            </Link>
            <Link
              href="/register"
              className="ml-3 inline-flex items-center rounded-lg bg-fktr-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-fktr-accent-hover"
            >
              Začít zdarma
            </Link>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-fktr-muted hover:bg-fktr-accent-soft hover:text-fktr-fg transition-colors"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-fktr-border pb-4">
            <div className="pt-3 space-y-1">
              {[
                ["/pricing", "Ceník"],
                ["/vseobecne-obchodni-podminky", "VOP"],
                ["/ochrana-osobnich-udaju", "GDPR"],
                ["/login", "Přihlásit se"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-fktr-muted hover:bg-fktr-accent-soft hover:text-fktr-fg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/register"
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-fktr-accent hover:bg-fktr-accent-soft transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Začít zdarma
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
