-- Cloud SQL Schema for ACC-DEV
-- Run this against your Cloud SQL PostgreSQL instance

-- Users table (for DB-based authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Styles
CREATE TABLE IF NOT EXISTS styles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT NOT NULL,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Places
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT NOT NULL,
  style_id INTEGER REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  width FLOAT,
  height FLOAT,
  image_url TEXT,
  playground JSONB,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topic history (for tracking changes)
CREATE TABLE IF NOT EXISTS topic_history (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER,
  topic_name TEXT,
  event TEXT,
  old_alias TEXT,
  new_alias TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_styles_topic_id ON styles(topic_id);
CREATE INDEX IF NOT EXISTS idx_places_style_id ON places(style_id);
CREATE INDEX IF NOT EXISTS idx_items_place_id ON items(place_id);
CREATE INDEX IF NOT EXISTS idx_topic_history_topic_id ON topic_history(topic_id);
