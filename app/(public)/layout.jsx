import Footer from "../components/Footer";
import PublicNav from "../components/PublicNav";
export default function PublicLayout({ children }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FKTR",
    url: "https://www.fktr.cz",
    description:
      "Minimalistická appka pro vystavení faktur. Méně kliků, více klidu.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      {children}
      <Footer />
    </div>
  );
}
