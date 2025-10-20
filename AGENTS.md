# Agent Rules for Faktury Next.js + Supabase Project

## Project Overview

This is a Czech invoicing application built with Next.js 15.5.4, React 19, Tailwind CSS v4, and Supabase PostgreSQL. The application manages invoices, clients, and provides multi-tenant functionality with Row Level Security.

## Tech Stack

- **Frontend**: Next.js 15.5.4 with App Router, React 19.1.0
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with direct connection (pg pool)
- **Authentication**: Manual authentication with bcrypt (email/password)
- **Language**: Czech localization

## Database Architecture

### Core Tables

- **users**: Company/user accounts with default settings, db: id(uuid), password_hash(text), created_at(timestamptz). name(text), company_id(text), billing_details(jsonb:zip, city, street, house_number, country), contact_website(text), contact_phone(text), contact_email(text), default_settings(jsonb:{
  "currency_id": "CZK",
  "fix_currency_rate": false,
  "language_id": "cs",
  "invoice_type_id": "regular",
  "unit_id": null,
  "due_term_id": null,
  "payment_type_id": null,
  "footer_text": "",
  "invoice_text": "",
  "remind_due_term_by_email": true
  })
- **clients**: Customer data (scoped per user), db table: id(uuid), user_id(uuid, f_key:users.id), name(text), company_id(text), address(jsonb:zip, city, street, house_number, country), contact_email(text), contact_phone(text), note(text), created_at(timestamptz)
- **invoices**: Invoice headers with status workflow, db: id(uuid), user_id(uuid, f_key:users.id), client_id(uuid, f_key:clients.id), invoice_number(text), status_id(int8, f_key:invoice_statuses.id), due_term_id(int2, f_key:due_terms.id), currency_code(text), total_price(numeric), created_at(timestamptz), id_deleted(boolean), issue_date(date), due_date(date), payment_date(date), note(text), payment_type_id(int2, f_key:payment_types.id), currency(currency_code), total_amount(numeric),note(text), status_id(int8, f_key:invoice_statuses.id)
- **invoice_items**: Line items for each invoice, db: id(uuid), invoice_id(uuid, f_key:invoices.id), order(int4), description(text), quantity(numeric), unit_id(int2, f_key:units.id), unit_price(numeric), created_at(timestamptz)
- **invoice_statuses**: Invoice statuses (draft, sent, paid, canceled, overdue, partial paid), db: id(int8), description(text)
- **units**: Unit types (ks, kg, hod, etc.), db: id(int2), name(text), abbreviation(text)
- **payment_types**: Payment types (bank transfer, cash, etc.), db: id(int2), name(text)
- **due_terms**: Payment due terms (14 days, 30 days, etc.), db table: id(int2), name(text), days(int4)
- **password_reset_tokens**: Password reset tokens, db: id(uuid), user_id(uuid, f_key:users.id), token(text), expires_at(timestamptz), created_at(timestamptz)

### Key Enums

- **currency_code**: 'CZK', 'EUR'
- **invoice_status**: 'draft', 'sent', 'paid', 'canceled', 'overdue', 'partial paid'
- **invoice_type**: 'regular', 'proforma', 'credit note', 'debit note'
- **language**: 'cs', 'en'
- **payment_type**: 'bank transfer', 'cash', 'credit card', 'other'
- **due_term**: '14 days', '30 days', '60 days', '90 days', '120 days', '180 days', '360 days'
- **unit**: 'ks', 'kg', 'hod', 'm', 'l', 'g'

### Business Logic Rules

#### User Management

- User can have multiple clients
- User can have multiple invoices for each client
- User can have multiple invoice items for each invoice
- User can have multiple password reset tokens

#### Invoice Numbering

- Auto-generated when status changes from `draft` to `sent`
- Format: YYYY-MM-NNN (e.g., 2025-01-001)
- Unique per user

#### Payment Status

- Automatically calculated via triggers
- `is_paid = (payment_date IS NOT NULL) AND (NOT is_canceled)`

#### Totals Calculation

- Updates automatically on invoice items changes, if invoice is changed, recalculate the total price

#### Multi-tenancy

- All data scoped by `user_id`
- Row Level Security (RLS) now disabled, for local development only, we be implement it later
- Users can only access their own data, and only their own data is visible

## Development Rules

### Code Organization

- Use Next.js App Router patterns (server components by default)
- Server components for data fetching and static content
- Client components for forms, real-time updates, user interactions
- Consistent naming: kebab-case for files, PascalCase for components
- Use supabase client / server actions for all database operations, npm package: @supabase/supabase-js

### Database Integration (Implemented)

