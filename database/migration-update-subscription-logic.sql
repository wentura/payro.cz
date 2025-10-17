-- Migration: Update subscription logic to use most recent subscription
-- This migration updates the get_user_current_plan function to return the most recent subscription
-- regardless of status, treating older subscriptions as history

-- Update the function to get the most recent subscription (not just active ones)
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

-- Add comment for documentation
COMMENT ON FUNCTION get_user_current_plan(UUID) IS 'Returns the most recent subscription plan for a user, regardless of status. Older subscriptions are treated as history.';
