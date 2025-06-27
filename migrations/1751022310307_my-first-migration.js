/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(
    `-- custom type
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro');

    -- users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      account_verified BOOLEAN DEFAULT false,
      tier subscription_tier DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- account_verifications table
    CREATE TABLE IF NOT EXISTS account_verifications (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(100) UNIQUE NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- urls table
    CREATE TABLE IF NOT EXISTS urls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      short_slug VARCHAR(100) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- url_clicks table
    CREATE TABLE IF NOT EXISTS url_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
      clicked_at TIMESTAMPTZ DEFAULT NOW(),
      ip_address VARCHAR(100),
      country VARCHAR(100),
      region VARCHAR(100),
      city VARCHAR(100),
      device TEXT,
      browser TEXT
    );

    -- useful indexes
    CREATE INDEX urls_user_id_idx ON urls(user_id);
    CREATE INDEX url_clicks_url_id_idx ON url_clicks(url_id);`,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(
    `-- drop tables
    DROP TABLE IF EXISTS url_clicks;
    DROP TABLE IF EXISTS urls;
    DROP TABLE IF EXISTS users;

    -- drop custom types
    DROP TYPE IF EXISTS subscription_tier;`,
  );
};
