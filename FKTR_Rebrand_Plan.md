# FKTR.cz – Rebrand Plan

## 🎯 Cíl
Zachovat plně funkční aplikaci a kompletně přejmenovat brand a vizuální identitu na **FKTR.cz**.  
Cílem je posílit značku, sjednotit tone-of-voice a zlepšit vnímanou kvalitu bez zásahu do jádra appky.

---

## 🧩 FÁZE 1 – Doména a DNS
1. Zaregistruj **fktr.cz** (pokud ještě není).
2. V DNS nastav správné A/CNAME záznamy pro fktr.cz.
3. Přidej do `next.config.js` doménu `fktr.cz`.
4. Připrav 301 redirecty na fktr.cz.

---

## 🎨 FÁZE 2 – Texty, metadata a logo

| Kde | Co | Nová hodnota |
|------|------|---------------|
| `app/layout.tsx` / `<Head>` | `<title>` | **FKTR – fakturuj v klidu** |
| `meta.description` | popis appky | Minimalistická appka pro vystavení faktur |
| `favicon.ico` / `logo.svg` | logotyp | text `FKTR.` (Manrope ExtraBold) |
| hero sekce | nadpis | “Fakturuj v klidu.” |
| tlačítka / plány | texty | “FKTR Pro”, “FKTR Free” |
| e-maily | podpis | „Tým FKTR.cz“ |

### Logo
Textové: `FKTR.` s tečkou (symbol hotovo).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">
  <text x="0" y="30" font-family="Manrope, sans-serif" font-weight="800" font-size="32">FKTR.</text>
</svg>
```

### Typografie & barvy
- Font: `Manrope` nebo `Satoshi`
- Barvy:
  - background `#F9F9F8`
  - text `#0F0F0F`
  - accent mint `#00BFA6`
  - muted gray `#9CA3AF`

---

## 💬 FÁZE 3 – UI a tone-of-voice

### Tone-of-voice
Krátký, klidný, férový, neformální.  
> Fakturuj v klidu.  
> Méně kliků, více klidu.  
> Tvoje data. Tvoje faktury.

### Microcopy příklady
| Situace | Text |
|----------|------|
| Vytvoření faktury | „Hotovo. Faktura uložená.“ |
| Free limit | „Vyčerpal jsi 4 faktury. FKTR Pro má neomezeně.“ |
| Chyba | „Něco se pokazilo. Ale klid, zkus to znovu.“ |

---

## 💰 FÁZE 4 – Ceník a přechod
**FKTR Pro** – 90 Kč / měsíc nebo 900 Kč / rok.  
Platba převodem, potvrzení do 3 dnů.  
Žádné závazky, žádné automatické obnovení.

---

## 🔁 FÁZE 5 – Redirect, SEO a metadata
1. Nastav 301 redirecty na fktr.cz.
2. Aktualizuj:
   - `robots.txt`
   - `siteurl` v konfiguraci SEO
   - favicon, manifest.json, OpenGraph image (např. `/og/fktr.jpg`)
3. Nastav přeposílání e-mailů na `info@fktr.cz`.

---

## 🧱 FÁZE 6 – Brand assets
V repozáři vytvoř složku:
```
/brand
  ├── fktr-logo.svg
  ├── colors.md
  ├── tone-of-voice.md
  └── landing-wireframe.png
```

---

## 🚀 FÁZE 7 – Release plán

| Den | Akce |
|------|------|
| D+0 | koupě domény fktr.cz |
| D+1 | redirect DNS + favicon/logo |
| D+2 | přepsání textů a metadat |
| D+3 | build a deploy na fktr.cz |
| D+4 | veřejné oznámení: “FKTR je připraven. Méně kliků, více klidu.” |

---

## ✅ Shrnutí
- **FKTR.cz** přebírá veřejnou identitu a marketing.  
- Infrastruktura (DB, auth, storage) zůstává zachována.  
- Do budoucna lze interně sjednotit názvy (repo → fktr).

---
