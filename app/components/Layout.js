"use client";

/**
 * Layout Component
 *
 * Main application layout with navigation and sidebar
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Layout({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Faktury", href: "/invoices", icon: "🧾" },
    { name: "Klienti", href: "/clients", icon: "👥" },
    { name: "Nastavení", href: "/settings", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/dashboard"
                  className="text-2xl font-bold text-blue-600"
                >
                  Payro.cz
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname.startsWith(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="hidden sm:block">
                <div className="flex items-center space-x-4">
                  {user && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{user.name}</span>
                      {user.company_id && (
                        <span className="text-gray-500">
                          {" "}
                          • IČO: {user.company_id}
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Odhlásit se
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
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
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 text-base font-medium ${
                    pathname.startsWith(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Odhlásit se
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            {user && (
              <div className="mb-2">
                Přihlášen jako:{" "}
                <span className="font-medium text-gray-700">
                  {user.contact_email}
                </span>
                {user.company_id && <span> • IČO: {user.company_id}</span>}
              </div>
            )}
            <div>© 2025 Payro.cz • Fakturační systém</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
