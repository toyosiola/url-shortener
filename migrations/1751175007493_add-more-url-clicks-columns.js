/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    -- Rename country column to country_name
    ALTER TABLE url_clicks RENAME COLUMN country TO country_name;
    
    -- Add new columns to url_clicks table
    ALTER TABLE url_clicks 
    ADD COLUMN country_code VARCHAR(10),
    ADD COLUMN continent_name VARCHAR(100),
    ADD COLUMN continent_code VARCHAR(10),
    ADD COLUMN region_code VARCHAR(10),
    ADD COLUMN region_name VARCHAR(100),
    ADD COLUMN operation_system TEXT;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    -- Remove the new columns
    ALTER TABLE url_clicks 
    DROP COLUMN country_code,
    DROP COLUMN continent_name,
    DROP COLUMN continent_code,
    DROP COLUMN region_code,
    DROP COLUMN region_name,
    DROP COLUMN operation_system;
    
    -- Rename country_name back to country
    ALTER TABLE url_clicks RENAME COLUMN country_name TO country;
  `);
};
