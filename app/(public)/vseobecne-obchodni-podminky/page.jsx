/**
 * Terms of Service Page
 *
 * Všeobecné obchodní podmínky for FKTR.cz
 */

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Všeobecné obchodní podmínky
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              <strong>
                FKTR.cz – jednoduchý fakturační systém pro freelancery
              </strong>
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Kdo službu provozuje
              </h2>
              <p className="text-gray-700 mb-4">
                Službu <strong>FKTR.cz</strong> provozuje:
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Zbyněk Svoboda, IČO: [doplníš],</strong>
                <br />
                se sídlem [město, ulice], Česká republika.
                <br />
                Nejsem plátce DPH.
              </p>
              <p className="text-gray-700">
                Kontakt: <strong>info@fktr.cz</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Co služba dělá
              </h2>
              <p className="text-gray-700 mb-4">
                FKTR.cz umožňuje vytvářet, ukládat a exportovat faktury,
                kontakty a přehledy.
              </p>
              <p className="text-gray-700">
                Služba není účetní software ani daňový poradce – slouží jen jako
                jednoduchý nástroj pro správu faktur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Registrace a používání
              </h2>
              <p className="text-gray-700 mb-4">
                Registrací si vytváříš svůj účet a souhlasíš s těmito
                podmínkami.
              </p>
              <p className="text-gray-700 mb-4">
                Jsi odpovědný za údaje, které do systému zadáš (např. fakturační
                údaje, IČO, ceny, texty faktur).
              </p>
              <p className="text-gray-700">
                Jsi také odpovědný za to, že své přihlašovací údaje chráníš před
                zneužitím.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Tarify a platby
              </h2>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>
                  <strong>FKTR Free</strong> – zdarma, omezený na 4 faktury
                  měsíčně.
                </li>
                <li>
                  <strong>FKTR Pro</strong> – placený (90 Kč/měsíc nebo 900
                  Kč/rok).
                </li>
              </ul>
              <p className="text-gray-700 mb-4">
                Platby probíhají převodem na účet a jsou potvrzovány ručně do 3
                dnů. Pokud platba nedorazí, účet zůstává ve free režimu.
              </p>
              <p className="text-gray-700">
                Předplatné se automaticky neobnovuje. Můžeš ho kdykoliv zrušit,
                po skončení zaplaceného období přejdeš zpět na free verzi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Zrušení účtu
              </h2>
              <p className="text-gray-700 mb-4">
                Účet můžeš kdykoliv smazat nebo přestat používat.
              </p>
              <p className="text-gray-700">
                Služba si může vyhradit právo účet zrušit v případě porušení
                pravidel nebo zneužití systému.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Odpovědnost
              </h2>
              <p className="text-gray-700 mb-4">
                FKTR.cz funguje „tak jak je".
              </p>
              <p className="text-gray-700 mb-4">
                I když se snažím, aby vše běželo spolehlivě, neručím za
                případnou ztrátu dat nebo výpadky služby.
              </p>
              <p className="text-gray-700">
                Doporučuji pravidelně exportovat své faktury a klienty (XLS/JSON
                export).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Změny podmínek
              </h2>
              <p className="text-gray-700 mb-4">
                Podmínky se mohou časem upravit (např. při rozšíření funkcí).
              </p>
              <p className="text-gray-700">
                O změnách informuji vždy e-mailem nebo přímo v aplikaci.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Kontakt
              </h2>
              <p className="text-gray-700">
                Dotazy nebo připomínky piš na <strong>info@fktr.cz</strong>. Rád
                odpovím lidsky, bez formulářů.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
