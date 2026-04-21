-- Postgres-Extensions fuer Kapazito.
-- Wird einmalig beim ersten DB-Start ausgefuehrt.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
-- pgvector fuer RAG (erst wenn die App es nutzt).
-- CREATE EXTENSION IF NOT EXISTS "vector";
