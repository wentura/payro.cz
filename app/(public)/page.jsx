/**
 * Landing Page
 *
 * Public homepage for the FKTR.cz invoicing application
 * No database connection required
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 bg-dotted-grid flex-grow flex flex-col bg-neutral-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 text-blue-600 pt-8">
            Fakturuj v klidu.
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">
            Méně kliků, více času.
          </h2>

          <p className="text-base text-gray-600 mb-8 max-w-3xl mx-auto hidden">
            Minimalistický fakturační systém postavený přímo pro české
            podnikatele a freelancery. Vytvářejte faktury, spravujte klienty a
            sledujte splatnosti faktur na jednom místě. A využij více času na
            to, co vás baví.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Začít zdarma
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-lg font-semibold transition-colors shadow-md border border-gray-200"
            >
              Přihlásit se
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Snadné fakturování
            </h3>
            <p className="text-gray-600">
              Vytvářejte faktury v několika krocích. Automatické číslování,
              výpočty a správa splatností.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Správa klientů
            </h3>
            <p className="text-gray-600">
              Uchovávejte všechny informace o vašich klientech přehledně na
              jednom místě.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Přehled plateb
            </h3>
            <p className="text-gray-600">
              Sledujte zaplacené a nezaplacené faktury. Nezmeškejte žádnou
              platbu po splatnosti.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Vše, co potřebujete pro fakturaci
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div>
                <h4 className="font-semibold text-gray-900">České prostředí</h4>
                <p className="text-gray-600">
                  Formát data, měna CZK, IČO, splatnosti podle českých zvyklostí
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Automatické číslování
                </h4>
                <p className="text-gray-600">
                  Formát YYYY-MM-xxx, automaticky při &quot;odeslání&quot;
                  faktury
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div>
                <h4 className="font-semibold text-gray-900">Více položek</h4>
                <p className="text-gray-600">
                  Přidávejte neomezený počet položek s automatickým výpočtem
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div>
                <h4 className="font-semibold text-gray-900">Stavy faktur</h4>
                <p className="text-gray-600">
                  Koncept, odeslaná, zaplacená, částečně zaplacená, po
                  splatnosti, stornovaná
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Připraveni začít?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Zaregistrujte se zdarma a vytvořte svou první fakturu během minuty.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Začít fakturovat zdarma
          </Link>
        </div>
      </div>
    </div>
  );
}
