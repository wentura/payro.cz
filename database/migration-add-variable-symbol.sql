-- Migration: Add variable symbol to user_subscriptions
-- Purpose: Store unique 6-digit variable symbols for bank transfer tracking

-- Add variable_symbol column to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(6) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_variable_symbol 
ON user_subscriptions(variable_symbol);

-- Add constraint to ensure 6-digit format (1-999999, no leading zeros)
ALTER TABLE user_subscriptions 
ADD CONSTRAINT chk_variable_symbol_format 
CHECK (variable_symbol ~ '^[1-9][0-9]{5}$');

-- Add comment for documentationa
COMMENT ON COLUMN user_subscriptions.variable_symbol IS 'Unique 6-digit variable symbol for bank transfer identification (format: 1-999999)';

-- Function to generate unique variable symbol
CREATE OR REPLACE FUNCTION generate_unique_variable_symbol()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_symbol VARCHAR(6);
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate random 6-digit number (1-999999)
        new_symbol := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        
        -- Check if symbol already exists
        IF NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE variable_symbol = new_symbol) THEN
            RETURN new_symbol;
        END IF;
        
        attempts := attempts + 1;
        IF attempts > max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique variable symbol after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing subscriptions with variable symbols if they don't have one
UPDATE user_subscriptions 
SET variable_symbol = generate_unique_variable_symbol()
WHERE variable_symbol IS NULL;

-- Make variable_symbol NOT NULL after populating existing records
ALTER TABLE user_subscriptions 
ALTER COLUMN variable_symbol SET NOT NULL;

-- Add trigger to auto-generate variable symbol for new subscriptions
CREATE OR REPLACE FUNCTION set_variable_symbol()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.variable_symbol IS NULL THEN
        NEW.variable_symbol := generate_unique_variable_symbol();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_variable_symbol
    BEFORE INSERT ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_variable_symbol();
