"use client";

/**
 * Client Navigation Component
 *
 * Client-side interactive parts of navigation (mobile menu, logout)
 * Uses a wrapper component to share state between button and menu
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
      value={{ isMenuOpen, setIsMenuOpen, navigation, user, pathname, handleLogout }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

function NavigationButton() {
  const { isMenuOpen, setIsMenuOpen } = useContext(NavigationContext);

  return (
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
  );
}

export function NavigationMenu() {
  const { isMenuOpen, setIsMenuOpen, navigation, pathname, handleLogout } =
    useContext(NavigationContext);

  if (!isMenuOpen) return null;

  return (
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
  );
}

function NavigationLogout() {
  const { handleLogout } = useContext(NavigationContext);

  return (
    <div className="hidden sm:block">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
        >
          Odhlásit se
        </button>
      </div>
    </div>
  );
}

export default function ClientNavigation({ navigation, user }) {
  return (
    <>
      <NavigationLogout />
      <NavigationButton />
    </>
  );
}

