/**
 * Email Verification Page
 *
 * Server component that verifies email token and activates account
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

async function verifyEmail(token) {
  try {
    const headerStore = await headers();
    const host = headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") || "http";
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : "");
    const response = await fetch(
      new URL(`/api/auth/verify-email/${token}`, baseUrl),
      {
      method: "GET",
      cache: "no-store",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error verifying email:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při ověřování emailu",
    };
  }
}

export default async function VerifyEmailPage({ params }) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Neplatný odkaz
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Chybí verifikační token v odkazu.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Přejít na přihlášení
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const result = await verifyEmail(token);

  if (result.success) {
    // Redirect to dashboard after 2 seconds
    redirect("/dashboard?verified=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {result.success ? (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Účet aktivován!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {result.alreadyActivated
                      ? "Váš účet je již aktivován."
                      : "Váš účet byl úspěšně aktivován."}
                  </p>
                  <p className="mt-2">Přesměrováváme vás na dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Aktivace se nezdařila
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{result.error || "Nastala chyba při aktivaci účtu."}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-red-600">
                    Možné příčiny:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-2 space-y-1">
                    <li>Odkaz již vypršel (platnost 4 hodiny)</li>
                    <li>Odkaz byl již použit</li>
                    <li>Neplatný nebo poškozený odkaz</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 text-center space-x-4">
          {!result.success && (
            <Link
              href="/resend-verification"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Znovu poslat aktivační email
            </Link>
          )}
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Přejít na přihlášení
          </Link>
        </div>
      </div>
    </div>
  );
}


