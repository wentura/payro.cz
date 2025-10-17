-- Migration: Subscription System
-- Adds user subscription tiers and invoice limits

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  invoice_limit_monthly INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, invoice_limit_monthly, features) VALUES
('Free', 'Základní plán pro začínající podnikatele', 0.00, 0.00, 4, '{"max_clients": 10, "max_invoices_per_month": 4, "basic_support": true}'),
('Pro', 'Profi plán pro rostoucí firmy', 29.00, 290.00, 0, '{"max_clients": 100, "max_invoices_per_month": 0, "priority_support": true, "advanced_reports": true}'),
('Business', 'Business plán pro větší společnosti', 99.00, 990.00, 0, '{"max_clients": 1000, "max_invoices_per_month": 0, "dedicated_support": true, "custom_branding": true, "api_access": true}')
ON CONFLICT DO NOTHING;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired, suspended
  billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice_usage table to track monthly usage
CREATE TABLE IF NOT EXISTS invoice_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  invoices_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoice_usage_user_period ON invoice_usage(user_id, year, month);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_usage ENABLE ROW LEVEL SECURITY;

-- Subscription plans are public (everyone can read)
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON invoice_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION get_user_current_plan(user_uuid UUID)
RETURNS TABLE (
  plan_id INTEGER,
  plan_name VARCHAR(50),
  invoice_limit_monthly INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as plan_id,
    sp.name as plan_name,
    sp.invoice_limit_monthly,
    sp.features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current month invoice count for user
CREATE OR REPLACE FUNCTION get_user_monthly_invoice_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COALESCE(invoices_created, 0)
  INTO current_count
  FROM invoice_usage
  WHERE user_id = user_uuid
    AND year = EXTRACT(YEAR FROM NOW())
    AND month = EXTRACT(MONTH FROM NOW());
  
  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment invoice usage
CREATE OR REPLACE FUNCTION increment_invoice_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO invoice_usage (user_id, year, month, invoices_created)
  VALUES (
    user_uuid,
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    1
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    invoices_created = invoice_usage.invoices_created + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create invoice
CREATE OR REPLACE FUNCTION can_user_create_invoice(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan RECORD;
  current_usage INTEGER;
BEGIN
  -- Get current plan
  SELECT * INTO current_plan FROM get_user_current_plan(user_uuid);
  
  -- If no active plan, default to free plan
  IF current_plan IS NULL THEN
    SELECT * INTO current_plan FROM subscription_plans WHERE name = 'Free' LIMIT 1;
  END IF;
  
  -- If unlimited (0), allow creation
  IF current_plan.invoice_limit_monthly = 0 THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  current_usage := get_user_monthly_invoice_count(user_uuid);
  
  -- Check if under limit
  RETURN current_usage < current_plan.invoice_limit_monthly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default subscription for existing users
INSERT INTO user_subscriptions (user_id, plan_id, current_period_start, current_period_end)
SELECT 
  u.id,
  sp.id,
  NOW(),
  NOW() + INTERVAL '1 month'
FROM users u
CROSS JOIN subscription_plans sp
WHERE sp.name = 'Free'
  AND u.id NOT IN (SELECT user_id FROM user_subscriptions);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_usage_updated_at
  BEFORE UPDATE ON invoice_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
