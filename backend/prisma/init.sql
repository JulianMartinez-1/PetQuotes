-- Create role if it doesn't exist
DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'pet_quotes'
  ) THEN
    CREATE ROLE pet_quotes WITH LOGIN PASSWORD 'pet_quotes_password';
    ALTER ROLE pet_quotes CREATEDB;
  END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pet_quotes_db TO pet_quotes;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pet_quotes;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pet_quotes;
