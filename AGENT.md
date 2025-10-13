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
- **invoice_items**: Line items for each invoice, db: id(uuid), invoice_id(uuid, f_key:invoices.id), order(int4), description(text), quantity(numeric), unit_id(int2, f_key:units.id), price_per_unit(numeric), created_at(timestamptz)
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
- Format: YYYY-NNNNN (e.g., 2025-0001)
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

### Database Integration

- Manual authentication with bcrypt-hashed passwords in `password_hash` field
- for data operations use supabase client / server actions for all database operations, npm package: @supabase/supabase-js, for authentication use simple email/password authentication (magic links for reset password), bcrypt for password hashing, we use simple email/password authentication for now, because we don't need to use more complex authentication like OAuth, SSO, etc.
- Implement proper error handling and loading states, use proper error messages, and loading states, and handle all errors, and show them to the user
- All data scoped by `user_id` for multi-tenancy, and only their own data is visible

### Czech Localization

- **Date formats**: DD.MM.YYYY for display
- **Number formats**: Czech locale for currency and numbers
- **Business rules**: Czech invoicing regulations compliance
- **UI Language**: Czech labels and messages
- **Currency**: Primary CZK, support EUR

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

### Security & Best Practices

- Implement manual row-level security in SQL queries (WHERE user_id = $1), use supabase client / server actions for all database operations, npm package: @supabase/supabase-js
- Validate all user inputs on both client and server
- Use bcrypt for password hashing (10+ rounds)
- Secure session management (TODO: implement JWT or sessions), in local development show logged user data (name, email, company_id in footer), in production show only email and company_id in footer
- Implement proper error boundaries
- Write accessible code (a11y), comment all code, and describe all business logic in comments for better understanding and maintenance
- Follow security best practices
- Never expose password hashes in API responses

## Key Features to Implement

### Core Functionality

1. **User Management**: Registration, login (email/password), profile settings, password reset with magic links
2. **Client Management**: CRUD operations for customers
3. **Invoice Management**: Create, edit, send, mark as paid / unpaid / canceled / overdue / partial paid
4. **Invoice Items**: Add/remove line items with calculations, invoice can have multiple items and total price is calculated from all items (invoice_items table f_key to invoices table)
5. **Dashboard**: Overview of invoices, overdue payments
6. **Reports**: Revenue, unpaid invoices, client summaries

### Advanced Features

1. **PDF Generation**: Invoice PDF export, use npm package: @react-pdf/renderer
2. **Email Notifications**: Payment reminders, invoice sending, now just download the PDF and send it by email manually by client email, in future will be resend.com implemeted for sending emails.
3. **Multi-currency**: Support for EUR alongside CZK (now just CZK is supported)
4. **Invoice Templates**: Customizable invoice layouts (as fo PDF), now just basic invoice layout is implemented
5. **Recurring Invoices**: Automated recurring billing
6. **Payment Tracking**: user will track the payments by himself, now just manual tracking in database

## File Structure Guidelines

```
app/
├── login/                 # Authentication pages
├── dashboard/              # Main dashboard
├── clients/                # Client management
├── invoices/               # Invoice management
├── settings/               # User settings
├── api/                    # API routes
├── components/             # Reusable components
│   ├── ui/                 # Basic UI components
│   ├── forms/              # Form components
│   └── invoices/           # Invoice-specific components
└── lib/                    # Utilities and configurations
    ├── supabase.js         # Supabase client
    ├── validations.js      # Form validations
    └── utils.js            # Helper functions
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

## Deployment Considerations

- Environment variables for Supabase configuration in .env.local file SUPABASE_URL, SUPABASE_ANON_KEY
- Proper build optimization for production
- Database migrations and seed data, use supabase client / server actions for all database operations, npm package: @supabase/supabase-js
- Error monitoring and logging
- Performance monitoring$

---

## domain name

payro.cz

## MVP Features

Payro.cz – verze 1.0 (MVP)

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
