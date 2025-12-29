# Development Guidelines - Next.js Best Practices

Tento dokument obsahuje praktické guidelines založené na zkušenostech z produkčního projektu FKTR.cz.

## 🎯 Filozofie vývoje

### 1. Server Components First
**Zlaté pravidlo**: Začni se Server Componentem, přidej `"use client"` pouze když je to nutné.

**Kdy použít Server Component:**
- ✅ Načítání dat z databáze/API
- ✅ Statický obsah
- ✅ SEO kritický obsah
- ✅ Komponenty bez interaktivity

**Kdy použít Client Component:**
- ✅ Formuláře s `onChange`, `onSubmit`
- ✅ Interaktivní UI (modaly, dropdowny, toggly)
- ✅ Použití React hooks (`useState`, `useEffect`, `useRouter`)
- ✅ Browser APIs (`window`, `localStorage`, `document`)

### 2. Performance je priorita
**Není to "nice to have" - je to nutnost.**

- **Caching**: Cache statická data (reference data, konfigurace)
- **Paralelní fetching**: Vždy použij `Promise.all()` místo sekvenčního načítání
- **Code splitting**: Používej dynamic imports pro těžké komponenty
- **Database indexy**: Optimalizuj queries pomocí composite indexů

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

### Pattern 1: Server Component s Client Form

```javascript
// ✅ app/invoices/new/page.js (Server Component)
import { getClients, getDueTerms } from '@/lib/services/getReferenceData';
import NewInvoiceForm from './NewInvoiceForm';

export default async function NewInvoicePage() {
  // Data se načítají na serveru paralelně
  const [clients, dueTerms] = await Promise.all([
    getClients(userId),
    getDueTerms(),
  ]);

  // Předáme data jako props do Client Component
  return <NewInvoiceForm clients={clients} dueTerms={dueTerms} />;
}
```

```javascript
// ✅ app/invoices/new/NewInvoiceForm.js (Client Component)
"use client";

export default function NewInvoiceForm({ clients, dueTerms }) {
  // Formulář má interaktivitu, ale data už máme
  const [formData, setFormData] = useState({});
  
  return (
    <form onSubmit={handleSubmit}>
      <Select options={clients} />
      {/* ... */}
    </form>
  );
}
```

### Pattern 2: Layout rozdělení

```javascript
// ✅ Server Layout wrapper
// app/components/ServerLayout.js
export default async function ServerLayout({ children, user }) {
  const isAdmin = await isCurrentUserAdmin();
  
  return (
    <Layout user={user} isAdmin={isAdmin}>
      {children}
    </Layout>
  );
}
```

```javascript
// ✅ Client Layout s interaktivitou
// app/components/Layout.js
"use client";

export default function Layout({ children, user, isAdmin }) {
  // Pouze interaktivní části jsou client-side
  return (
    <NavigationProvider>
      <nav>
        <ClientNavigation />
      </nav>
      <main>{children}</main>
    </NavigationProvider>
  );
}
```

### Pattern 3: Caching reference data

```javascript
// ✅ app/lib/services/getReferenceData.js
import { unstable_cache } from 'next/cache';

async function _getUnitsUncached() {
  const { data } = await supabase.from('units').select('*');
  return data || [];
}

// Cache pro 1 hodinu
export const getUnits = unstable_cache(
  _getUnitsUncached,
  ['units'],
  {
    revalidate: 3600,
    tags: ['reference-data'],
  }
);
```

### Pattern 4: Dynamic imports

```javascript
// ✅ Lazy load modaly
import dynamic from 'next/dynamic';

const ARESModal = dynamic(() => import('@/components/ARESModal'), {
  ssr: false,
  loading: () => null,
});

// Použití
{isModalOpen && <ARESModal />}
```

## 🗄️ Database Best Practices

### Composite Indexy

```sql
-- ✅ Pro časté query patterns
CREATE INDEX idx_invoices_user_status 
  ON invoices(user_id, status_id) 
  WHERE is_deleted = false;

-- ✅ Pro řazení
CREATE INDEX idx_invoices_user_created 
  ON invoices(user_id, created_at DESC) 
  WHERE is_deleted = false;
```

### Query Patterns

