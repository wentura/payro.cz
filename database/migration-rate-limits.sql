-- Migration: Rate limiting support

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_rate_limit(
  key_name TEXT,
  max_limit INTEGER,
  window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  current_count INTEGER;
  current_reset TIMESTAMPTZ;
  new_reset TIMESTAMPTZ;
BEGIN
  SELECT rl.count, rl.reset_at
  INTO current_count, current_reset
  FROM rate_limits rl
  WHERE rl.key = check_rate_limit.key_name
  FOR UPDATE;

  new_reset := NOW() + (window_seconds || ' seconds')::INTERVAL;

  IF current_count IS NULL OR current_reset < NOW() THEN
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (check_rate_limit.key_name, 1, new_reset)
    ON CONFLICT (key)
    DO UPDATE SET count = 1, reset_at = new_reset;

    RETURN QUERY SELECT true, GREATEST(max_limit - 1, 0), new_reset;
    RETURN;
  END IF;

  IF current_count + 1 > max_limit THEN
    RETURN QUERY SELECT false, 0, current_reset;
    RETURN;
  END IF;

  UPDATE rate_limits
  SET count = count + 1
  WHERE key = check_rate_limit.key_name;

  RETURN QUERY SELECT true, GREATEST(max_limit - (current_count + 1), 0), current_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
