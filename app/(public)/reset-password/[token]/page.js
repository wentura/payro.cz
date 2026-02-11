/**
 * Password Reset Page
 *
 * Server wrapper that passes token to client form
 */

import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Obnovení hesla",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/reset-password",
  },
};

export default async function ResetPasswordTokenPage({ params }) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">
              Neplatný odkaz – chybí reset token.
            </p>
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

  return <ResetPasswordForm token={token} />;
}
