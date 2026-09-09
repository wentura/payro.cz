/**
 * App Layout — top nav, mint chrome (no sidebar)
 */

"use client";

import Link from "next/link";
import Footer from "./Footer";
import ClientNavigation, {
  NavigationProvider,
  NavigationMenu,
  DesktopNavLinks,
} from "./ClientNavigation";

export default function Layout({
  children,
  user,
  isAdmin = false,
  className = "flex-grow flex flex-col",
}) {
  const navigation = [
    { name: "Přehled", href: "/dashboard" },
    { name: "Faktury", href: "/invoices" },
    { name: "Klienti", href: "/clients" },
    { name: "Nastavení", href: "/settings" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return (
    <NavigationProvider navigation={navigation} user={user}>
      <div className={`${className} bg-fktr-bg w-full`}>
        <nav className="border-b border-fktr-border bg-white/95 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex min-w-0">
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    href="/dashboard"
                    className="font-display text-xl font-medium tracking-tight text-fktr-accent"
                  >
                    FKTR.cz
                  </Link>
                </div>
                <DesktopNavLinks />
              </div>

              <div className="flex items-center">
                <ClientNavigation />
              </div>
            </div>
          </div>
          <NavigationMenu />
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
          {children}
        </main>
        <Footer user={user ? user : null} />
      </div>
    </NavigationProvider>
  );
}
