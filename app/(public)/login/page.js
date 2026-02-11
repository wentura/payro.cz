import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Přihlášení",
  description: "Přihlášení do FKTR.cz – přístup k vašim fakturám a klientům.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p>Načítám formulář...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
