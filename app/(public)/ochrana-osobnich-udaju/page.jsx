/**
 * Privacy Policy Page
 *
 * Zásady zpracování osobních údajů (GDPR) for FKTR.cz
 */

export const metadata = {
  title: "Ochrana osobních údajů",
  description:
    "Zásady zpracování osobních údajů (GDPR) pro službu FKTR.cz.",
  alternates: {
    canonical: "/ochrana-osobnich-udaju",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-grow bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fktr-fg mb-6">
          Zásady zpracování osobních údajů (GDPR)
        </h1>
        <p className="text-lg font-medium text-fktr-fg leading-relaxed mb-14">
          Nikdy nepředám jakékoliv vaše údaje třetím stranám pro marketing, či
          jinou činnost. Nikdy. Používáním služby souhlasíte s nutným využitím
          údajů pro správný provoz služby.
        </p>

        <div className="fktr-prose">
          <section>
            <h2>1. Kdo údaje zpracovává</h2>
            <p>
              Provozovatel služby <strong>FKTR.cz</strong> je:
            </p>
            <p>
              <strong>Zbyněk Svoboda, IČO: 74811002,</strong>
              <br />
              e-mail:{" "}
              <a href="mailto:info@zbyneksvoboda.cz">info@zbyneksvoboda.cz</a>
            </p>
          </section>

          <section>
            <h2>2. Jaké údaje sbírám</h2>
            <p>Při používání služby ukládám tyto údaje:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>e-mail a heslo (za účelem přihlášení),</li>
              <li>
                fakturační údaje (IČO, adresa, banka, údaje na fakturách),
              </li>
              <li>údaje o vašich klientech (IČO, DIČ, jméno, e-mail atd.),</li>
            </ul>
          </section>

          <section>
            <h2>3. K čemu údaje používám</h2>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>vedení vašeho účtu a přihlášení,</li>
              <li>vystavení vašich faktur a export dat,</li>
              <li>
                zasílání informací o službě (např. upozornění na platbu, novinky
                o funkcích, atd.),
              </li>
              <li>zlepšování fungování služby.</li>
            </ul>
            <p>
              Údaje nikdy neprodávám ani nepředávám třetím stranám pro marketing.
            </p>
          </section>

          <section>
            <h2>4. Kdo má k údajům přístup</h2>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>já (provozovatel) – pro běžnou správu služby,</li>
              <li>
                <strong>Supabase</strong> (EU datacentrum) – poskytuje databázi
                a hosting,
              </li>
              <li>
                <strong>Resend</strong> (USA) – pokud bude použit pro odesílání
                e-mailů.
              </li>
            </ul>
            <p>
              Všechny služby jsou smluvně zabezpečené a odpovídají standardům
              ochrany dat (EU GDPR, SCC).
            </p>
          </section>

          <section>
            <h2>5. Jak dlouho údaje uchovávám</h2>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                faktury a účetní záznamy: <strong>min. 5 let</strong> (účetní
                povinnost),
              </li>
              <li>běžná uživatelská data: dokud máte účet,</li>
              <li>po smazání účtu: data budou odstraněna do 30 dnů.</li>
            </ul>
          </section>

          <section>
            <h2>6. Vaše práva</h2>
            <p>Máte právo:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>vidět, jaké údaje o tobě vedu,</li>
              <li>nechat je opravit nebo smazat,</li>
              <li>přenést je (export XLS/JSON),</li>
              <li>
                podat stížnost na ÚOOÚ (pokud si myslíte, že s daty zacházím
                špatně).
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>
              Používám jen technické cookies, které jsou nutné pro přihlášení a
              správný chod aplikace.
            </p>
            <p>Žádné reklamní ani sledovací cookies nejsou použity.</p>
          </section>

          <section>
            <h2>8. Kontakt na správce dat</h2>
            <p>
              <a href="mailto:info@zbyneksvoboda.cz">info@zbyneksvoboda.cz</a>
            </p>
            <p>Na jakékoliv dotazy o ochraně dat odpovídám osobně.</p>
          </section>

          <div className="mt-16 pt-10 border-t border-fktr-border">
            <h3>Shrnutí</h3>
            <p>FKTR.cz je malý a férový nástroj.</p>
            <p>Vaše data jsou vaše.</p>
            <p>Nepoužívám žádné reklamní systémy, cookies ani tracking.</p>
            <p>
              Chci, abyste si mohli faktury řešit jednoduše, v klidu a bez
              byrokracie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
