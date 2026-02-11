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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Zásady zpracování osobních údajů (GDPR)
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-12">
            Nikdy nepředám jakékoliv vaše údaje třetím stranám pro marketing, či
            jinou činnost. Nikdy. Používáním služby souhlasíte s nutným využitím
            údajů pro správný provoz služby.
          </h2>
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Kdo údaje zpracovává
              </h2>
              <p className="text-gray-700 mb-4">
                Provozovatel služby <strong>FKTR.cz</strong> je:
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Zbyněk Svoboda, IČO: 74811002,</strong>
                <br />
                e-mail:{" "}
                <a
                  href="mailto:info@zbyneksvoboda.cz"
                  className="text-blue-600 underline font-bold"
                >
                  info@zbyneksvoboda.cz
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Jaké údaje sbírám
              </h2>
              <p className="text-gray-700 mb-4">
                Při používání služby ukládám tyto údaje:
              </p>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>e-mail a heslo (za účelem přihlášení),</li>
                <li>
                  fakturační údaje (IČO, adresa, banka, údaje na fakturách),
                </li>
                <li>
                  údaje o vašich klientech (IČO, DIČ, jméno, e-mail atd.),
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. K čemu údaje používám
              </h2>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>vedení vašeho účtu a přihlášení,</li>
                <li>vystavení vašich faktur a export dat,</li>
                <li>
                  zasílání informací o službě (např. upozornění na platbu,
                  novinky o funkcích, atd.),
                </li>
                <li>zlepšování fungování služby.</li>
              </ul>
              <p className="text-gray-700">
                Údaje nikdy neprodávám ani nepředávám třetím stranám pro
                marketing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Kdo má k údajům přístup
              </h2>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>já (provozovatel) – pro běžnou správu služby,</li>
                <li>
                  <strong>Supabase</strong> (EU datacentrum) – poskytuje
                  databázi a hosting,
                </li>
                <li>
                  <strong>Resend</strong> (USA) – pokud bude použit pro
                  odesílání e-mailů.
                </li>
              </ul>
              <p className="text-gray-700">
                Všechny služby jsou smluvně zabezpečené a odpovídají standardům
                ochrany dat (EU GDPR, SCC).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Jak dlouho údaje uchovávám
              </h2>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>
                  faktury a účetní záznamy: <strong>min. 5 let</strong> (účetní
                  povinnost),
                </li>
                <li>běžná uživatelská data: dokud máte účet,</li>
                <li>po smazání účtu: data budou odstraněna do 30 dnů.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Vaše práva
              </h2>
              <p className="text-gray-700 mb-4">Máte právo:</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>vidět, jaké údaje o tobě vedu,</li>
                <li>nechat je opravit nebo smazat,</li>
                <li>přenést je (export XLS/JSON),</li>
                <li>
                  podat stížnost na ÚOOÚ (pokud si myslíte, že s daty zacházím
                  špatně).
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-700 mb-4">
                Používám jen technické cookies, které jsou nutné pro přihlášení
                a správný chod aplikace.
              </p>
              <p className="text-gray-700">
                Žádné reklamní ani sledovací cookies nejsou použity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Kontakt na správce dat
              </h2>
              <p className="text-gray-700 mb-4">
                <a
                  href="mailto:info@zbyneksvoboda.cz"
                  className="text-blue-600 underline font-bold"
                >
                  info@zbyneksvoboda.cz
                </a>
              </p>
              <p className="text-gray-700">
                Na jakékoliv dotazy o ochraně dat odpovídám osobně.
              </p>
            </section>

            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Shrnutí
              </h3>
              <p className="text-gray-700 mb-4">
                FKTR.cz je malý a férový nástroj.
              </p>
              <p className="text-gray-700 mb-4">Vaše data jsou vaše.</p>
              <p className="text-gray-700 mb-4">
                Nepoužívám žádné reklamní systémy, cookies ani tracking.
              </p>
              <p className="text-gray-700">
                Chci, abyste si mohli faktury řešit jednoduše, v klidu a bez
                byrokracie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
