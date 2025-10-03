-- Enable extensions required for Limpopo Connect

-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For geospatial queries
-- Note: On Azure Database for PostgreSQL, you might need to enable this
-- via the Azure Portal or CLI if this command fails.
-- az postgres flexible-server parameter set --resource-group <rg> --server-name <server> --name azure.extensions --value PostGIS
CREATE EXTENSION IF NOT EXISTS "postgis";

-- For trigram-based text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Optional: For vector-based similarity search (if implementing semantic search)
-- CREATE EXTENSION IF NOT EXISTS "vector";