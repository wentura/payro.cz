# Best Practices Summary - FKTR.cz Project

Tento dokument shrnuje klíčové best practices a principy z projektu FKTR.cz, které lze aplikovat na jakýkoliv Next.js projekt.

## 📚 Dokumentace

Projekt obsahuje následující dokumentaci:

1. **`.cursorrules`** - Univerzální pravidla pro Cursor AI
   - Server Components First
   - Performance First
   - Minimalistické pojetí
   - Plná funkčnost

2. **`DEVELOPMENT_GUIDELINES.md`** - Praktické guidelines
   - Architektonické vzory s příklady kódu
   - Database best practices
   - Security patterns
   - Performance checklist

3. **`QUICK_REFERENCE.md`** - Rychlý referenční průvodce
   - Běžné scénáře
   - Code snippets
   - Checklist

4. **`PERFORMANCE_ANALYSIS.md`** - Detailní analýza výkonu
   - Optimalizace Server Components
   - Caching strategie
   - Database optimalizace
   - Bundle size optimalizace

## 🎯 Klíčové principy

### 1. Server Components First

**Zlaté pravidlo**: Začni se Server Componentem, přidej `"use client"` pouze když je to nutné.

**Výhody:**
- ✅ Menší bundle size
- ✅ Rychlejší First Contentful Paint
- ✅ Lepší SEO
- ✅ Méně client-side JavaScript

**Kdy použít Client Component:**
- Formuláře s interaktivitou
- Modaly, dropdowny, toggly
- Použití React hooks
- Browser APIs

### 2. Performance First

**Není to "nice to have" - je to nutnost.**

**Strategie:**
- **Caching**: Statická data cache pomocí `unstable_cache`
- **Paralelní fetching**: `Promise.all()` místo sekvenčního načítání
- **Dynamic imports**: Lazy load těžkých komponent
- **Database indexy**: Composite indexy pro časté queries

**Výsledky z FKTR.cz:**
- First Contentful Paint: ~0.8s (-47%)
- Time to Interactive: ~1.8s (-49%)
- Bundle Size: ~75KB (-50%)

### 3. Minimalistické pojetí

**KISS (Keep It Simple, Stupid)**

- Neover-engineeruj
- Neabstrahuj předčasně
- Jeden komponent = jedna zodpovědnost
- YAGNI (You Aren't Gonna Need It)

### 4. Plná funkčnost

**Nepouštěj polotovary do produkce**

- Kompletní error handling
- Loading states pro všechny async operace
- Validace na clientu I serveru
- Accessibility (a11y) od začátku

## 📐 Architektonické vzory

### Pattern 1: Server Page + Client Form

```javascript
// ✅ page.js (Server Component)
export default async function Page() {
  const data = await fetchData();
  return <ClientForm data={data} />;
}

// ✅ Form.js (Client Component)
"use client";
export default function Form({ data }) {
  // Form logic with data already loaded
}
```

### Pattern 2: Paralelní Data Fetching

```javascript
// ✅ DOBRÉ: Paralelní
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
]);

// ❌ ŠPATNÉ: Sekvenční (waterfall)
const data1 = await fetchData1();
const data2 = await fetchData2();
const data3 = await fetchData3();
```

### Pattern 3: Caching Reference Data

```javascript
// ✅ Pro statická data
import { unstable_cache } from 'next/cache';

export const getReferenceData = unstable_cache(
  async () => fetchFromDB(),
  ['reference-data'],
  { revalidate: 3600, tags: ['reference-data'] }
);
```

### Pattern 4: Dynamic Imports

```javascript
// ✅ Lazy load modaly
const Modal = dynamic(() => import('./Modal'), {
  ssr: false,
  loading: () => null,
});
```

## 🗄️ Database Best Practices

### Composite Indexy

```sql
-- ✅ Pro časté query patterns
CREATE INDEX idx_invoices_user_status 
  ON invoices(user_id, status_id) 
  WHERE is_deleted = false;
```

### Query Optimization

- Používej `Promise.all()` pro paralelní queries
- Přidej indexy pro časté query patterns
- Používej partial indexy (`WHERE` clauses)
- Spusť `ANALYZE` po přidání indexů

## 🔒 Security Patterns

### Multi-tenancy

```javascript
// ✅ VŽDY scope podle user_id
.eq('user_id', userId)
```

### Validace

```javascript
// ✅ Zod schema na clientu I serveru
const schema = z.object({ ... });
const validated = schema.parse(data);
```

## ⚡ Performance Checklist

Před každým PR:

- [ ] Je to Server Component, pokud to jde?
- [ ] Jsou data načítána paralelně?
- [ ] Jsou statická data cachována?
- [ ] Jsou těžké komponenty lazy loaded?
- [ ] Jsou database queries optimalizované?
- [ ] Je bundle size rozumný?
- [ ] Jsou loading states?
- [ ] Jsou error states?

## 📊 Success Metrics

Cílové hodnoty pro optimalizovanou Next.js aplikaci:

- **FCP**: First Contentful Paint < 1s
- **TTI**: Time to Interactive < 2s
- **Bundle**: Initial bundle < 100KB (gzipped)
- **LCP**: Largest Contentful Paint < 2.5s
- **CLS**: Cumulative Layout Shift < 0.1

## 🚀 Jak použít v novém projektu

1. **Zkopíruj soubory:**
   - `.cursorrules` → do root projektu
   - `DEVELOPMENT_GUIDELINES.md` → do root projektu
   - `QUICK_REFERENCE.md` → do root projektu

2. **Nastav Cursor:**
   - Cursor automaticky načte `.cursorrules`
   - Pravidla budou aplikována na všechny konverzace

3. **Dodržuj principy:**
   - Server Components First
   - Performance First
   - Minimalistické pojetí
   - Plná funkčnost

4. **Používej jako referenci:**
   - `QUICK_REFERENCE.md` pro rychlé code snippets
   - `DEVELOPMENT_GUIDELINES.md` pro detailní příklady
   - `PERFORMANCE_ANALYSIS.md` pro optimalizace

---

**Zapamatuj si**: Performance, jednoduchost a plná funkčnost nejsou "nice to have" - jsou to požadavky.

