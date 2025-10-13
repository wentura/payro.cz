/**
 * Pricing Page
 *
 * Public pricing page for Payro.cz with 3 tiers
 */

import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Jednoduché <span className="text-blue-600">ceník</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vyberte si plán, který nejlépe vyhovuje vašim potřebám. Žádné skryté
            poplatky, žádné překvapení.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Zdarma</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">0 Kč</div>
              <p className="text-gray-600">Pro začínající podnikatele</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezené klientů</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">4 faktury měsíčně</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">České prostředí</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">QR kódy na platbu</p>
                </div>
              </div>
            </div>

            {/* <Link
              href="/register"
              className="block w-full text-center bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Začít zdarma
            </Link> */}
          </div>

          {/* Pro Tier - Highlighted */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-600 relative transform md:scale-105 hover:scale-110 transition-transform">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Nejoblíbenější
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Za 2 kávy měsíčně
              </h3>
              <div className="text-5xl font-bold text-blue-600 mb-4">99 Kč</div>
              <p className="text-gray-600">Pro freelancery a malé firmy</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezené klientů</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezené faktury</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">České prostředí</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">QR kódy na platbu</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Prioritní podpora</p>
                </div>
              </div>
            </div>

            {/* <Link
              href="/register"
              className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Začít hned
            </Link> */}
          </div>

          {/* Enterprise/Custom Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Na míru</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">
                <span className="text-3xl">Individuálně</span>
              </div>
              <p className="text-gray-600">
                Pro větší firmy a specifické potřeby
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Vše z předchozích plánů
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">API přístup</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Vlastní branding</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Dedikovaná podpora
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                S vašimi potřebami se nám neváhejte ozvat, rádi vám vyjdeme
                vstříc
              </p>
            </div>

            {/* <Link
              href="mailto:info@payro.cz"
              className="block w-full text-center bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
            >
              Kontaktovat nás
            </Link> */}
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Často kladené otázky
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mohu kdykoliv změnit plán?
                </h3>
                <p className="text-gray-600">
                  Ano, plán můžete kdykoliv upgradovat nebo downgradovat. Změna
                  se projeví okamžitě.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Jaké platební metody přijímáte?
                </h3>
                <p className="text-gray-600">
                  Přijímáme platební karty (Visa, Mastercard) a bankovní
                  převody.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Co když překročím limit 4 faktur na bezplatném plánu?
                </h3>
                <p className="text-gray-600">
                  Systém vás upozorní a nabídne upgrade na placený plán. Žádné
                  faktury nebudou ztraceny.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Připraveni začít fakturovat?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Registraci stihnete do minuty.
          </p>
          {/* <Link
            href="/register"
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Začít zdarma →
          </Link> */}
        </div>
      </div>
    </div>
  );
}
