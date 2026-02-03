# TODO List – Cesta k prvním platícím klientům

## Fáze A – Bezpečnost + GDPR/compliance (hotovo)

- [x] RLS politiky pro core tabulky (viz `database/migration-enable-rls.sql`)
- [x] Audit log tabulka + logování klíčových akcí (viz `database/migration-audit-log.sql`, `app/lib/audit.js`)
- [x] GDPR export dat (API: `app/api/user/gdpr/export/route.js`)
- [x] GDPR mazání/anonymizace (API: `app/api/user/gdpr/delete/route.js`)
- [x] Podepsané session cookie (HMAC) + odstranění citlivých logů
- [x] Rate limiting pro auth endpointy (viz `database/migration-rate-limits.sql`, `app/lib/rate-limit.js`)

### Ruční kroky k nasazení (A)
- [x] Spustit DB migrace:
  - `database/migration-enable-rls.sql`
  - `database/migration-audit-log.sql`
  - `database/migration-rate-limits.sql`
  - `database/migration-user-deletion.sql`
- [x] Nastavit environment variables:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SESSION_SECRET`
- [x] Ověřit RLS v Supabase (anon role nesmí číst citlivá data)
- [x] Smoke test:
  - login/registrace/reset hesla (rate limit a session)
  - GDPR export (stažení JSON)
  - GDPR delete (anonymizace + logout)

## Fáze B – Platby a fakturace

- [NEREALIZOVAT] Rozhodnout long-term platební strategii (bankovní převod vs. brána)
- [NEREALIZOVAT] Ověřit QR kódy v CZ bankách
- [NEREALIZOVAT] Dopsat IBAN konverze a payment symbols
- [NEREALIZOVAT] Ujasnit workflow „zaplaceno/nezaplaceno“ bez platební brány

## Fáze C – Provoz a spolehlivost

- [NEREALIZOVAT] Monitoring a error tracking (Sentry nebo obdobné)
- [x] Zálohy DB + obnova
- [NEREALIZOVAT] CI/CD pipeline
- [NEREALIZOVAT] Rate limiting i pro další citlivé API (nejen auth)

## Fáze D – Produkt a branding (aktuální)

- [ ] Rebrand na fktr.cz (doména, logo, metadata)
- [ ] SEO a marketingová landing page
- [ ] UX drobnosti a onboarding pro první platící klienty
