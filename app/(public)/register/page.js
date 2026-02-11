import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Registrace",
  description: "Registrace do FKTR.cz – vytvořte účet a začněte fakturovat.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
