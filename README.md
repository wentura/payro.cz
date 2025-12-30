# FKTR.cz - Czech Invoicing Application

A modern invoicing application built with Next.js 15, React 19, Tailwind CSS v4, and Supabase PostgreSQL. Designed specifically for Czech market with full Czech localization.

## 🚀 Features

- **User Authentication**: Email/password authentication with bcrypt
- **Client Management**: Full CRUD operations for managing clients/customers
- **Invoice Management**: Create, edit, and manage invoices with multiple statuses
- **Invoice Items**: Add multiple line items with automatic calculations
- **Dashboard**: Overview with statistics and recent invoices
- **Czech Localization**: Date formats (DD.MM.YYYY), currency (CZK), Czech labels
- **Multi-tenancy**: Each user has isolated data with row-level security
- **Status Workflow**: Draft → Sent → Paid/Canceled workflow
- **Automatic Invoice Numbering**: Format YYYY-MM-NNN (e.g., 2025-01-001)

## 📋 Tech Stack

- **Frontend**: Next.js 15.5.4 with App Router, React 19.1.0
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Manual bcrypt-based authentication
- **State Management**: React Hooks
- **Forms**: react-hook-form + Zod validation
- **Date Handling**: date-fns with Czech locale

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database (via Supabase)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fktr.cz
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to React 19 compatibility with some packages.

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key_here
```

### 4. Set Up Database

1. Create a new project in [Supabase](https://supabase.com)
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL Editor
3. This will create all necessary tables, triggers, and reference data

The schema includes:

- `users` - User accounts with company details
- `clients` - Customer records
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items
- `invoice_statuses` - Status reference table
- `payment_types` - Payment method reference
- `due_terms` - Payment term reference
- `units` - Measurement unit reference
- `password_reset_tokens` - Password reset functionality

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
fktr.cz/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── clients/      # Client CRUD endpoints
│   │   ├── invoices/     # Invoice endpoints
│   │   └── user/         # User profile endpoints
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── Layout.js     # Main layout wrapper
│   ├── lib/              # Utilities and configurations
│   │   ├── auth.js       # Authentication functions
│   │   ├── supabase.js   # Supabase client
│   │   ├── utils.js      # Helper functions
│   │   └── validations.js # Form validation schemas
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── dashboard/        # Dashboard page
│   ├── clients/          # Client management pages
│   ├── invoices/         # Invoice management pages
│   ├── settings/         # User settings page
│   ├── layout.js         # Root layout
│   └── page.js           # Root page (redirects)
├── database/
│   └── schema.sql        # Database schema
├── middleware.js         # Route protection
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed with bcrypt (10 rounds)
3. Session is stored in HTTP-only cookie
4. Middleware protects routes and redirects unauthenticated users

## 💼 Business Logic

### Invoice Numbering

- Auto-generated when status changes from "draft" to "sent"
- Format: `YYYY-MM-NNN` (e.g., 2025-01-001)
- Unique per user, year, and month

### Invoice Statuses

1. **Koncept (Draft)** - Initial state
2. **Odeslaná (Sent)** - Invoice sent to client
3. **Zaplacená (Paid)** - Payment received
4. **Stornovaná (Canceled)** - Invoice canceled
5. **Po splatnosti (Overdue)** - Past due date
6. **Částečně zaplacená (Partial Paid)** - Partial payment

### Automatic Calculations

- Invoice total is automatically calculated from items
- Due date is calculated from issue date + due term
- Triggers handle status updates

## 🌍 Czech Localization

- **Date Format**: DD.MM.YYYY (e.g., 31.12.2025)
- **Currency**: Primary CZK (Czech Koruna), EUR supported
- **Number Format**: Czech locale (1 234,56)
- **UI Language**: All labels and messages in Czech
- **Business Rules**: Czech invoicing compliance

## 🚧 Known Limitations & Future Features

- [ ] PDF Generation (awaiting React 19 support in @react-pdf/renderer)
- [ ] Email notifications for invoices
- [ ] Recurring invoices
- [ ] Multi-currency exchange rates
- [ ] Advanced reporting and analytics
- [ ] Export to CSV/Excel
- [ ] Row Level Security in production

## 🔧 Development

### Running Linter

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

When updating schema:

1. Modify `database/schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Test thoroughly in development

## 📝 License

This project is proprietary software for FKTR.cz.

## 🤝 Contributing

This is a private project. Contact the maintainers for contribution guidelines.

## 📧 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ in Czech Republic**