- ✅ Manual authentication with bcrypt-hashed passwords in `password_hash` field
- ✅ Supabase client for all database operations (@supabase/supabase-js)
- ✅ Email/password authentication with magic links for password reset
- ✅ Bcrypt password hashing (10+ rounds)
- ✅ Proper error handling and loading states
- ✅ User-friendly error messages in Czech
- ✅ All data scoped by `user_id` for multi-tenancy
- ✅ Row Level Security (RLS) disabled for development
- ✅ Session management with HTTP-only cookies

### Czech Localization (Implemented)

- ✅ **Date formats**: DD.MM.YYYY for display (formatDateCZ utility)
- ✅ **Number formats**: Czech locale for currency and numbers (formatCurrency, formatNumber)
- ✅ **Business rules**: Czech invoicing regulations compliance
- ✅ **UI Language**: Czech labels and messages throughout
- ✅ **Currency**: CZK primary support
- ✅ **SPAYD QR codes**: Czech payment standard integration
- ✅ **IČO validation**: Czech company ID format validation
- ✅ **Czech banking**: IBAN conversion for payment QR codes

### Form Validation

- Validate Czech business rules (IČO format, dates, etc.)
- Proper currency input handling
- Required field validation
- Business logic validation (dates, amounts, etc.)

### Performance & UX

- Optimize images with Next.js Image component
- Implement proper loading states and error boundaries
- Consider mobile responsiveness
- Use server components when possible for better performance, use server actions for all database operations, npm package: @supabase/supabase-js

### Security & Best Practices (Implemented)

- ✅ Manual row-level security in SQL queries (WHERE user_id = $1)
- ✅ Supabase client for all database operations
- ✅ Zod validation schemas for all forms
- ✅ Client-side and server-side validation
- ✅ Bcrypt password hashing (10+ rounds)
- ✅ HTTP-only cookie session management
- ✅ User data scoping (multi-tenancy)
- ✅ Error boundaries and proper error handling
- ✅ Accessible code (a11y) with proper ARIA labels
- ✅ Comprehensive code comments and documentation
- ✅ Security best practices implemented
- ✅ Password hashes never exposed in API responses
- ✅ Admin access restricted by email verification
- ✅ Protected routes with middleware
- ✅ Suspense boundaries for client components

## Key Features (Implemented)

### ✅ Core Functionality (Complete)

1. **✅ User Management**:

   - Registration with email/password validation
   - Login with session management
   - Profile settings with company information
   - Password reset with magic links
   - Admin panel (email-restricted access)

2. **✅ Client Management**:

   - Full CRUD operations for customers
   - Company information and contact details
   - Address management (JSONB structure)

3. **✅ Invoice Management**:

   - Create invoices with multiple items
   - Edit draft invoices
   - Status workflow: draft → sent → paid/unpaid/canceled
   - Automatic invoice numbering (YYYY-NNNN format)
   - Due date calculation

4. **✅ Invoice Items**:

   - Add/remove line items with automatic calculations
   - Unit management (ks, kg, hod, etc.)
   - Price per unit with quantity calculations
   - Automatic total calculation

5. **✅ Dashboard**:

   - Overview statistics (total, paid, unpaid, overdue invoices)
   - Revenue tracking
   - Client count
   - Recent invoices list
   - Quick action buttons

6. **✅ Print Functionality**:
   - Swiss grid design for professional invoices
   - Black/white optimized for printing
   - SPAYD QR code integration for Czech payments
   - A4 format with proper margins

### ✅ Advanced Features (Implemented)

1. **✅ SPAYD QR Codes**:

   - Czech standard payment QR codes
   - IBAN conversion from Czech account numbers
   - Automatic checksum calculation
   - Integration with Czech banking apps

2. **✅ Czech Localization**:

   - Czech date formats (DD.MM.YYYY)
   - Currency formatting (CZK)
   - Czech labels and messages
   - IČO validation

3. **✅ Admin Panel**:

   - User listing with invoice statistics
   - Revenue tracking across all users
   - Registration date monitoring
   - Email-restricted access (svoboda.zbynek@gmail.com)

4. **✅ Print System**:
   - Browser-based printing (replaced PDF generation)
   - Professional Swiss grid layout
   - Print-optimized CSS
   - SPAYD QR code integration

### 🔄 Future Enhancements

1. **📧 Email Notifications**:

   - Payment reminders
   - Invoice sending via email
   - Integration with resend.com

2. **💱 Multi-currency**:

   - Support for EUR alongside CZK
   - Currency conversion rates

3. **🔄 Recurring Invoices**:

   - Automated recurring billing
   - Schedule management

4. **📊 Advanced Reports**:
   - Detailed revenue reports
   - Client summaries
   - Export functionality

## File Structure (Current Implementation)

