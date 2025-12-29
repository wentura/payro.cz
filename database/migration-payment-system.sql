-- Migration: Payment System for Subscription Upgrades
-- Description: Adds payment tracking and subscription status management

-- Note: The existing schema uses VARCHAR(20) for status, not an enum type
-- Valid statuses: 'active', 'cancelled', 'expired', 'suspended', 'pending_payment', 'payment_failed'

-- Create subscription payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CZK',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    processor_response JSONB,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_created_at ON subscription_payments(created_at);

-- Create subscription status history table
CREATE TABLE IF NOT EXISTS subscription_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create index for subscription status history
CREATE INDEX IF NOT EXISTS idx_subscription_status_history_subscription_id ON subscription_status_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status_history_created_at ON subscription_status_history(created_at);

-- Add updated_at trigger for subscription_payments
CREATE OR REPLACE FUNCTION update_subscription_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_payments_updated_at ON subscription_payments;
CREATE TRIGGER trigger_update_subscription_payments_updated_at
    BEFORE UPDATE ON subscription_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_payments_updated_at();

-- Function to log subscription status changes
CREATE OR REPLACE FUNCTION log_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO subscription_status_history (
            subscription_id,
            old_status,
            new_status,
            reason,
            created_at
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'Status changed via application',
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription status logging (drop first if exists)
DROP TRIGGER IF EXISTS trigger_log_subscription_status_change ON user_subscriptions;
CREATE TRIGGER trigger_log_subscription_status_change
    AFTER UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_status_change();

-- Function to get subscription payment summary
CREATE OR REPLACE FUNCTION get_subscription_payment_summary(subscription_uuid UUID)
RETURNS TABLE (
    total_payments NUMERIC,
    successful_payments NUMERIC,
    failed_payments NUMERIC,
    last_payment_date TIMESTAMPTZ,
    last_payment_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::NUMERIC as total_payments,
        COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC as successful_payments,
        COUNT(*) FILTER (WHERE status = 'failed')::NUMERIC as failed_payments,
        MAX(processed_at) as last_payment_date,
        MAX(amount) FILTER (WHERE status = 'completed') as last_payment_amount
    FROM subscription_payments
    WHERE subscription_id = subscription_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can upgrade to plan
CREATE OR REPLACE FUNCTION can_user_upgrade_to_plan(user_uuid UUID, target_plan_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan_id INTEGER;
    target_plan_price_monthly NUMERIC;
BEGIN
    -- Get current plan
    SELECT us.plan_id INTO current_plan_id
    FROM user_subscriptions us
    WHERE us.user_id = user_uuid AND us.status = 'active'
    LIMIT 1;
    
    -- If no current subscription, user can upgrade to any plan
    IF current_plan_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Get target plan price
    SELECT price_monthly INTO target_plan_price_monthly
    FROM subscription_plans
    WHERE id = target_plan_id;
    
    -- User can upgrade if target plan is more expensive or same price
    -- (preventing downgrades through upgrade endpoint)
    RETURN target_plan_price_monthly >= (
        SELECT price_monthly 
        FROM subscription_plans 
        WHERE id = current_plan_id
    );
END;
$$ LANGUAGE plpgsql;

-- Update subscription plans with correct pricing
UPDATE subscription_plans SET 
    name = 'Free',
    description = 'Základní bezplatný plán',
    price_monthly = 0,
    price_yearly = 0,
    invoice_limit_monthly = 4,
    features = '{"max_clients": 10, "basic_support": true}',
    is_active = true
WHERE id = 1;

UPDATE subscription_plans SET 
    name = 'Pro',
    description = 'Profesionální plán - za jedno espresso měsíčně',
    price_monthly = 55,
    price_yearly = 550,
    invoice_limit_monthly = 0,
    features = '{"max_clients": 0, "priority_support": true}',
    is_active = true
WHERE id = 2;

-- Insert Business plan if it doesn't exist
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, invoice_limit_monthly, features, is_active)
VALUES 
    (3, 'Business', 'Firemní plán', 199, 1990, 0, '{"max_clients": 0, "priority_support": true, "api_access": true}', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    invoice_limit_monthly = EXCLUDED.invoice_limit_monthly,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- Create view for subscription analytics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    sp.id as plan_id,
    sp.name as plan_name,
    sp.price_monthly,
    sp.price_yearly,
    COUNT(us.id) as total_subscriptions,
    COUNT(us.id) FILTER (WHERE us.status = 'active') as active_subscriptions,
    COUNT(us.id) FILTER (WHERE us.status = 'canceled') as canceled_subscriptions,
    COUNT(us.id) FILTER (WHERE us.status = 'pending_payment') as pending_subscriptions,
    SUM(
        CASE 
            WHEN us.status = 'active' AND us.billing_cycle = 'monthly' THEN sp.price_monthly
            WHEN us.status = 'active' AND us.billing_cycle = 'yearly' THEN sp.price_yearly
            ELSE 0
        END
    ) as monthly_revenue,
    AVG(
        CASE 
            WHEN us.status = 'active' THEN 
                CASE us.billing_cycle
                    WHEN 'monthly' THEN sp.price_monthly
                    WHEN 'yearly' THEN sp.price_yearly / 12
                END
            ELSE NULL
        END
    ) as avg_monthly_revenue_per_user
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.price_monthly, sp.price_yearly;

-- Add comments for documentation
COMMENT ON TABLE subscription_payments IS 'Tracks all subscription payments and transactions';
COMMENT ON TABLE subscription_status_history IS 'Audit trail for subscription status changes';
COMMENT ON FUNCTION get_subscription_payment_summary(UUID) IS 'Returns payment summary for a subscription';
COMMENT ON FUNCTION can_user_upgrade_to_plan(UUID, INTEGER) IS 'Checks if user can upgrade to specified plan';
COMMENT ON VIEW subscription_analytics IS 'Analytics view for subscription metrics and revenue';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON subscription_payments TO authenticated;
-- GRANT SELECT ON subscription_status_history TO authenticated;
-- GRANT SELECT ON subscription_analytics TO authenticated;
