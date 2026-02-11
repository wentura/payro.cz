import ResendVerificationForm from "./ResendVerificationForm";

export const metadata = {
  title: "Aktivační email",
  description: "Znovu odeslání aktivačního emailu k účtu FKTR.cz.",
  alternates: {
    canonical: "/resend-verification",
  },
};

export default function ResendVerificationPage() {
  return <ResendVerificationForm />;
}


