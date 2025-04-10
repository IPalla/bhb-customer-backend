-- SQL script to rename column is_closed to high_demand in locations table (PostgreSQL)
ALTER TABLE locations RENAME COLUMN is_closed TO high_demand; 