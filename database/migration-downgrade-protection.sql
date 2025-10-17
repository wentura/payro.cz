-- Migration: Add downgrade protection for subscription changes
-- This prevents users from being downgraded to plans with lower limits
-- if they have already exceeded those limits

-- Function to check if user can be downgraded to a target plan
CREATE OR REPLACE FUNCTION can_user_downgrade_to_plan(user_uuid UUID, target_plan_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    target_plan RECORD;
    current_usage INTEGER;
    current_month INTEGER;
    current_year INTEGER;
BEGIN
    -- Get target plan details
    SELECT * INTO target_plan
    FROM subscription_plans
    WHERE id = target_plan_id;
    
    -- If target plan doesn't exist, deny downgrade
    IF target_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- If target plan has unlimited invoices (0 = unlimited), allow downgrade
    IF target_plan.invoice_limit_monthly = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Get current month and year
    current_month := EXTRACT(MONTH FROM NOW());
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Get current month's invoice usage
    SELECT COALESCE(invoices_created, 0) INTO current_usage
    FROM invoice_usage
    WHERE user_id = user_uuid
      AND year = current_year
      AND month = current_month;
    
    -- Allow downgrade only if current usage is within target plan limits
    RETURN current_usage <= target_plan.invoice_limit_monthly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get downgrade protection details
CREATE OR REPLACE FUNCTION get_downgrade_protection_info(user_uuid UUID, target_plan_id INTEGER)
RETURNS TABLE (
    can_downgrade BOOLEAN,
    current_usage INTEGER,
    target_limit INTEGER,
    over_limit_by INTEGER,
    reason TEXT
) AS $$
DECLARE
    target_plan RECORD;
    current_usage INTEGER;
    current_month INTEGER;
    current_year INTEGER;
BEGIN
    -- Get target plan details
    SELECT * INTO target_plan
    FROM subscription_plans
    WHERE id = target_plan_id;
    
    -- Get current month and year
    current_month := EXTRACT(MONTH FROM NOW());
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Get current month's invoice usage
    SELECT COALESCE(invoices_created, 0) INTO current_usage
    FROM invoice_usage
    WHERE user_id = user_uuid
      AND year = current_year
      AND month = current_month;
    
    -- If target plan doesn't exist
    IF target_plan IS NULL THEN
        RETURN QUERY SELECT FALSE, current_usage, 0, 0, 'Target plan does not exist';
        RETURN;
    END IF;
    
    -- If target plan has unlimited invoices
    IF target_plan.invoice_limit_monthly = 0 THEN
        RETURN QUERY SELECT TRUE, current_usage, 0, 0, 'Target plan has unlimited invoices';
        RETURN;
    END IF;
    
    -- Check if user is over the limit
    IF current_usage > target_plan.invoice_limit_monthly THEN
        RETURN QUERY SELECT 
            FALSE, 
            current_usage, 
            target_plan.invoice_limit_monthly,
            current_usage - target_plan.invoice_limit_monthly,
            'User has created ' || current_usage || ' invoices this month, but target plan allows only ' || target_plan.invoice_limit_monthly;
        RETURN;
    END IF;
    
    -- User can be downgraded
    RETURN QUERY SELECT 
        TRUE, 
        current_usage, 
        target_plan.invoice_limit_monthly,
        0,
        'User can be downgraded safely';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION can_user_downgrade_to_plan(UUID, INTEGER) IS 
'Checks if a user can be safely downgraded to a target plan based on their current usage vs target plan limits';

COMMENT ON FUNCTION get_downgrade_protection_info(UUID, INTEGER) IS 
'Returns detailed information about why a user can or cannot be downgraded to a target plan';
