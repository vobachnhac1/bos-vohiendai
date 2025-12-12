-- Create database if not exists
CREATE DATABASE marine_uat;

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'gps_user') THEN

      CREATE ROLE gps_user LOGIN PASSWORD 'gps_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gps_backend TO gps_user;

-- Connect to the database
\c gps_backend;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
