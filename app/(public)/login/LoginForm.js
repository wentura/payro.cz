"use client";

/**
 * Login Form
 *
 * Client component with interactive login form
 */

import { getSafeRedirectPath } from "@/app/lib/safe-redirect";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  const [formData, setFormData] = useState({
    contact_email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error === "ACCOUNT_NOT_ACTIVATED") {
          setError(
            result.message ||
              "Účet není aktivován. Zkontrolujte e-mail s aktivačním odkazem."
          );
          setIsLoading(false);
          return;
        }
        if (result.error === "ACCOUNT_DEACTIVATED") {
          setError(
            result.message || "Účet je deaktivovaný. Kontaktujte podporu."
          );
          setIsLoading(false);
          return;
        }
        setError(result.message || result.error || "Chyba při přihlašování");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard or specified page
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Neočekávaná chyba při přihlašování");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-fktr-border rounded-lg p-8 sm:p-10">
        <div>
          <h2 className="font-display text-center text-3xl font-medium tracking-tight text-fktr-fg">
            Přihlášení
          </h2>
          <p className="mt-3 text-center text-sm text-fktr-muted leading-relaxed">
            Přihlaste se do svého účtu
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {error.includes("aktivován")
                      ? "Účet není aktivován"
                      : "Chyba při přihlašování"}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  {error.includes("aktivován") && (
                    <div className="mt-4">
                      <Link
                        href="/resend-verification"
                        className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                      >
                        Znovu poslat aktivační email
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="contact_email"
                className="block text-sm font-medium text-fktr-muted mb-1"
              >
                Email
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                required
                value={formData.contact_email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 border border-fktr-border placeholder-fktr-muted/60 text-fktr-fg rounded-lg focus:outline-none focus:ring-2 focus:ring-fktr-accent/20 focus:border-fktr-accent sm:text-sm bg-white"
                placeholder="vas@email.cz"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-fktr-muted mb-1"
              >
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 border border-fktr-border placeholder-fktr-muted/60 text-fktr-fg rounded-lg focus:outline-none focus:ring-2 focus:ring-fktr-accent/20 focus:border-fktr-accent sm:text-sm bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-fktr-accent hover:text-fktr-accent-hover"
              >
                Zapomenuté heslo?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-fktr-accent hover:bg-fktr-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fktr-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Přihlašování..." : "Přihlásit se"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-fktr-muted">
              Nemáte účet?{" "}
              <Link
                href="/register"
                className="font-medium text-fktr-accent hover:text-fktr-accent-hover"
              >
                Zaregistrujte se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
