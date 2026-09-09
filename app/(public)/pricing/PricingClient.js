"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingClient() {
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 55;
  const yearlyPrice = monthlyPrice * 10;

  return (
    <div className="flex-grow bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-fktr-fg mb-4">
            <span className="text-fktr-accent">FKTR</span> ceník
          </h1>
          <p className="text-fktr-muted max-w-md mx-auto leading-relaxed">
            Jednoduché plány bez skrytých poplatků.
          </p>
        </div>

        <div className="flex justify-center mb-14">
          <div className="bg-fktr-bg rounded-lg p-1 border border-fktr-border">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isYearly
                    ? "bg-white text-fktr-fg border border-fktr-border"
                    : "text-fktr-muted hover:text-fktr-fg"
                }`}
              >
                Měsíčně
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  isYearly
                    ? "bg-white text-fktr-fg border border-fktr-border"
                    : "text-fktr-muted hover:text-fktr-fg"
                }`}
              >
                Ročně
                {!isYearly && (
                  <span className="absolute -top-3 -right-2 bg-fktr-accent-soft text-fktr-accent border border-fktr-border text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                    2 měsíce zdarma
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-8 sm:p-10 border border-fktr-border">
            <div className="text-center mb-10">
              <h3 className="text-lg font-medium text-fktr-fg mb-3 tracking-tight">
                FKTR Free
              </h3>
              <div className="text-4xl font-medium text-fktr-fg mb-3 tracking-tight">
                0 Kč
              </div>
              <p className="text-fktr-muted text-sm">Pro začínající podnikatele</p>
            </div>
            <ul className="space-y-3.5 text-sm text-fktr-muted">
              {[
                "Neomezeně klientů",
                "4 faktury měsíčně",
                "České prostředí",
                "QR kódy na platbu",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-fktr-accent">✓</span>
                  <span className="text-fktr-fg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg p-8 sm:p-10 border border-fktr-accent relative">
            {isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-fktr-accent text-white px-3 py-1 rounded text-xs font-medium">
                  2 měsíce zdarma
                </span>
              </div>
            )}
            <div className="text-center mb-10">
              <h3 className="text-lg font-medium text-fktr-fg mb-3 tracking-tight">
                FKTR Pro
              </h3>
              <div className="text-4xl font-medium text-fktr-fg mb-2 tracking-tight">
                {isYearly ? `${yearlyPrice} Kč` : `${monthlyPrice} Kč`}
              </div>
              <div className="text-sm text-fktr-muted mb-3">
                {isYearly ? (
                  <div>
                    za rok (2 měsíce zdarma)
                    <div className="text-xs text-fktr-accent font-medium mt-1">
                      = {Math.round(yearlyPrice / 12)} Kč/měsíc
                    </div>
                  </div>
                ) : (
                  "za měsíc"
                )}
              </div>
              <p className="text-fktr-muted text-sm">Za jedno espresso měsíčně</p>
            </div>
            <ul className="space-y-3.5 text-sm text-fktr-muted">
              {[
                "Neomezeně klientů",
                "Neomezené faktury",
                "České prostředí",
                "QR kódy na platbu",
                "Prioritní podpora",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-fktr-accent">✓</span>
                  <span className="text-fktr-fg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 max-w-2xl mx-auto border-t border-fktr-border pt-16">
          <h2 className="font-display text-2xl font-medium text-fktr-fg text-center tracking-tight mb-12">
            Často kladené otázky
          </h2>
          <div className="space-y-10 text-left">
            {[
              [
                "Mohu kdykoliv změnit plán?",
                "Ano, plán můžete kdykoliv upgradovat nebo downgradovat. Změna se projeví okamžitě.",
              ],
              [
                "Jaké platební metody přijímáte?",
                "QR platba / převod na bankovní účet.",
              ],
              [
                "Co když překročím limit 4 faktur na bezplatném plánu?",
                "Systém vás upozorní a nabídne upgrade na placený plán. Žádné faktury nebudou ztraceny.",
              ],
              [
                "Jak funguje roční předplatné?",
                "Při ročním předplatném platíte pouze za 10 měsíců a dostáváte 2 měsíce zdarma.",
              ],
            ].map(([q, a]) => (
              <div key={q}>
                <h3 className="text-base font-medium text-fktr-fg mb-2 tracking-tight">
                  {q}
                </h3>
                <p className="text-sm text-fktr-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-fktr-fg tracking-tight mb-4">
            Připraveni začít fakturovat?
          </h2>
          <p className="text-fktr-muted mb-10 leading-relaxed">
            Registraci stihnete do minuty.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-fktr-accent px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-fktr-accent-hover"
          >
            Začít zdarma →
          </Link>
        </div>
      </div>
    </div>
  );
}
