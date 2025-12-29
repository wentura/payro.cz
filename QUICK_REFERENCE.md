# Quick Reference - Next.js Best Practices

Rychlý referenční průvodce pro běžné scénáře.

## 🚀 Server vs Client Component

### Server Component (default)
```javascript
// ✅ app/page.js
export default async function Page() {
  const data = await fetchData();
  return <ClientForm data={data} />;
}
```

### Client Component (pouze když nutné)
```javascript
// ✅ app/components/Form.js
"use client";
export default function Form({ data }) {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

## 📊 Data Fetching Patterns

### Paralelní fetching
```javascript
// ✅ DOBRÉ
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
]);
```

### Caching
```javascript
// ✅ Pro statická data
import { unstable_cache } from 'next/cache';

export const getData = unstable_cache(
  async () => fetchFromDB(),
  ['cache-key'],
  { revalidate: 3600 }
);
```

## 🎨 Component Patterns

### Server Page + Client Form
```javascript
// page.js (Server)
export default async function Page() {
  const data = await getData();
  return <Form data={data} />;
}

// Form.js (Client)
"use client";
export default function Form({ data }) {
  // Form logic here
}
```

### Layout rozdělení
```javascript
// ServerLayout.js (Server)
export default async function ServerLayout({ children }) {
  const user = await getCurrentUser();
  return <Layout user={user}>{children}</Layout>;
}

// Layout.js (Client - pouze interaktivní části)
"use client";
export default function Layout({ children, user }) {
  return (
    <NavigationProvider>
      <nav><ClientNavigation /></nav>
      <main>{children}</main>
    </NavigationProvider>
  );
}
```

## ⚡ Performance

### Dynamic Imports
```javascript
// ✅ Lazy load
const Modal = dynamic(() => import('./Modal'), { ssr: false });
```

### Database Indexy
```sql
-- ✅ Composite index
CREATE INDEX idx_table_user_status 
  ON table(user_id, status_id) 
  WHERE is_deleted = false;
```

## 🔒 Security

### Multi-tenancy
```javascript
// ✅ VŽDY scope podle user_id
.eq('user_id', userId)
```

### Validace
```javascript
// ✅ Zod schema
const schema = z.object({ ... });
const validated = schema.parse(data);
```

## ✅ Checklist

- [ ] Server Component?
- [ ] Paralelní fetching?
- [ ] Caching pro statická data?
- [ ] Error handling?
- [ ] Loading states?
- [ ] Validace client + server?
- [ ] Database indexy?
- [ ] Bundle size OK?

---

Více detailů v `.cursorrules` a `DEVELOPMENT_GUIDELINES.md`