```
app/
├── layout.jsx              # Root layout (no navigation)
├── globals.css             # Global styles with print support
├── favicon.ico             # App favicon
├── (public)/               # Public pages route group
│   ├── layout.jsx         # Public layout with PublicNav
│   ├── page.jsx           # Landing page
│   ├── login/page.js      # Login page
│   ├── register/page.js   # Registration page
│   └── reset-password/    # Password reset pages
│       ├── page.js        # Request reset
│       └── [token]/page.js # Reset with token
├── admin/page.js          # Admin panel (email-restricted)
├── dashboard/page.js       # Main dashboard
├── clients/               # Client management
│   ├── page.js           # Client list
│   ├── new/page.js       # Create client
│   └── [id]/page.js      # Edit client
├── invoices/             # Invoice management
│   ├── page.js           # Invoice list
│   ├── new/page.js       # Create invoice
│   └── [id]/            # Invoice details
│       ├── page.js       # View invoice
│       ├── edit/page.js  # Edit invoice
│       └── print/        # Print functionality
│           ├── page.js   # Print view
│           └── PrintButton.js # Print trigger
├── settings/             # User settings
│   ├── page.js          # Settings page
│   └── SettingsForm.js  # Settings form component
├── api/                  # API routes
│   ├── auth/            # Authentication endpoints
│   ├── clients/         # Client CRUD
│   ├── invoices/        # Invoice CRUD & status
│   ├── user/profile/    # User profile management
│   └── reference data   # Units, payment types, etc.
├── components/          # Reusable components
│   ├── Layout.js        # Authenticated layout
│   ├── PublicNav.js     # Public navigation
│   ├── SPAYDQRCode.js   # Czech payment QR codes
│   └── ui/              # Basic UI components
│       ├── Badge.js
│       ├── Button.js
│       ├── Card.js
│       ├── Input.js
│       ├── Modal.js
│       ├── Select.js
│       └── Textarea.js
└── lib/                 # Utilities and configurations
    ├── auth.js          # Authentication logic
    ├── supabase.js      # Supabase client
    ├── utils.js         # Helper functions
    ├── validations.js   # Form validations
    ├── spayd.js         # SPAYD QR code logic
    └── payment-qr.js    # Payment QR utilities
```

## Communication Guidelines

- Always explain what I'm doing and why
- Ask for clarification when requirements are unclear
- Provide alternatives when there are multiple approaches
- Make incremental, focused changes
- Test changes before presenting them
- Document complex logic or business rules

## Error Handling

- Implement proper error boundaries
- Show user-friendly error messages in Czech
- Log errors for debugging
- Handle network failures gracefully
- Validate data on both client and server side

## Testing Strategy

- Unit tests for business logic
- Integration tests for API routes
- E2E tests for critical user flows
- Test Czech localization and currency formatting
- Test RLS policies and multi-tenancy

## Deployment (Production Ready)

### ✅ Environment Configuration

- Environment variables in `.env.local`: SUPABASE_URL, SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL
- Netlify configuration with `netlify.toml`
- `.npmrc` with `legacy-peer-deps=true` for dependency resolution

### ✅ Build Optimization

- Next.js 15.5.4 with App Router optimization
- Static page generation where possible
- Bundle size optimization (~102-112 kB per page)
- Build successful with 32 routes

### ✅ Database Setup

- Complete PostgreSQL schema with all tables and relationships
- Reference data seeding (invoice statuses, payment types, units, due terms)
- Database triggers for automatic calculations
- Migration scripts for schema updates

### ✅ Production Features

- Print functionality (replaces PDF generation)
- SPAYD QR code generation
- Czech localization complete
- Admin panel with user management
- Responsive design for mobile/desktop
- Error handling and loading states

---

## domain name

fktr.cz

## MVP Features (Complete)

FKTR.cz – verze 1.0 (MVP) ✅ **PRODUCTION READY**

### DB Schema

# AGENT.md — Database Schema for Payro (Invoices App)

This schema defines all tables, relations, and data types for the Payro invoicing application (Next.js + Supabase).

---

## 🧑‍💼 users

Stores registered user accounts and their business information.

| Column           | Type        | Description                                    |
| ---------------- | ----------- | ---------------------------------------------- |
| id               | uuid (PK)   | Unique identifier                              |
| name             | text        | User’s name                                    |
| company_id       | text        | Company registration / ICO                     |
| billing_details  | jsonb       | Invoice header details (address, tax ID, etc.) |
| contact_website  | text        | Website URL                                    |
| contact_phone    | text        | Phone number                                   |
| contact_email    | text        | Email address                                  |
| password_hash    | text        | Bcrypt hashed password                         |
| default_settings | jsonb       | Default values for new invoices                |
| last_login       | timestamptz | Last login timestamp                           |
| created_at       | timestamptz | Account creation date                          |
| address          | jsonb       | Address object (street, city, ZIP, country)    |

