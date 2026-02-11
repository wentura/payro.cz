"use client";

/**
 * Password Reset Request Form
 *
 * User enters email to request password reset
 */

import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [magicLink, setMagicLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contact_email: email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při požadavku na reset hesla");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setMagicLink(result.resetLink);
      setIsLoading(false);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError("Neočekávaná chyba při požadavku na reset hesla");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
            Zapomenuté heslo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zadejte svůj email pro obnovení hesla
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="vas@email.cz"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Odesílání..." : "Odeslat reset hesla"}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ← Zpět na přihlášení
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Pokud účet existuje, byl odeslán email s odkazem pro obnovení
                hesla.
              </p>
            </div>

            {magicLink && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Magic Link (kopírujte celý):
                </p>
                <div className="bg-white p-3 rounded border border-gray-300 break-all">
                  <a
                    href={magicLink}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {magicLink}
                  </a>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ← Zpět na přihlášení
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
