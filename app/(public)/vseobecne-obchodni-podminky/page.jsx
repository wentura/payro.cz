/**
 * Terms of Service Page
 *
 * Všeobecné obchodní podmínky for FKTR.cz
 */

export const metadata = {
  title: "Obchodní podmínky",
  description: "Všeobecné obchodní podmínky služby FKTR.cz.",
  alternates: {
    canonical: "/vseobecne-obchodni-podminky",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="flex-grow bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fktr-fg mb-6">
          Všeobecné obchodní podmínky
        </h1>

        <div className="fktr-prose">
          <p className="text-lg text-fktr-muted mb-12 leading-relaxed">
            <strong>
              FKTR.cz – jednoduchý fakturační systém pro freelancery
            </strong>
          </p>

          <section>
            <h2>1. Kdo službu provozuje</h2>
            <p>
              Službu <strong>FKTR.cz</strong> provozuje:
            </p>
            <p>
              <strong>Zbyněk Svoboda, IČO: 74811002,</strong>
              <br />
              primárně pro svou osobní potřebu fakturace.
            </p>
            <p>
              Kontakt:{" "}
              <a href="mailto:info@zbyneksvoboda.cz">info@zbyneksvoboda.cz</a>.
            </p>
          </section>

          <section>
            <h2>2. Co služba dělá</h2>
            <p>
              FKTR.cz umožňuje vytvářet, ukládat a exportovat faktury, kontakty a
              přehledy.
            </p>
            <p>
              Služba není účetní software ani daňový poradce – slouží jen jako
              jednoduchý nástroj pro správu faktur.
            </p>
          </section>

          <section>
            <h2>3. Registrace a používání</h2>
            <p>
              Registrací si vytváříte svůj účet a souhlasíte s těmito
              podmínkami.
            </p>
            <p>
              Jste odpovědní za údaje, které do systému zadáte (např. fakturační
              údaje, IČO, ceny, texty faktur).
            </p>
            <p>
              Jste také odpovědní za to, že své přihlašovací údaje chráníte před
              zneužitím.
            </p>
          </section>

          <section>
            <h2>4. Tarify a platby</h2>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                <strong>FKTR Free</strong> – zdarma, omezený na 4 faktury
                měsíčně.
              </li>
              <li>
                <strong>FKTR Pro</strong> – placený (55 Kč/měsíc nebo 550 Kč/rok,
                2 měsíce zdarma).
              </li>
            </ul>
            <p>
              Platby probíhají převodem na účet a jsou potvrzovány ručně do 3
              dnů. Pokud platba nedorazí, účet zůstává ve free režimu.
            </p>
            <p>
              Předplatné se automaticky neobnovuje. Můžeš ho kdykoliv zrušit, po
              skončení zaplaceného období přejdete zpět na free verzi.
            </p>
          </section>

          <section>
            <h2>5. Zrušení účtu</h2>
            <p>
              Účet můžete kdykoliv smazat nebo přestat používat. (Na mazání účtu
              pracuji.)
            </p>
            <p>
              Služba si může vyhradit právo účet zrušit v případě porušení
              pravidel nebo zneužití systému.
            </p>
          </section>

          <section>
            <h2>6. Odpovědnost</h2>
            <p>
              FKTR.cz funguje „tak jak je&quot;. Primárně pro mou osobní potřebu
              fakturace.
            </p>
            <p>
              I když se snažím, aby vše běželo spolehlivě, neručím za případnou
              ztrátu dat nebo výpadky služby.
            </p>
            <p>
              Doporučuji pravidelně exportovat své faktury a klienty (XLS/JSON
              export). Na exportu dat pracuji.
            </p>
          </section>

          <section>
            <h2>7. Změny podmínek</h2>
            <p>
              Podmínky se mohou časem upravit (např. při rozšíření funkcí).
            </p>
            <p>O změnách informuji vždy e-mailem nebo přímo v aplikaci.</p>
          </section>

          <section>
            <h2>8. Kontakt</h2>
            <p>
              Dotazy nebo připomínky pište na{" "}
              <a href="mailto:info@zbyneksvoboda.cz">info@zbyneksvoboda.cz</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