---

## 👥 clients

Holds clients (customers) per user.

| Column        | Type                 | Description               |
| ------------- | -------------------- | ------------------------- |
| id            | uuid (PK)            | Primary key               |
| user_id       | uuid (FK → users.id) | Owner user                |
| name          | text                 | Client name               |
| company_id    | text                 | Company ID / ICO          |
| address       | jsonb                | Address (structured JSON) |
| contact_email | text                 | Email                     |
| contact_phone | text                 | Phone                     |
| note          | text                 | Internal note             |
| created_at    | timestamptz          | Record creation time      |

---

## 🧾 invoices

Contains issued invoices.

| Column          | Type                            | Description               |
| --------------- | ------------------------------- | ------------------------- |
| id              | uuid (PK)                       | Primary key               |
| user_id         | uuid (FK → users.id)            | Invoice author            |
| client_id       | uuid (FK → clients.id)          | Linked client             |
| invoice_number  | text                            | Invoice number            |
| issue_date      | date                            | Date of issue             |
| due_date        | date                            | Due date                  |
| payment_date    | date                            | Payment date              |
| payment_type_id | int2 (FK → payment_types.id)    | Payment method            |
| due_term_id     | int2 (FK → due_terms.id)        | Payment term              |
| currency        | currency_code                   | Currency (CZK, EUR, etc.) |
| total_amount    | numeric                         | Total amount              |
| is_paid         | bool                            | Paid flag                 |
| is_canceled     | bool                            | Canceled flag             |
| is_deleted      | bool                            | Soft-delete flag          |
| note            | text                            | Note or description       |
| created_at      | timestamptz                     | Creation timestamp        |
| status_id       | int8 (FK → invoice_statuses.id) | Current status            |

---

## 💵 invoice_items

Individual invoice line items.

| Column       | Type                    | Description      |
| ------------ | ----------------------- | ---------------- |
| id           | uuid (PK)               | Primary key      |
| invoice_id   | uuid (FK → invoices.id) | Parent invoice   |
| order_number | int4                    | Line order       |
| description  | text                    | Item description |
| quantity     | numeric                 | Number of units  |
| unit_id      | int2 (FK → units.id)    | Measurement unit |
| unit_price   | numeric                 | Price per unit   |

---

## 📏 units

Measurement units for invoice items.

| Column       | Type      | Description                       |
| ------------ | --------- | --------------------------------- |
| id           | int2 (PK) | Primary key                       |
| name         | text      | Full unit name (e.g., hours, pcs) |
| abbreviation | text      | Short code (e.g., h, ks)          |

---

## 💳 payment_types

Types of payment methods.

| Column | Type      | Description                                   |
| ------ | --------- | --------------------------------------------- |
| id     | int2 (PK) | Primary key                                   |
| name   | text      | Payment type name (e.g., Bank transfer, Cash) |

---

## 🕓 due_terms

Defines available payment terms.

| Column     | Type      | Description                 |
| ---------- | --------- | --------------------------- |
| id         | int2 (PK) | Primary key                 |
| name       | text      | Label (e.g., “14 days”)     |
| days_count | int4      | Number of days for due date |

---

## 📦 invoice_statuses

Possible invoice states (draft, issued, paid, etc.).

| Column      | Type      | Description           |
| ----------- | --------- | --------------------- |
| id          | int8 (PK) | Primary key           |
| name        | text      | Status name           |
| description | text      | Optional note/meaning |

---

## 🔐 password_reset_tokens

Temporary tokens for password reset flow.

| Column     | Type                 | Description          |
| ---------- | -------------------- | -------------------- |
| id         | uuid (PK)            | Primary key          |
| user_id    | uuid (FK → users.id) | Related user         |
| token      | varchar              | Unique reset token   |
| expires_at | timestamptz          | Expiration timestamp |
| created_at | timestamptz          | Creation timestamp   |

---

## 🔗 Relationships

- **users → clients** (1:N)
- **users → invoices** (1:N)
- **clients → invoices** (1:N)
- **invoices → invoice_items** (1:N)
- **invoices → invoice_statuses, payment_types, due_terms**
- **invoice_items → units**
- **password_reset_tokens → users** (N:1)

---

## Notes for Cursor

- All UUIDs auto-generate using `gen_random_uuid()`.
- All timestamps use UTC (`timestamptz`).
- JSONB fields are used for structured data (address, billing, defaults).
- Foreign keys cascade on delete where appropriate (`invoice_items`, `clients`, etc.).
- Passwords are stored using bcrypt (`$2b$` format).

---
