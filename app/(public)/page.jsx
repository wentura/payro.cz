/**
 * Landing — swiss light, brand-first, airy whitespace
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-grow flex flex-col bg-white">
      <section className="relative fktr-mesh overflow-hidden border-b border-fktr-border">
        <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(28 25 23 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(28 25 23 / 0.03) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 65% 55% at 50% 35%, black, transparent)",
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 sm:pb-28 text-center">
          <p className="fktr-hero-fade font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-fktr-accent mb-8">
            FKTR.cz
          </p>
          <h1 className="fktr-hero-fade-delay font-display text-3xl sm:text-5xl md:text-6xl font-medium text-fktr-fg tracking-tight text-balance mb-6 leading-[1.15]">
            Fakturuj v&nbsp;klidu.
          </h1>
          <p className="fktr-hero-fade-delay-2 text-base sm:text-lg text-fktr-muted max-w-md mx-auto mb-12 leading-relaxed text-pretty">
            Minimalistické faktury pro české OSVČ a freelancery. Méně kliků,
            QR platba, e‑mail s PDF — na jednom místě.
          </p>
          <div className="fktr-hero-fade-delay-2 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-fktr-accent px-7 py-3 text-base font-medium text-white transition-colors hover:bg-fktr-accent-hover"
            >
              Začít zdarma
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-fktr-border bg-white px-7 py-3 text-base font-medium text-fktr-fg transition-colors hover:bg-fktr-bg"
            >
              Podívat se na ceník
            </Link>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 fktr-hero-fade-delay-2">
          <div
            className="rounded-t-lg border border-b-0 border-fktr-border bg-white overflow-hidden"
            aria-hidden
          >
            <div className="flex items-center gap-2 border-b border-fktr-border px-5 py-3.5 bg-fktr-bg">
              <span className="h-2 w-2 rounded-full bg-fktr-border" />
              <span className="h-2 w-2 rounded-full bg-fktr-border" />
              <span className="h-2 w-2 rounded-full bg-fktr-border" />
              <span className="ml-3 text-xs text-fktr-muted font-medium tracking-wide">
                Faktura 2026-03-014
              </span>
            </div>
            <div className="grid sm:grid-cols-[1fr_auto] gap-8 p-8 sm:p-10 text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-fktr-muted mb-1.5">
                  Dodavatel
                </p>
                <p className="font-medium text-fktr-fg">Vaše studio s.r.o.</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-fktr-muted mt-8 mb-1.5">
                  Odběratel
                </p>
                <p className="font-medium text-fktr-fg">Klient &amp; Co.</p>
                <div className="mt-10 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-fktr-border pb-3">
                    <span className="text-fktr-muted">Design webu</span>
                    <span className="font-medium text-fktr-fg">24&nbsp;000&nbsp;Kč</span>
                  </div>
                  <div className="flex justify-between border-b border-fktr-border pb-3">
                    <span className="text-fktr-muted">Konzultace</span>
                    <span className="font-medium text-fktr-fg">6&nbsp;000&nbsp;Kč</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center sm:border-l sm:border-fktr-border sm:pl-10">
                <div className="h-24 w-24 rounded-lg bg-fktr-accent-soft border border-fktr-border flex items-center justify-center">
                  <div
                    className="h-16 w-16 opacity-50"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,#0d9488 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,#0d9488 0 1px,transparent 1px 5px)",
                    }}
                  />
                </div>
                <p className="mt-4 text-xs text-fktr-muted text-center tracking-wide">
                  QR platba (SPAYD)
                </p>
                <p className="mt-5 text-xl font-medium text-fktr-fg tracking-tight">
                  30&nbsp;000&nbsp;Kč
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-white border-b border-fktr-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-fktr-fg text-center tracking-tight mb-5">
            Proč FKTR
          </h2>
          <p className="text-fktr-muted text-center max-w-lg mx-auto mb-20 leading-relaxed">
            Žádný balast. Jen to, co OSVČ opravdu používá každý týden.
          </p>
          <div className="grid md:grid-cols-3 gap-14 md:gap-12">
            {[
              {
                title: "České zvyklosti",
                body: "Datum DD.MM.YYYY, CZK, IČO, splatnosti a QR podle bankovního standardu SPAYD.",
              },
              {
                title: "E‑mail s PDF",
                body: "Odešlete fakturu klientovi přímo z appky — včetně PDF přílohy a upomínky.",
              },
              {
                title: "Přehled splatností",
                body: "Vidíte nezaplacené a po splatnosti. Méně Excelu, více klidu.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <h3 className="text-lg font-medium text-fktr-fg mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-fktr-muted text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 fktr-mesh border-b border-fktr-border">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-fktr-fg text-center tracking-tight mb-16">
            Jak to funguje
          </h2>
          <ol className="space-y-12">
            {[
              {
                n: "1",
                title: "Přidejte klienta",
                body: "Jméno, IČO, e‑mail. Adresa jednou — na fakturách vždy po ruce.",
              },
              {
                n: "2",
                title: "Vystavte fakturu",
                body: "Položky, splatnost, číslo se doplní při odeslání. Tisk i PDF.",
              },
              {
                n: "3",
                title: "Pošlete a sledujte",
                body: "E‑mail klientovi, QR pro platbu, stav zaplaceno / po splatnosti.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-6 items-start">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fktr-border text-fktr-accent font-medium text-sm bg-white">
                  {step.n}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-lg font-medium text-fktr-fg mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-fktr-muted text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-white border-b border-fktr-border">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-fktr-fg tracking-tight mb-5">
            Jednoduchý ceník
          </h2>
          <p className="text-fktr-muted mb-10 leading-relaxed">
            Začněte zdarma. Až budete fakturovat víc, přejděte na tarif bez
            překvapení.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-fktr-accent px-7 py-3 text-base font-medium text-fktr-accent transition-colors hover:bg-fktr-accent-soft"
          >
            Zobrazit ceník →
          </Link>
        </div>
      </section>

      <section className="py-24 sm:py-36 fktr-mesh">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-fktr-fg tracking-tight mb-5">
            První faktura do minuty
          </h2>
          <p className="text-fktr-muted mb-10 leading-relaxed">
            Registrace je zdarma a zabere jen chvíli.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-fktr-accent px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-fktr-accent-hover"
          >
            Začít zdarma
          </Link>
        </div>
      </section>
    </div>
  );
}
