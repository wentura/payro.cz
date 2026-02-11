import ResetPasswordRequestForm from "./ResetPasswordRequestForm";

export const metadata = {
  title: "Obnovení hesla",
  description:
    "Obnovení hesla k účtu FKTR.cz – nechte si poslat odkaz na nový přístup.",
  alternates: {
    canonical: "/reset-password",
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordRequestForm />;
}
