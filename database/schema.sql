-- FKTR.cz Database Schema
-- Czech Invoicing Application
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Currency codes
DO $$ BEGIN
    CREATE TYPE currency_code AS ENUM ('CZK', 'EUR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- REFERENCE TABLES (Dictionary/Lookup Tables)
-- =====================================================

-- Invoice statuses
CREATE TABLE IF NOT EXISTS invoice_statuses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Insert default invoice statuses
INSERT INTO invoice_statuses (id, name, description) VALUES
  (1, 'draft', 'Koncept'),
  (2, 'sent', 'Odeslaná'),
  (3, 'paid', 'Zaplacená'),
  (4, 'canceled', 'Stornovaná'),
  (5, 'overdue', 'Po splatnosti'),
  (6, 'partial_paid', 'Částečně zaplacená')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Payment types
CREATE TABLE IF NOT EXISTS payment_types (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert default payment types
INSERT INTO payment_types (id, name) VALUES
  (1, 'Bankovní převod'),
  (2, 'Hotovost'),
  (3, 'Kreditní karta'),
  (4, 'Jiný')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Due terms (payment terms)
CREATE TABLE IF NOT EXISTS due_terms (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  days_count INTEGER NOT NULL
);

-- Insert default due terms
INSERT INTO due_terms (id, name, days_count) VALUES
  (1, '14 dní', 14),
  (2, '30 dní', 30),
  (3, '60 dní', 60),
  (4, '90 dní', 90)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  days_count = EXCLUDED.days_count;

-- Units (measurement units)
CREATE TABLE IF NOT EXISTS units (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL
);

-- Insert default units
INSERT INTO units (id, name, abbreviation) VALUES
  (1, 'Kus', 'ks'),
  (2, 'Hodina', 'hod'),
  (3, 'Kilogram', 'kg'),
  (4, 'Metr', 'm'),
  (5, 'Litr', 'l'),
  (6, 'Gram', 'g')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  abbreviation = EXCLUDED.abbreviation;

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Users (companies/user accounts)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id TEXT,
  billing_details JSONB DEFAULT '{"street": "", "house_number": "", "city": "", "zip": "", "country": "Česká republika"}'::jsonb,
  contact_website TEXT,
  contact_phone TEXT,
  contact_email TEXT UNIQUE NOT NULL,
  bank_account TEXT,
  password_hash TEXT NOT NULL,
  default_settings JSONB DEFAULT '{
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
  }'::jsonb,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(contact_email);

-- Clients (customers)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_id TEXT,
  address JSONB DEFAULT '{"street": "", "house_number": "", "city": "", "zip": "", "country": "Česká republika"}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  payment_type_id SMALLINT REFERENCES payment_types(id),
  due_term_id SMALLINT REFERENCES due_terms(id),
  currency currency_code DEFAULT 'CZK',
  total_amount NUMERIC(12, 2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  is_canceled BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  note TEXT,
  status_id BIGINT NOT NULL DEFAULT 1 REFERENCES invoice_statuses(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status_id ON invoices(status_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_is_deleted ON invoices(is_deleted);

-- Invoice items (line items)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 1,
  unit_id SMALLINT REFERENCES units(id),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update invoice total amount
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM invoice_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
  )
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate invoice total on item changes
DROP TRIGGER IF EXISTS trigger_update_invoice_total ON invoice_items;
CREATE TRIGGER trigger_update_invoice_total
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
  current_month INTEGER;
  next_sequence INTEGER;
  new_invoice_number TEXT;
BEGIN
  -- Only generate number when status changes to 'sent' (id = 2)
  IF NEW.status_id = 2 AND (OLD.status_id IS NULL OR OLD.status_id != 2) AND NEW.invoice_number IS NULL THEN
    current_year := EXTRACT(YEAR FROM NEW.issue_date);
    current_month := EXTRACT(MONTH FROM NEW.issue_date);
    
    -- Get the next sequence number for this user, year, and month
    SELECT COALESCE(MAX(
      CASE 
        WHEN invoice_number ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}$' 
        THEN CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
        ELSE 0
      END
    ), 0) + 1
    INTO next_sequence
    FROM invoices
    WHERE user_id = NEW.user_id
      AND invoice_number LIKE current_year || '-' || LPAD(current_month::TEXT, 2, '0') || '-%';
    
    -- Generate the invoice number (YYYY-MM-NNN)
    new_invoice_number := current_year || '-' || LPAD(current_month::TEXT, 2, '0') || '-' || LPAD(next_sequence::TEXT, 3, '0');
    NEW.invoice_number := new_invoice_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_paid based on payment_date and is_canceled
  NEW.is_paid := (NEW.payment_date IS NOT NULL) AND (NOT NEW.is_canceled);
  
  -- Auto-update status based on payment
  IF NEW.is_paid AND NEW.status_id != 3 THEN
    NEW.status_id := 3; -- Set to 'paid'
  ELSIF NEW.is_canceled AND NEW.status_id != 4 THEN
    NEW.status_id := 4; -- Set to 'canceled'
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update payment status
DROP TRIGGER IF EXISTS trigger_update_payment_status ON invoices;
CREATE TRIGGER trigger_update_payment_status
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();

-- Function to automatically set due date
CREATE OR REPLACE FUNCTION set_due_date()
RETURNS TRIGGER AS $$
DECLARE
  days_to_add INTEGER;
BEGIN
  -- If due_date is not set and due_term_id is provided, calculate it
  IF NEW.due_date IS NULL AND NEW.due_term_id IS NOT NULL THEN
    SELECT days_count INTO days_to_add
    FROM due_terms
    WHERE id = NEW.due_term_id;
    
    IF days_to_add IS NOT NULL THEN
      NEW.due_date := NEW.issue_date + (days_to_add || ' days')::INTERVAL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set due date
DROP TRIGGER IF EXISTS trigger_set_due_date ON invoices;
CREATE TRIGGER trigger_set_due_date
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_due_date();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Registered user accounts (companies)';
COMMENT ON TABLE clients IS 'Customer/client records per user';
COMMENT ON TABLE invoices IS 'Invoice headers with status workflow';
COMMENT ON TABLE invoice_items IS 'Line items for each invoice';
COMMENT ON TABLE invoice_statuses IS 'Invoice status reference table';
COMMENT ON TABLE payment_types IS 'Payment method reference table';
COMMENT ON TABLE due_terms IS 'Payment term reference table';
COMMENT ON TABLE units IS 'Measurement unit reference table';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens for user authentication';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Note: RLS is disabled for local development
-- Will be implemented later for production

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

