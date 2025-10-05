-- Enable extensions required for Limpopo Connect

-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For geospatial queries
-- Note: Some managed Postgres providers may require enabling extensions via their console or CLI if the command fails.
CREATE EXTENSION IF NOT EXISTS "postgis";

-- For trigram-based text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Optional: For vector-based similarity search (if implementing semantic search)
-- CREATE EXTENSION IF NOT EXISTS "vector";