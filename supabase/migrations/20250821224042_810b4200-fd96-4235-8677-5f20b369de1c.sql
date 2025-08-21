-- Update any existing crypto_payments to use TCN instead of BTC for test environment
UPDATE crypto_payments 
SET coin_type = 'TCN' 
WHERE coin_type = 'BTC';

-- Ensure the coin_type column can accept TCN values
-- (This is mostly informational as PostgreSQL text columns are flexible)
COMMENT ON COLUMN crypto_payments.coin_type IS 'Supported values: BTC, TCN (Test Coin), and other CoinRemitter supported currencies';