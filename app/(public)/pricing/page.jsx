import PricingClient from "./PricingClient";

export const metadata = {
  title: "Ceník",
  description: "Ceník FKTR.cz – jednoduché plány pro fakturaci bez stresu.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
