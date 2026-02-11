"use client";

/**
 * Public Navigation Component
 *
 * Header navigation for public pages (home, login, register)
 * Mobile-friendly with hamburger menu
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show nav on authenticated pages (they have their own Layout)
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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FKTR.cz
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/vseobecne-obchodni-podminky"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              VOP
            </Link>
            <Link
              href="/ochrana-osobnich-udaju"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              GDPR
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Ceník
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Přihlásit se
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Začít zdarma
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-3">
            <div className="pt-2 space-y-1">
              <Link
                href="/pricing"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ceník
              </Link>
              <Link
                href="/vseobecne-obchodni-podminky"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                VOP
              </Link>
              <Link
                href="/ochrana-osobnich-udaju"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                GDPR
              </Link>
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Přihlásit se
              </Link>
              <Link
                href="/register"
                className="block px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
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
