"use client";

/**
 * Client Navigation — shared state for desktop + mobile app chrome
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

const NavigationContext = createContext();

export function NavigationProvider({ children, navigation, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    <NavigationContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        navigation,
        user,
        pathname,
        handleLogout,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks() {
  const { navigation, pathname } = useContext(NavigationContext);

  return (
    <div className="hidden sm:ml-8 sm:flex sm:items-center sm:gap-1">
      {navigation.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              active
                ? "bg-fktr-accent-soft text-fktr-accent"
                : "text-fktr-muted hover:bg-white hover:text-fktr-fg"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}

function NavigationButton() {
  const { isMenuOpen, setIsMenuOpen } = useContext(NavigationContext);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-fktr-muted hover:bg-fktr-accent-soft"
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
}

export function NavigationMenu() {
  const { isMenuOpen, setIsMenuOpen, navigation, pathname, handleLogout } =
    useContext(NavigationContext);

  if (!isMenuOpen) return null;

  return (
    <div className="sm:hidden border-t border-fktr-border bg-fktr-elevated">
      <div className="pt-2 pb-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-2.5 text-base font-medium ${
              isActive(pathname, item.href)
                ? "bg-fktr-accent-soft text-fktr-accent"
                : "text-fktr-muted hover:bg-fktr-bg"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2.5 text-base font-medium text-fktr-muted hover:bg-fktr-bg"
        >
          Odhlásit se
        </button>
      </div>
    </div>
  );
}

function NavigationLogout() {
  const { handleLogout } = useContext(NavigationContext);

  return (
    <div className="hidden sm:block">
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm text-fktr-muted hover:text-fktr-fg cursor-pointer transition-colors"
      >
        Odhlásit se
      </button>
    </div>
  );
}

export default function ClientNavigation() {
  return (
    <>
      <NavigationLogout />
      <NavigationButton />
    </>
  );
}
