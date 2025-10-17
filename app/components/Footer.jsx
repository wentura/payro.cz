import React from "react";

export default function Footer({ user = null }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
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
  );
}
