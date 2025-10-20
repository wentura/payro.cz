import Link from "next/link";
import React from "react";

export default function Footer({ user = null }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 text-center mb-12">
          <div>
            <Link
              href="/"
              className="text-blue-600 text-2xl font-bold hidden md:block"
            >
              FKTR.cz
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/vseobecne-obchodni-podminky">VOP</Link>
            <Link href="/ochrana-osobnich-udaju">GDPR</Link>
            <Link href="/pricing">Ceník</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/login">Přihlásit se</Link>
            <Link href="/register">Registrace</Link>
          </div>
        </div>
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
          <div>© 2025 FKTR.cz • Fakturační systém</div>
        </div>
      </div>
    </footer>
  );
}
