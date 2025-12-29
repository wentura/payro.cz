/**
 * Layout Component
 *
 * Main application layout with navigation and sidebar
 * Client component wrapper that uses NavigationProvider for shared state
 */

"use client";

import Link from "next/link";
import Footer from "./Footer";
import ClientNavigation, { NavigationProvider, NavigationMenu } from "./ClientNavigation";

export default function Layout({
  children,
  user,
  isAdmin = false,
  className = "flex-grow flex flex-col",
}) {
  const navigation = [
    { name: "Přehled", href: "/dashboard", icon: "📊" },
    { name: "Faktury", href: "/invoices", icon: "🧾" },
    { name: "Klienti", href: "/clients", icon: "👥" },
    { name: "Nastavení", href: "/settings", icon: "⚙️" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: "🔧" }] : []),
  ];

  return (
    <NavigationProvider navigation={navigation} user={user}>
      <div className={`${className} bg-gray-50 w-full`}>
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
                    FKTR.cz
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <ClientNavigation navigation={navigation} user={user} />
              </div>
            </div>
          </div>
          <NavigationMenu />
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
        <Footer user={user ? user : null} />
      </div>
    </NavigationProvider>
  );
}
