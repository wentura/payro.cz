# FKTR.cz - Quick Setup Guide

This guide will help you get the FKTR.cz invoicing application up and running quickly.

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the database to initialize (~2 minutes)

### Step 3: Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run**

This will create all tables, triggers, and populate reference data.

### Step 4: Get Your Supabase Credentials

1. In Supabase, go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Create Environment File

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎉 First Steps in the App

1. **Register**: Click "Zaregistrujte se" and create your account
2. **Complete Profile**: Go to Settings and fill in your company details
3. **Add First Client**: Navigate to Klienti → + Nový klient
4. **Create Invoice**: Go to Faktury → + Nová faktura

## 📊 Database Schema Overview

The application creates these main tables:

- **users** - Your account and company info
- **clients** - Your customers
- **invoices** - Invoice headers
- **invoice_items** - Invoice line items
- **invoice_statuses** - Status lookup (Draft, Sent, Paid, etc.)
- **payment_types** - Payment methods (Bank transfer, Cash, etc.)
- **due_terms** - Payment terms (14 days, 30 days, etc.)
- **units** - Measurement units (ks, hod, kg, etc.)

## 🔧 Troubleshooting

### "Cannot connect to database"

- Check your `.env.local` file
- Verify Supabase credentials are correct
- Ensure database schema was run successfully

### "Module not found" errors

- Run `npm install --legacy-peer-deps` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### "Unauthorized" on API calls

- Clear browser cookies
- Log out and log in again
- Check that session cookie is being set

### Database errors

- Verify all tables were created correctly
- Check Supabase logs in dashboard
- Ensure RLS is disabled (for development)

## 🚀 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your domain)
4. Deploy

### Environment Setup

Production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NEXT_PUBLIC_APP_URL=https://fktr.cz
```

### Security Considerations

For production:

1. Enable Row Level Security (RLS) in Supabase
2. Set up proper RLS policies per user
3. Use secure session configuration
4. Enable HTTPS only
5. Configure CORS properly
6. Set up database backups

## 📝 Default Reference Data

After running the schema, you'll have:

**Payment Terms:**

- 14 dní (14 days)
- 30 dní (30 days)
- 60 dní (60 days)
- 90 dní (90 days)

**Payment Types:**

- Bankovní převod
- Hotovost
- Kreditní karta
- Jiný

**Units:**

- ks (kus)
- hod (hodina)
- kg (kilogram)
- m (metr)
- l (litr)
- g (gram)

**Invoice Statuses:**

- Koncept (Draft)
- Odeslaná (Sent)
- Zaplacená (Paid)
- Stornovaná (Canceled)
- Po splatnosti (Overdue)
- Částečně zaplacená (Partial Paid)

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review AGENT.md for technical specifications
- Check Supabase logs for database errors
- Verify all environment variables are set correctly

## 🎯 What's Next?

After setup, you can:

- Customize invoice templates
- Add more payment types or units
- Configure email notifications (future)
- Set up automated backups
- Add team members (multi-user support)

---

**Happy invoicing! 🚀**
