-- Ensure the database exists
SELECT 'CREATE DATABASE legallens'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'legallens')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE legallens TO postgres;