```javascript
// ✅ Paralelní queries
const [invoices, clients, stats] = await Promise.all([
  getInvoices(userId),
  getClients(userId),
  getStats(userId),
]);

// ❌ Sekvenční queries (waterfall)
const invoices = await getInvoices(userId);
const clients = await getClients(userId);
const stats = await getStats(userId);
```

## 🔒 Security Patterns

### Multi-tenancy

```javascript
// ✅ Vždy scope podle user_id
export async function getInvoices(userId) {
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId) // VŽDY!
    .eq('is_deleted', false);
  
  return data;
}

// ❌ NIKDY nevěř client-side user_id
// Vždy ověř na serveru
```

### Validace

```javascript
// ✅ Zod schema
import { z } from 'zod';

const invoiceSchema = z.object({
  client_id: z.uuid(),
  issue_date: z.date(),
  total_amount: z.number().positive(),
});

// Validace na serveru
export async function createInvoice(data) {
  const validated = invoiceSchema.parse(data);
  // ... create invoice
}
```

## ⚡ Performance Checklist

Před každým PR zkontroluj:

- [ ] Jsou data načítána paralelně (`Promise.all`)?
- [ ] Jsou statická data cachována?
- [ ] Jsou těžké komponenty lazy loaded?
- [ ] Jsou database queries optimalizované (indexy)?
- [ ] Je bundle size rozumný?
- [ ] Jsou loading states implementované?
- [ ] Jsou error states implementované?

## 📦 Bundle Size Optimization

### Dynamic Imports

```javascript
// ✅ Pro modaly
const Modal = dynamic(() => import('./Modal'), { ssr: false });

// ✅ Pro těžké komponenty
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
});

// ✅ Pro celé routes (pokud je to vhodné)
const AdminPanel = dynamic(() => import('./AdminPanel'));
```

### Code Splitting

- **Route-based**: Next.js automaticky splituje routes
- **Component-based**: Používej dynamic imports pro velké komponenty
- **Library-based**: Importuj pouze to, co potřebuješ

## 🎨 Component Design

### Malé, zaměřené komponenty

```javascript
// ✅ DOBRÉ: Malý, zaměřený komponent
export function InvoiceStatusBadge({ status }) {
  return <Badge variant={getVariant(status)}>{status}</Badge>;
}

// ❌ ŠPATNÉ: Velký, vše dělající komponent
export function InvoiceCard({ invoice }) {
  // 200+ řádků kódu, dělá všechno
}
```

### Composition over Configuration

```javascript
// ✅ DOBRÉ: Composition
<Card>
  <Card.Header>
    <Card.Title>Invoice</Card.Title>
  </Card.Header>
  <Card.Body>
    <InvoiceDetails />
  </Card.Body>
</Card>

// ❌ ŠPATNÉ: Configuration hell
<Card 
  hasHeader={true}
  headerTitle="Invoice"
  hasBody={true}
  bodyContent={<InvoiceDetails />}
/>
```

## 🧪 Testing Strategy

### Unit Tests
- Business logic funkce
- Utility funkce
- Validace

### Integration Tests
- API routes
- Database queries
- Server actions

### E2E Tests
- Kritické user flows
- Autentizace
- Hlavní features

## 📝 Code Review Checklist

Před merge PR zkontroluj:

- [ ] Je to Server Component, pokud to jde?
- [ ] Jsou data načítána paralelně?
- [ ] Je error handling implementovaný?
- [ ] Jsou loading states?
- [ ] Je validace na clientu I serveru?
- [ ] Je kód dokumentovaný?
- [ ] Jsou database queries optimalizované?
- [ ] Je bundle size rozumný?
- [ ] Je kód accessible?

## 🚀 Deployment Checklist

Před deployem:

- [ ] Všechny env variables jsou nastavené
- [ ] Database migrace jsou aplikované
- [ ] Build projde bez chyb
- [ ] Linter projde bez chyb
- [ ] Testy projdou
- [ ] Performance metrics jsou v pořádku
- [ ] Error tracking je nastavený
- [ ] Monitoring je nastavený

---

**Zapamatuj si**: Performance, jednoduchost a plná funkčnost nejsou "nice to have" - jsou to požadavky.

