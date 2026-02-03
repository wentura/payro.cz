-- Migration: Enable RLS for core tables and add policies
-- Goal: Enforce tenant isolation for production

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_status_history ENABLE ROW LEVEL SECURITY;

-- Users: can read/update/delete own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile" ON users
      FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- Clients: users manage own clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'clients'
      AND policyname = 'Users manage own clients'
  ) THEN
    CREATE POLICY "Users manage own clients" ON clients
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Invoices: users manage own invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND policyname = 'Users manage own invoices'
  ) THEN
    CREATE POLICY "Users manage own invoices" ON invoices
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Invoice items: users manage items only for own invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoice_items'
      AND policyname = 'Users manage own invoice items'
  ) THEN
    CREATE POLICY "Users manage own invoice items" ON invoice_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM invoices i
          WHERE i.id = invoice_items.invoice_id
            AND i.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM invoices i
          WHERE i.id = invoice_items.invoice_id
            AND i.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Password reset tokens: users can access own tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'password_reset_tokens'
      AND policyname = 'Users manage own password reset tokens'
  ) THEN
    CREATE POLICY "Users manage own password reset tokens" ON password_reset_tokens
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Email verification tokens: users can access own tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_verification_tokens'
      AND policyname = 'Users manage own email verification tokens'
  ) THEN
    CREATE POLICY "Users manage own email verification tokens" ON email_verification_tokens
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Subscription payments: users can view own payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_payments'
      AND policyname = 'Users can view own subscription payments'
  ) THEN
    CREATE POLICY "Users can view own subscription payments" ON subscription_payments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM user_subscriptions us
          WHERE us.id = subscription_payments.subscription_id
            AND us.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Subscription status history: users can view own history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_status_history'
      AND policyname = 'Users can view own subscription status history'
  ) THEN
    CREATE POLICY "Users can view own subscription status history" ON subscription_status_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM user_subscriptions us
          WHERE us.id = subscription_status_history.subscription_id
            AND us.user_id = auth.uid()
        )
      );
  END IF;
END $$;
